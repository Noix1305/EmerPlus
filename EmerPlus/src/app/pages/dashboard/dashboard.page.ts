import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { NotificacionPopoverComponent } from 'src/app/components/notificacionPopover/notificacion-popover/notificacion-popover.component';
import { Contacto } from 'src/app/models/contacto';
import { Notificacion } from 'src/app/models/notificacion';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { ContactosemergenciaService } from 'src/app/services/contactos/contactosemergencia.service';
import { GestorArchivosService } from 'src/app/services/gestorArchivos/gestor-archivos.service';
import { NotificacionService } from 'src/app/services/notificacionService/notificacion.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  usuario: Usuario | null = null;
  contacto: Contacto[] = [];
  notificacion: number = 0;
  defaultEstado: number = 4;
  notificaciones: Notificacion[] = []
  urlImage: string = 'https://ndmnmgusnnmndqwigiyp.supabase.co/storage/v1/object/public/images/Carabineros/undefined_foto_1729471801126.jpg'

  constructor(
    private alertController: AlertController,
    private emergenciaService: SolicitudDeEmergenciaService,
    private router: Router,
    private _notificacionService: NotificacionService,
    private toastController: ToastController,
    private _contactoService: ContactosemergenciaService,
    private popoverController: PopoverController,
    private _gestorArchivos: GestorArchivosService
  ) { }

  async ngOnInit() {

    // Intenta obtener el usuario desde la navegación anterior
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario'];
    if (!this.usuario) {
      const { value } = await Preferences.get({ key: 'userInfo' });

      if (value) {
        this.usuario = JSON.parse(value) as Usuario; // Convierte el JSON a Usuario
      } else {
        console.log('No se encontró el usuario en Preferences.');
      }
    } else {
      console.log('Usuario obtenido desde la navegación:', this.usuario);
    }
    await this.someFunction();
    console.log(this.notificaciones[0].fecha)
  }

  limpiarNotificaciones(ev: MouseEvent) {
    this.mostrarNotificaciones(ev)
    this.notificacion = 0;
  }

  async mostrarNotificaciones(ev: MouseEvent): Promise<void> {
    const popover = await this.popoverController.create({
      component: NotificacionPopoverComponent,
      event: ev, // Pasa el evento para la posición
      componentProps: {
        notificaciones: this.notificaciones // Pasa las notificaciones aquí
      }

    });

    await popover.present();
  }


  carabineros(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('robo', entidad, 4)
  }

  bomberos(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('incendio', entidad, 3)
  }

  ambulancia(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('accidente', entidad, 5)

  }

  contactoEmergencia(entidad: string) {
    // Lógica para enviar una alerta al contacto de emergencia
  }

  async enviarSolicitudDeEmergencia(tipoEmergencia: string, ruta: string, entidad: number) {
    const usuario = this.usuario;

    if (!usuario) {
      console.warn('No hay usuario conectado.');
      return;
    }

    try {
      const alert = await this.alertController.create({
        header: 'Agregar fotografía',
        message: '¿Quieres agregar una fotografía a tu solicitud?',
        buttons: [
          {
            text: 'No subir imagen',
            role: 'cancel',
            handler: () => this.procesarSolicitud(tipoEmergencia, ruta, entidad), // Procesar sin imagen
          },
          {
            text: 'Tomar Foto',
            handler: async () => {
              const fileWithName = await this._gestorArchivos.tomarFotoDesdeCamara(); // Llama a la función para tomar la foto
              if (fileWithName) {
                await this.procesarSolicitud(tipoEmergencia, ruta, entidad, fileWithName); // Procesar con la imagen tomada
              } else {
                console.warn('No se tomó ninguna foto.');
              }
              await alert.dismiss(); // Cierra la alerta después de procesar
            },
          },
          {
            text: 'Galería',
            handler: async () => {
              const file = await this._gestorArchivos.seleccionarFotoDesdeGaleria();
              if (file) {
                await this.procesarSolicitud(tipoEmergencia, ruta, entidad, file);
              }
              await alert.dismiss(); // Cierra la alerta después de procesar
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Error al mostrar la alerta:', error);
      this.mostrarError('No se pudo mostrar la alerta.');
    }
  }

  async descargarImagen(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al descargar la imagen');
      }
      const blob = await response.blob();

      // Crear un enlace para descargar
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = 'nombre-de-la-imagen.jpg'; // El nombre con el que se descargará
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  }

  // Función para mostrar un error
  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present(); // Presentar la alerta de error
  }

  // Nueva función para procesar la solicitud
  async procesarSolicitud(tipoEmergencia: string, ruta: string, entidad: number, image?: File) {
    try {
      const ubicacion = await this.obtenerUbicacionActual();

      if (!ubicacion) {
        throw new Error('No se pudo obtener la ubicación. Verifica los permisos.');
      }

      // Cambiar urlImg a string | undefined
      let urlImg: string | null = null;

      // Si se obtuvo un archivo, súbelo
      if (image) {
        urlImg = await this._gestorArchivos.uploadPhoto(image, ruta); // Usa la función para subir la foto
        console.log('URL Imagen: ' + urlImg);
      }

      if (!this.usuario) {
        throw new Error('No hay usuario autenticado para procesar la solicitud.');
      }

      // Crear la nueva solicitud de emergencia
      const nuevaSolicitud: SolicitudDeEmergencia = {
        usuario_id: this.usuario.rut,
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        tipo: tipoEmergencia,
        estado: this.defaultEstado,
        imageUrl: urlImg, // Esto ahora es compatible
        entidad: entidad
      };

      // Enviar la solicitud de emergencia
      const response = await firstValueFrom(this.emergenciaService.enviarSolicitud(nuevaSolicitud));
      console.log('Solicitud enviada con éxito:', response);

      // Obtener la última solicitud y enviar notificación
      const ultimaSolicitud = await this.emergenciaService.obtenerUltimaSolicitud();

      if (ultimaSolicitud) {
        const idSolicitud = ultimaSolicitud.id; // Esto ahora es seguro
        console.log('Id: ' + idSolicitud);

        if (idSolicitud) {
          this.enviarNotificacion(tipoEmergencia, idSolicitud);
        }
      } else {
        console.warn('No se encontró la última solicitud.');
        alert('No se pudo encontrar la última solicitud. Inténtalo nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);

      if (error instanceof HttpErrorResponse) {
        console.error('Error del servidor:', error.message);
        console.error('Detalles del error:', error.error); // Esto puede dar más información sobre el problema
      }

      alert(error instanceof Error ? error.message : 'Hubo un error al enviar la solicitud. Inténtalo nuevamente.');
    }
  }

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
        id_solicitud: nuevoIdSolicitud,
        estado: 'Enviada'
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
                // Asegúrate de que contactosResponse.body sea un array o null
                if (Array.isArray(contactosResponse.body)) {
                  this.contacto = contactosResponse.body; // Asigna el array a this.contacto
                  console.info(this.contacto);

                  // Si tienes contactos, envía notificación por correo a cada uno
                  if (this.contacto.length > 0) {
                    this.contacto.forEach((contacto) => {
                      if (this.usuario) {
                        this._notificacionService.enviarNotificacionCorreo(contacto.correo, nuevaNotificacion, this.usuario);
                      }
                    });
                  }
                } else {
                  console.warn('No se encontraron contactos o el formato es incorrecto.');
                  this.presentToast('No se encontraron contactos.', 'info');
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

  cargarNotificaciones(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._notificacionService.obtenerNotificaciones().subscribe({
        next: (notificaciones: Notificacion[]) => {
          this.notificaciones = notificaciones;
        },
        error: (error) => {
          console.error('Error al cargar las notificaciones:', error);
          reject(error); // Rechaza la promesa si hay un error
        },
        complete: () => {
          console.log('Carga de notificaciones completa.');
          resolve(); // Resuelve la promesa al completar
        }
      });
    });
  }
  cargarNotificacionesNuevas() {
    const rut = this.usuario?.rut; // Utiliza el operador de encadenamiento opcional

    // Verifica que el rut no sea undefined
    if (!rut) {
      console.error('El RUT del usuario es indefinido.');
      return Promise.reject('RUT indefinido'); // Devuelve una promesa rechazada si el RUT es indefinido
    }

    return new Promise<void>((resolve, reject) => {
      this._notificacionService.obtenerNotificacionesUsuario(rut).subscribe({
        next: (response: HttpResponse<Notificacion[]>) => {
          // Extrae las notificaciones del cuerpo de la respuesta
          this.notificaciones = response.body || []; // Almacena las notificaciones obtenidas
        },
        error: (error) => {
          console.error('Error al cargar las notificaciones:', error);
          reject(error); // Rechaza la promesa si hay un error
        },
        complete: () => {
          console.log('Carga de notificaciones completa.');
          resolve(); // Resuelve la promesa al completar
        }
      });
    });
  }


  async someFunction() {
    await this.cargarNotificacionesNuevas();
    this.notificacion = this.notificaciones.length;
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
