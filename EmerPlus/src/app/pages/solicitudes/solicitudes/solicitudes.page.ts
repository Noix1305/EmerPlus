import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {

  solicitudes: SolicitudDeEmergencia[] = [];

  constructor(private solicitudService: SolicitudDeEmergenciaService) { }

  ngOnInit() {
    this.cargarSolicitudes();
  }

  async cargarSolicitudes() {
    try {
      const solicitudes = await this.solicitudService.obtenerSolicitudes(); // Espera a que se resuelva la promesa
      if (solicitudes.length > 0) {
        this.solicitudes = solicitudes; // Almacena las solicitudes recibidas

        // Aquí puedes acceder a propiedades específicas de la primera solicitud
        const primeraSolicitud = this.solicitudes[0];
        console.log('Primera Solicitud:', primeraSolicitud);

        // Ejemplo: acceder a una propiedad llamada 'tipo'
        if (primeraSolicitud.tipo) {
          console.log('Tipo de la primera solicitud:', primeraSolicitud.tipo);
        }

        // Realiza cualquier otra acción que necesites con la primera solicitud

      } else {
        console.warn('No se encontraron solicitudes.');
      }
    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
    }
  }

  generarPDF() {
    const doc = new jsPDF();

    // Título del PDF
    const title = 'Reporte de Solicitudes de Emergencia';
    doc.setFontSize(16);
    doc.text(title, 10, 10); // (texto, x, y) - Ajusta las coordenadas según sea necesario

    // Encabezado de la tabla
    const head = [['Tipo', 'Fecha', 'Ubicación']];

    // Datos de las solicitudes
    const data = this.solicitudes.map(solicitud => [
      solicitud.tipo,
      solicitud.fecha,
      `${solicitud.latitud}, ${solicitud.longitud}`
    ]);

    // Generar la tabla
    (doc as any).autoTable({
      head: head,
      body: data,
      startY: 20, // Para comenzar la tabla debajo del título (ajusta según sea necesario)
    });

    doc.save('solicitudes_emergencia.pdf');
  }

}
