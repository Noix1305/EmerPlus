import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { NotificacionPopoverComponent } from 'src/app/components/notificacionPopover/notificacion-popover/notificacion-popover.component';
import { Contacto } from 'src/app/models/contacto';
import { Notificacion } from 'src/app/models/notificacion';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { ContactosemergenciaService } from 'src/app/services/contactos/contactosemergencia.service';
import { NotificacionService } from 'src/app/services/notificacionService/notificacion.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';
import { SupabaseService } from 'src/app/services/supabase_service/supabase.service';
import { Photo } from 'src/app/models/photo';

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

  constructor(
    private alertController: AlertController,
    private emergenciaService: SolicitudDeEmergenciaService,
    private router: Router,
    private _notificacionService: NotificacionService,
    private toastController: ToastController,
    private _contactoService: ContactosemergenciaService,
    private popoverController: PopoverController,
    private supabaseService: SupabaseService
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
    this.enviarSolicitudDeEmergencia('robo', entidad)
  }

  bomberos(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('incendio', entidad)
  }

  ambulancia(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia('accidente', entidad)

  }

  contactoEmergencia(entidad: string) {
    // Lógica para enviar una alerta al contacto de emergencia
  }

  async enviarSolicitudDeEmergencia(tipoEmergencia: string, entidad: string) {
    if (this.usuario) {
      try {
        const alert = await this.alertController.create({
          header: 'Agregar fotografía',
          message: '¿Quieres agregar una fotografía a tu solicitud?',
          buttons: [
            {
              text: 'No subir imagen',
              role: 'cancel',
              handler: async () => {
                console.warn('Se presionó No subir imagen. Procediendo sin imagen.');
                await this.procesarSolicitud(tipoEmergencia);
                this.mostrarAlerta(entidad);
              },
            },
            {
              text: 'Aceptar',
              handler: async () => {
                const image = await this.tomarFoto();
                try {
                  if (image) {
                    // Usa image.webPath y image.fileName
                    await this.procesarSolicitud(tipoEmergencia, image);
                  } else {
                    console.warn('No se seleccionó ninguna imagen. Procediendo sin imagen.');
                    await this.procesarSolicitud(tipoEmergencia, null);
                  }
                  this.mostrarAlerta(entidad);
                } catch (error) {
                  console.error('Error al procesar la solicitud:', error);
                }
              },
            },
          ],
        });

        await alert.present();
      } catch (error) {
        console.error('Error al mostrar la alerta:', error);
      }
    } else {
      console.warn('No hay usuario conectado.');
    }
  }

  async convertUriToFile(uri: string, fileName: string): Promise<File> {
    // Realiza una solicitud para obtener el archivo
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convierte el blob en un objeto File
    return new File([blob], fileName, { type: blob.type });
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




  // Función para tomar una foto o seleccionar una imagen
  async tomarFoto(): Promise<{ webPath: string; fileName: string } | null> {
    try {
      // Intenta tomar la foto desde la cámara
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri, // Para obtener la imagen como URI
        source: CameraSource.Camera, // Abrir la cámara
        quality: 90, // Calidad de la imagen
      });

      // Si se obtuvo la imagen desde la cámara
      if (image && image.webPath) {
        return {
          webPath: image.webPath,
          fileName: 'foto_' + new Date().getTime() + '.jpg', // Genera un nombre de archivo único
        };
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }

    // Si falló al tomar la foto, intenta usar el input de archivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement;

    return new Promise((resolve) => {
      // Agrega un listener para el evento change
      fileInput.addEventListener('change', async (event) => {
        const target = event.target as HTMLInputElement; // Asegúrate de que sea un HTMLInputElement
        const files = target.files; // Accede a files de forma segura

        if (files && files.length > 0) { // Verifica que files no sea null y tenga al menos un archivo
          const file = files[0]; // Obtiene el primer archivo seleccionado
          const publicUrl = await this.supabaseService.uploadImage2(file);

          if (publicUrl) {
            console.log('URL pública de la imagen:', publicUrl);
            resolve({
              webPath: publicUrl, // Retorna la URL pública
              fileName: file.name, // Usa el nombre original del archivo
            });
          } else {
            console.error('No se pudo subir la imagen.');
            resolve(null);
          }
        } else {
          console.error('No se seleccionó ninguna imagen.');
          resolve(null);
        }
      });

      // Simula un clic en el input de archivo para abrir el selector de archivos
      fileInput.click();
    });
  }





  async seleccionarImagenDesdeEquipo() {
    try {
      const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
      if (fileInput) {
        fileInput.click(); // Simula un clic en el input para abrir el selector de archivos
        return new Promise((resolve) => {
          fileInput.onchange = () => {
            const file = fileInput.files ? fileInput.files[0] : null; // Obtiene el archivo seleccionado
            if (file) {
              resolve(file); // Resuelve con el archivo seleccionado
            } else {
              resolve(null); // Resuelve con null si no hay archivo
            }
          };
        });
      } else {
        console.error('No se encontró el input de archivo');
        return null; // Retornar null si no se encuentra el input
      }
    } catch (error) {
      console.error('Error al seleccionar imagen desde el equipo:', error);
      return null; // Retornar null en caso de error
    }
  }

  async handleFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Obtiene el primer archivo seleccionado
      const publicUrl = await this.supabaseService.uploadFile(file);

    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.supabaseService.uploadImage2(file); // Llama a tu función de subir imagen
    } else {
      console.error('No se seleccionó ningún archivo.');
    }
  }


  // Nueva función para procesar la solicitud
  async procesarSolicitud(tipoEmergencia: string, image?: any) {
    try {
      // Obtener la ubicación en tiempo real
      let urlImg = null;

      const ubicacion = await this.obtenerUbicacionActual();
      if (image) {
        urlImg = await this.supabaseService.uploadImage2(image);
      }

      if (ubicacion && this.usuario) {
        const nuevaSolicitud: SolicitudDeEmergencia = {
          usuario_id: this.usuario.rut,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0],
          tipo: tipoEmergencia,
          estado: this.defaultEstado,
          image_url: urlImg || undefined, // Asegúrate de pasar undefined si urlImg es null
        };

        // Enviar la solicitud de emergencia
        const response = await firstValueFrom(this.emergenciaService.enviarSolicitud(nuevaSolicitud));
        console.log('Solicitud enviada con éxito');

        // Ahora, obtén la última solicitud
        const ultimaSolicitud = await this.emergenciaService.obtenerUltimaSolicitud();

        if (ultimaSolicitud) {
          const idSolicitud = ultimaSolicitud.id; // Asumiendo que `id` es el campo que necesitas
          console.log('Id: ' + idSolicitud);

          if (idSolicitud) {
            this.enviarNotificacion(tipoEmergencia, idSolicitud);
          }
        } else {
          console.warn('No se encontró la última solicitud.');
        }
      } else {
        console.error('No se pudo obtener la ubicación.');
        alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos e inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud o al obtener la ubicación:', error);
      alert('Hubo un error al enviar la solicitud o al obtener la ubicación. Inténtalo nuevamente.');
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


  // Simulación de función para obtener ubicación actual
  // async obtenerUbicacionActual(): Promise<{ latitud: number; longitud: number } | null> {
  //   try {
  //     // Solicitar permiso para acceder a la ubicación
  //     const permission = await Geolocation.requestPermissions();
  //     if (permission.location === 'granted') {
  //       // Obtener la posición actual
  //       const position = await Geolocation.getCurrentPosition();
  //       return {
  //         latitud: position.coords.latitude,
  //         longitud: position.coords.longitude,
  //       };
  //     } else {
  //       console.error('Permiso de ubicación denegado');
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Error al obtener la ubicación:', error);
  //     return null;
  //   }
  // }

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
