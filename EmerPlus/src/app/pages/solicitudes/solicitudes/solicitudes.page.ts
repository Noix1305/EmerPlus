import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

  fechaDesde: string = '';
  fechaHasta: string = '';
  estadoFiltro: string = '';

  estanFiltradas: boolean = false;

  constructor(
    private _solicitudService: SolicitudDeEmergenciaService,
    private _usuarioService: UsuarioService,
    private _estadoSolicitudService: EstadoSolicitudService) { }

  ngOnInit() {
    this.cargarSolicitudes();

    this._usuarioService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      if (this.usuario && this.usuario.rol.length > 0) {
        this.esAdmin = this.usuario.rol[0] === 1;
      } else {
        this.esAdmin = false; // Asegúrate de que sea un booleano
      }
    });
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


  async cargarSolicitudes() {
    try {
      const solicitudes = await this._solicitudService.obtenerSolicitudes(); // Espera a que se resuelva la promesa

      if (solicitudes.length > 0) {
        this.solicitudes = solicitudes; // Almacena todas las solicitudes recibidas
        this.solicitudesUsuario = await this.procesarSolicitudes(solicitudes);
      } else {
        console.warn('No se encontraron solicitudes.');
      }
    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
    }
  }

  async procesarSolicitudes(solicitudes: SolicitudDeEmergencia[]) {
    return Promise.all(
      solicitudes.map(async (solicitud) => {
        const estadoDescripcion = await this._estadoSolicitudService.obtenerNombreRol(solicitud.estado); // Obtener la descripción del estado
        console.log('Estado: ' + estadoDescripcion)
        return {
          ...solicitud,
          estadoDescripcion: estadoDescripcion || 'Desconocido', // Asigna la descripción del estado
        };
      })
    );
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
}
