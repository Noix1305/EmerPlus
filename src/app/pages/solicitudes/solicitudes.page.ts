import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { lastValueFrom } from 'rxjs';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { SolicitudPatch } from 'src/app/models/solicitudPatch';
import { Usuario } from 'src/app/models/usuario';
import { EstadoSolicitudService } from 'src/app/services/estadoSolicitud/estado-solicitud.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { HOY, AYER, SEMANA, MES, RUTA_ADMIN, RUTA_DASHBOARD, RUTA_MAPA, RUTA_GESTION_SOLICITUD } from 'src/constantes';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {
  solicitudes: SolicitudDeEmergencia[] = [];
  solicitudPatch: SolicitudPatch | undefined;
  solicitudesFiltradas: SolicitudDeEmergencia[] = [];
  solicitudesAsignadas: SolicitudDeEmergencia[] = [];

  esAdmin = false;
  usuario: Usuario | null = null;
  esUsuario = false;
  esPolicia = false;
  esBombero = false;
  esAmbulancia = false;

  fechaDesde = '';
  fechaHasta = '';
  estadoFiltro = '';
  rolUsuario = 0;

  constructor(
    private _solicitudService: SolicitudDeEmergenciaService,
    private _estadoSolicitudService: EstadoSolicitudService,
    private _usuarioService:UsuarioService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.inicializarDatos();
  }

  private async inicializarDatos() {
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();
    this.solicitudes = [];
    this.solicitudesFiltradas = [];
    await this.cargarSolicitudes();
  }

  private setRolesUsuario() {
    if (this.usuario && this.usuario.rol.length > 0) {
      this.rolUsuario = this.usuario.rol[0];
      this.esUsuario = this.rolUsuario === 2;
      this.esBombero = this.rolUsuario === 3;
      this.esPolicia = this.rolUsuario === 4;
      this.esAmbulancia = this.rolUsuario === 5;
    }
  }

  async filtrar() {
    await this.cargarSolicitudes();
    await this.filtrarSolicitudes();
  }

  async cargarSolicitudes() {
    let solicitudes: SolicitudDeEmergencia[]; // Define solicitudes con el tipo esperado.

    try {
      if (!this.esUsuario) {
        solicitudes = await this._solicitudService.obtenerSolicitudesPorRol(this.rolUsuario);
        console.log('Solicitudes obtenidas desde el servicio:', solicitudes);
      } else {
        // Usa await para obtener el array de solicitudes.
        solicitudes = await this._solicitudService.obtenerSolicitudes();
      }

      solicitudes = await this.procesarSolicitudes(solicitudes);
      console.log('Solicitudes procesadas:', solicitudes);

      solicitudes.forEach(s => console.log('Entidad:', s.entidad));

      // Filtra las solicitudes según el rol del usuario
      this.solicitudes = this.filtrarSolicitudesPorRol(solicitudes);

      if (!this.solicitudes.length) console.warn('No se encontraron solicitudes.');

    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
    }
  }

  private filtrarSolicitudesPorRol(solicitudes: SolicitudDeEmergencia[]): SolicitudDeEmergencia[] {
    switch (this.rolUsuario) {
      case 2: // Usuario puede ver todas sus solicitudes
        return solicitudes.filter(solicitud => solicitud.usuario_id === this.usuario?.rut);
      case 3: // Bomberos
        return solicitudes.filter(solicitud => solicitud.entidad === 3);
      case 4: // Policía
        return solicitudes.filter(solicitud => solicitud.entidad === 4);
      case 5: // Ambulancia
        return solicitudes.filter(solicitud => solicitud.entidad === 5);
      default: // Si el rol no coincide, devolver un array vacío o manejar de otra forma
        return [];
    }
  }

  private async filtrarSolicitudesAsignadas() {
    return this.solicitudes.filter(s => s.asignada === this.usuario?.rut);
  }

  private async verSolicitudesAsignadas() {
    this.solicitudesAsignadas = await this.filtrarSolicitudesAsignadas();
  }

  async filtrarSolicitudes() {
    console.log("Solicitudes antes de filtrar:", this.solicitudes);
    console.log("Fecha desde:", this.fechaDesde, "Fecha hasta:", this.fechaHasta);
    console.log("Estado filtro:", this.estadoFiltro);

    const solicitudesFiltradas = this.solicitudes.filter((solicitud) => {
      const fechaSolicitud = new Date(solicitud.fecha);
      return (
        this.filtrarPorFecha(fechaSolicitud) &&
        this.filtrarPorEstado(solicitud.estado)
      );
    });

    this.solicitudesFiltradas = await this.procesarSolicitudes(solicitudesFiltradas);
    console.log("Solicitudes después de filtrar:", solicitudesFiltradas);
  }

  private filtrarPorFecha(fechaSolicitud: Date): boolean {
    const fechaDesdeDate = this.obtenerFechaFiltro(this.fechaDesde);
    const fechaHastaDate = this.obtenerFechaFiltro(this.fechaHasta);

    console.log("Fecha de la solicitud:", fechaSolicitud);
    console.log("Fecha desde filtro:", fechaDesdeDate, "Fecha hasta filtro:", fechaHastaDate);

    const fechaValida = fechaDesdeDate ? fechaSolicitud >= fechaDesdeDate : true;
    const hastaValida = fechaHastaDate ? fechaSolicitud <= fechaHastaDate : true;
    return fechaValida && hastaValida;
  }

  private obtenerFechaFiltro(fecha: string): Date | null {
    const ahora = Date.now();
    switch (fecha) {
      case HOY: return new Date();
      case AYER: return new Date(ahora - 864e5);
      case SEMANA: return new Date(ahora - 6048e5);
      case MES: return new Date(ahora - 2592e6);
      default: return null;
    }
  }

  private filtrarPorEstado(estado: number): boolean {
    console.log("Estado de la solicitud:", estado, "Estado filtro:", this.estadoFiltro);
    return this.estadoFiltro === '0' || estado === Number(this.estadoFiltro);
  }

  limpiarFiltro() {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.estadoFiltro = '';
    this.solicitudesFiltradas = [];
  }

  async procesarSolicitudes(solicitudes: SolicitudDeEmergencia[]) {
    return Promise.all(
      solicitudes.map(async (solicitud) => {
        const estadoDescripcion = await this._estadoSolicitudService.obtenerNombreRol(solicitud.estado);
        console.log(`Solicitud ID: ${solicitud.id}, Estado: ${solicitud.estado}, Descripción: ${estadoDescripcion}`);
        return { ...solicitud, estadoDescripcion: estadoDescripcion || 'Desconocido' };
      })
    );
  }


  gestionarsolicitud(solicitud: SolicitudDeEmergencia) {
    this.crearSolicitudRecibida(solicitud);
    this.router.navigate([RUTA_GESTION_SOLICITUD], { state: { solicitud } });
  }

  async crearSolicitudRecibida(solicitud: SolicitudDeEmergencia) {
    this.solicitudPatch = {
      id: solicitud?.id,
      estado: 3
    } as SolicitudPatch;

    try {
      // Convierte el Observable en una Promise
      const response = await lastValueFrom(this._solicitudService.modificarSolicitud(this.solicitudPatch.id, this.solicitudPatch));

      const statusCode = response.status;
      console.log('Código de respuesta:', statusCode);
      console.log('Solicitud modificada con éxito:', response.body);

      // Redirige al dashboard después de la actualización exitosa
    } catch (error) {
      console.error('Error al modificar la Solicitud:', error);
    }
  }


  verEnMapa(solicitud: SolicitudDeEmergencia) {
    this.router.navigate([RUTA_MAPA], { state: { solicitud } });
  }

  // generarPDF() {
  //   const doc = new jsPDF();
  //   const title = 'Reporte de Solicitudes de Emergencia';
  //   doc.setFontSize(16);
  //   doc.text(title, 10, 10);

  //   const head = [['ID', 'Tipo', 'Fecha', 'Ubicación']];
  //   const data = this.solicitudesUsuario.map(solicitud => [
  //     solicitud.id,
  //     solicitud.tipo,
  //     solicitud.fecha,
  //     `${solicitud.latitud}, ${solicitud.longitud}`
  //   ]);

  //   (doc as any).autoTable({ head, body: data, startY: 20 });
  //   doc.save('solicitudes_emergencia.pdf');
  // }

  navegar() {
    this.router.navigate([this.esAdmin ? RUTA_ADMIN : RUTA_DASHBOARD]);
  }
}
