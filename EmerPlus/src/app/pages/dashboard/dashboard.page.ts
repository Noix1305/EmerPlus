import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';

import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  usuario: Usuario | null = null;

  constructor(
    private alertController: AlertController,
    private emergenciaService: SolicitudDeEmergenciaService,
    private router: Router,
  ) { }

  async ngOnInit() {
    // Intenta obtener el usuario desde la navegación anterior
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario'];
    if (!this.usuario) {
      const { value } = await Preferences.get({ key: 'userInfo' });

      if (value) {
        this.usuario = JSON.parse(value) as Usuario; // Convierte el JSON a Usuario
        console.log('Usuario obtenido de Preferences:', this.usuario);
      } else {
        console.log('No se encontró el usuario en Preferences.');
      }
    } else {
      console.log('Usuario obtenido desde la navegación:', this.usuario);
    }
  }

  carabineros(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('robo')
    this.mostrarAlerta(entidad);
  }

  bomberos(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('incendio')
    this.mostrarAlerta(entidad);
  }

  ambulancia(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('accidente')
    this.mostrarAlerta(entidad);
  }

  contactoEmergencia(entidad: string) {
    // Lógica para enviar una alerta al contacto de emergencia
  }

  enviarSolicitudDeEmergencia(tipoEmergencia: string) {
    if (this.usuario) {
      const nuevaSolicitud: SolicitudDeEmergencia = {
        usuario_id: this.usuario?.rut,
        latitud: -33.4489,  // Latitud fija
        longitud: -70.6693, // Longitud fija
        fecha: new Date().toISOString().split('T')[0], // Obtiene la fecha actual en formato 'YYYY-MM-DD'
        hora: new Date().toTimeString().split(' ')[0], // Obtiene la hora actual en formato 'HH:mm:ss'
        tipo: tipoEmergencia
      };

      this.emergenciaService.enviarSolicitud(nuevaSolicitud).subscribe({
        next: (respuesta) => {
          console.log('Solicitud enviada con éxito', respuesta);
        },
        error: (error) => {
          console.error('Error al enviar la solicitud', error);
          // if (error.status === 409) {
          //   console.error('Conflicto: ', error.error); // Aquí puedes ver más detalles del conflicto
          // }
        }
      });
    }

  }

  async mostrarAlerta(entidad: string) {
    const alert = await this.alertController.create({
      header: 'Notificación Enviada a ' + entidad,
      message: 'La Notificación ya fue enviada',
      buttons: [
        {
          text: 'OK',
          role: 'accept',
          cssClass: 'secondary',
          handler: () => {
            console.log('OK');
          }
        }]
    })
    await alert.present();
  }

}
