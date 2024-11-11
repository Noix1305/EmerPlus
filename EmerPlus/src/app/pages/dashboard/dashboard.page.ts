import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, PopoverController } from '@ionic/angular';
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
import { Geolocation } from '@capacitor/geolocation';

import Swal, { SweetAlertIcon } from 'sweetalert2';


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

      const { value: option } = await Swal.fire({
        title: 'Agregar fotografía',
        text: '¿Quieres agregar una fotografía a tu solicitud?',
        showCancelButton: true,
        confirmButtonText: 'Tomar Foto',
        cancelButtonText: 'No subir imagen',
        // Puedes agregar un botón adicional para Galería si lo deseas
        footer: '<ion-button id="galeria-button" color="secondary">Galería</ion-button>',
        heightAuto: false,

      });

      if (option) {
        // Si el usuario seleccionó "Tomar Foto"
        const fileWithName = await this._gestorArchivos.tomarFotoDesdeCamara();
        if (fileWithName) {
          await this.procesarSolicitud(tipoEmergencia, ruta, entidad, fileWithName); // Procesar con la imagen tomada
        } else {
          console.warn('No se tomó ninguna foto.');
        }
      } else {
        // Si el usuario seleccionó "No subir imagen"
        this.procesarSolicitud(tipoEmergencia, ruta, entidad); // Procesar sin imagen
      }

      // Agregar evento para el botón de Galería
      const galeriaButton = document.getElementById('galeria-button');
      if (galeriaButton) {
        galeriaButton.addEventListener('click', async () => {
          const file = await this._gestorArchivos.seleccionarFotoDesdeGaleria();
          if (file) {
            await this.procesarSolicitud(tipoEmergencia, ruta, entidad, file);
          }
          Swal.close(); // Cierra la alerta después de procesar
        });
      }
    } catch (error) {
      console.error('Error al mostrar la alerta:', error);
      this.mostrarSwal('error', 'Error', 'No se pudo mostrar la alerta.');
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

  // Nueva función para procesar la solicitud
  async procesarSolicitud(tipoEmergencia: string, ruta: string, entidad: number, image?: File) {
    try {
      const ubicacion = await this.obtenerUbicacionActual();

      if (!this.usuario) {

        return this.mostrarSwal('warning', 'Error', 'No hay usuario autenticado para procesar la solicitud.');
      }

      if (!ubicacion) {

        return this.mostrarSwal('warning', 'Error', 'No se pudo obtener la ubicación. Verifica los permisos.');
      }

      // Cambiar urlImg a string | undefined
      let urlImg: string | null = null;

      // Si se obtuvo un archivo, súbelo
      if (image) {
        urlImg = await this._gestorArchivos.uploadPhoto(image, ruta); // Usa la función para subir la foto
        console.log('URL Imagen: ' + urlImg);
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
      this.mostrarSwal('success', 'Éxito', 'Solicitud enviada con éxito.')

      // Obtener la última solicitud y enviar notificación
      const ultimaSolicitud = await this.emergenciaService.obtenerUltimaSolicitud();

      if (ultimaSolicitud) {
        const idSolicitud = ultimaSolicitud.id; // Esto ahora es seguro
        console.log('Id: ' + idSolicitud);

        if (idSolicitud) {
          this.enviarNotificacion(tipoEmergencia, idSolicitud);
        }
      } else {
        this.mostrarSwal('warning', 'Error', 'No se pudo encontrar la última solicitud. Inténtalo nuevamente más tarde.')
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      this.mostrarSwal('error', 'Error', 'Error al procesar la solicitud.')

      if (error instanceof HttpErrorResponse) {
        console.error('Error del servidor:', error.message);
        this.mostrarSwal('error', 'Error', 'Hubo un error al enviar la solicitud. Inténtalo nuevamente.')
        console.error('Detalles del error:', error.error); // Esto puede dar más información sobre el problema
      }

      this.mostrarSwal('error', 'Error', 'Hubo un error al enviar la solicitud. Inténtalo nuevamente.')

    }
  }

  private async obtenerUbicacionActual(): Promise<{ latitud: number, longitud: number } | null> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      };
    } catch (error) {
      this.mostrarSwal('warning', 'Error', 'Error al obtener la ubicación.');
      console.error('Error al obtener la ubicación:', error);
      return null; // Maneja el error según sea necesario
    }
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
                  this.mostrarSwal('warning', 'Error', 'No se encontraron contactos.')

                }
              },
              error: (error) => {
                console.error('Error al obtener contactos:', error);
                this.mostrarSwal('error', 'Error', 'Error al obtener contactos.')
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al enviar la notificación:', error);
          this.mostrarSwal('error', 'Error', 'Error al enviar la notificación.')
        }
      });
    } else {
      this.mostrarSwal('error', 'Error', 'No se encontró el usuario para enviar la notificación.')
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

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      text: text,
      heightAuto: false
    });
  }
}
