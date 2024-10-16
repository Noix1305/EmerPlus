import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, ToastController } from '@ionic/angular';
import { Contacto } from 'src/app/models/contacto';
import { Notificacion } from 'src/app/models/notificacion';

import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { ContactosemergenciaService } from 'src/app/services/contactos/contactosemergencia.service';
import { NotificacionService } from 'src/app/services/notificacionService/notificacion.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  usuario: Usuario | null = null;
  contacto: Contacto[] | null = null;
  notificacion: number = 2;

  constructor(
    private alertController: AlertController,
    private emergenciaService: SolicitudDeEmergenciaService,
    private router: Router,
    private _notificacionService: NotificacionService,
    private toastController: ToastController,
    private _contactoService: ContactosemergenciaService
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

  limpiarNotificaciones() {
    this.notificacion = 0;
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
      // Obtener la ubicación en tiempo real
      this.obtenerUbicacionActual().then(async (ubicacion) => {
        if (ubicacion && this.usuario) {
          const nuevaSolicitud: SolicitudDeEmergencia = {
            usuario_id: this.usuario.rut,
            latitud: ubicacion.latitud,  // Latitud obtenida
            longitud: ubicacion.longitud, // Longitud obtenida
            fecha: new Date().toISOString().split('T')[0], // Fecha en formato 'YYYY-MM-DD'
            hora: new Date().toTimeString().split(' ')[0], // Hora en formato 'HH:mm:ss'
            tipo: tipoEmergencia
          };
          // Enviar la solicitud de emergencia
          this.emergenciaService.enviarSolicitud(nuevaSolicitud).subscribe({
            next: () => {
              console.log('Solicitud enviada con éxito');
              // Ahora, obtén la última solicitud
              this.emergenciaService.obtenerUltimaSolicitud().subscribe({
                next: (ultimaSolicitud) => {
                  if (ultimaSolicitud) {
                    const idSolicitud = ultimaSolicitud.id; // Asumiendo que `id` es el campo que necesitas
                    console.log('Id: ' + idSolicitud)
                    if (idSolicitud) {
                      this.enviarNotificacion(tipoEmergencia, idSolicitud);
                    }
                  } else {
                    console.warn('No se encontró la última solicitud.');
                  }
                },
                error: (error) => {
                  console.error('Error al obtener la última solicitud:', error);
                  alert('Error al obtener la última solicitud.');
                }
              });
            },
            error: (error) => {
              console.error('Error al enviar la solicitud', error);
              alert('Hubo un error al enviar la solicitud. Inténtalo nuevamente.');
            }
          });

          //this.enviarNotificacion(tipoEmergencia);
        } else {
          // Caso 3: Ubicación no disponible
          console.error('No se pudo obtener la ubicación.');
          alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos e inténtalo de nuevo.');
        }
      }).catch((error) => {
        // Caso 2: Error obteniendo la ubicación
        console.error('Error al obtener la ubicación:', error);
        alert('Error: La ubicación es requerida para enviar la solicitud.');
      });
    }
  }

  // Simulación de función para obtener ubicación actual
  private obtenerUbicacionActual(): Promise<{ latitud: number, longitud: number } | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude
          });
        }, (error) => {
          reject(error); // Si no se puede obtener la ubicación
        });
      } else {
        reject(null); // El navegador no soporta geolocalización
      }
    });
  }

  enviarNotificacion(tipo: string, nuevoIdSolicitud: number) {
    if (this.usuario) {
      const nuevaNotificacion: Notificacion = {
        usuario_id: this.usuario.rut,
        mensaje: 'Se ha generado una nueva notificación de emergencia por parte de ' + this.usuario.nombre + ' ' + this.usuario.papellido,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        tipo: tipo,
        id_solicitud: nuevoIdSolicitud
      };

      // Enviar la notificación a la base de datos
      this._notificacionService.crearNotificacion(nuevaNotificacion).subscribe({
        next: (response) => {
          console.log('Notificación enviada exitosamente:', response.body);
          this.presentToast('Notificación enviada exitosamente.', 'success');

          // Ahora buscamos el contacto por parámetro
          if (this.usuario) {
            this._contactoService.getContactoPorParametro('rut_usuario', this.usuario.rut).subscribe({
              next: (contactosResponse) => {
                // Aquí asignamos los contactos recibidos
                this.contacto = contactosResponse.body;
                console.info(this.contacto);

                // Si tienes contactos, envía notificación por correo a cada uno
                if (this.contacto && this.contacto.length > 0) {
                  this.contacto.forEach((contacto) => {
                    if (this.usuario) {
                      this._notificacionService.enviarNotificacionCorreo(contacto.correo, nuevaNotificacion, this.usuario);
                    }
                  });
                }
              },
              error: (error) => {
                console.error('Error al obtener contactos:', error);
                this.presentToast('Error al obtener contactos.', 'danger');
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al enviar la notificación:', error);
          this.presentToast('Error al enviar la notificación.', 'danger');
        }
      });

    } else {
      console.error('No se encontró el usuario para enviar la notificación.');
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

  async presentToast(successMessage: string, color: string) {
    const toast = await this.toastController.create({
      message: successMessage,
      duration: 2000, // Duración en milisegundos
      position: 'top', // Posición del Toast
      color: color, // Color del Toast, puedes cambiarlo según tus necesidades
    });
    toast.present();
  }

}
