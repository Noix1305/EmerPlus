import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { EstadoSolicitudService } from 'src/app/services/estadoSolicitud/estado-solicitud.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {

  solicitudes: SolicitudDeEmergencia[] = [];
  solicitudesUsuario: SolicitudDeEmergencia[] = []; // Para almacenar las solicitudes del usuario normal
  solicitudesFiltradas: SolicitudDeEmergencia[] = [];
  esAdmin: boolean = false;
  usuario: Usuario | null = null;
  esUsuario: boolean = false;
  esPolicia: boolean = false;
  esBombero: boolean = false;
  esAmbulancia: boolean = false;

  fechaDesde: string = '';
  fechaHasta: string = '';
  estadoFiltro: string = '';
  rolUsuario: number = 0;

  constructor(
    private _solicitudService: SolicitudDeEmergenciaService,
    private _usuarioService: UsuarioService,
    private _estadoSolicitudService: EstadoSolicitudService,
    private router: Router) { }

  ngOnInit() {
    this.solicitudes = [];
    this.solicitudesUsuario = [];
    this.solicitudesFiltradas = [];

    this.cargarSolicitudes();

    this._usuarioService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      if (this.usuario && this.usuario.rol.length > 0) {
        this.rolUsuario = this.usuario.rol[0];
        this.esAdmin = this.rolUsuario === 1;
        this.esUsuario = this.rolUsuario === 2;
        this.esBombero = this.rolUsuario === 3;
        this.esPolicia = this.rolUsuario === 4;
        this.esAmbulancia = this.rolUsuario === 5;
      }
    });
  }

  async filtrar() {
    await this.cargarSolicitudes(); // Cargar las solicitudes primero
    await this.filtrarSolicitudes(); // Luego filtrar las solicitudes
  }

  async cargarSolicitudes() {
    try {
      const solicitudes = await this._solicitudService.obtenerSolicitudes();

      // Filtrar solicitudes según rol
      if (this.esAdmin) {
        // Si es admin, obtiene todas las solicitudes
        this.solicitudes = solicitudes;
        this.solicitudesUsuario = await this.procesarSolicitudes(solicitudes); // Procesar todas las solicitudes para el admin
      } else if (this.esUsuario) {
        // Si es un usuario normal (rol 2), filtra por RUT
        const rutUsuario = this.usuario?.rut; // Asumiendo que el RUT del usuario está en this.usuario
        const solicitudesFiltradas = solicitudes.filter((solicitud) => {
          return solicitud.usuario_id === rutUsuario; // Filtrar por RUT
        });

        this.solicitudes = solicitudesFiltradas; // Solo solicitudes del usuario por RUT
        this.solicitudesUsuario = await this.procesarSolicitudes(solicitudesFiltradas); // Procesar las solicitudes filtradas
      } else {
        // Para otros roles, filtra por entidad
        const solicitudesFiltradas = solicitudes.filter((solicitud) => {
          return solicitud.entidad === this.rolUsuario; // Filtrar por rol
        });

        this.solicitudes = solicitudesFiltradas; // Solo solicitudes del rol del usuario
        this.solicitudesUsuario = await this.procesarSolicitudes(solicitudesFiltradas); // Procesar las solicitudes filtradas
      }

      // Verifica si hay solicitudes cargadas
      if (!this.solicitudes.length) {
        console.warn('No se encontraron solicitudes.');
      }
    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
    }
  }

  async filtrarSolicitudes() {
    const solicitudesFiltradas = this.solicitudes.filter((solicitud) => {
      const fechaSolicitud = new Date(solicitud.fecha);
      const fechaDesdeDate = this.fechaDesde === 'hoy' ? new Date() :
        this.fechaDesde === 'ayer' ? new Date(Date.now() - 864e5) :
          this.fechaDesde === 'semana' ? new Date(Date.now() - 6048e5) :
            this.fechaDesde === 'mes' ? new Date(Date.now() - 2592e6) :
              null;

      const fechaHastaDate = this.fechaHasta === 'hoy' ? new Date() :
        this.fechaHasta === 'ayer' ? new Date(Date.now() - 864e5) :
          this.fechaHasta === 'semana' ? new Date(Date.now() - 6048e5) :
            this.fechaHasta === 'mes' ? new Date(Date.now() - 2592e6) :
              null;

      // Filtrar por fecha
      const fechaValida = fechaDesdeDate ? fechaSolicitud >= fechaDesdeDate : true;
      const hastaValida = fechaHastaDate ? fechaSolicitud <= fechaHastaDate : true;

      // Filtrar por estado usando valores numéricos
      const estadoValido = this.estadoFiltro === '0' || solicitud.estado === Number(this.estadoFiltro); // Comparar como números

      return fechaValida && hastaValida && estadoValido;
    });

    // Procesar las solicitudes filtradas para obtener el estado
    this.solicitudesFiltradas = await this.procesarSolicitudes(solicitudesFiltradas);
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
        const estadoDescripcion = await this._estadoSolicitudService.obtenerNombreRol(solicitud.estado); // Obtener la descripción del estado
        return {
          ...solicitud,
          estadoDescripcion: estadoDescripcion || 'Desconocido', // Asigna la descripción del estado
        };
      })
    );
  }

  verEnMapa(solicitud: SolicitudDeEmergencia) {
    // Navegar a la página de ubicación y pasar los parámetros latitud y longitud
    this.router.navigate(['/ubicacion'], { state: { solicitud } });
  }


  generarPDF() {
    const doc = new jsPDF();

    // Título del PDF
    const title = 'Reporte de Solicitudes de Emergencia';
    doc.setFontSize(16);
    doc.text(title, 10, 10); // (texto, x, y) - Ajusta las coordenadas según sea necesario

    // Encabezado de la tabla
    const head = [['ID', 'Tipo', 'Fecha', 'Ubicación']];

    // Datos de las solicitudes
    const data = this.solicitudesUsuario.map(solicitud => [
      solicitud.id,
      solicitud.tipo,
      solicitud.fecha,
      `${solicitud.latitud}, ${solicitud.longitud}`
    ]);

    (doc as any).autoTable({
      head: head,
      body: data,
      startY: 20, // Para comenzar la tabla debajo del título (ajusta según sea necesario)
    });
    doc.save('solicitudes_emergencia.pdf');
  }

  navegar() {
    if (this.esAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
