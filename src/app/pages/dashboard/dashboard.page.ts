import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { LoadingController, PopoverController } from '@ionic/angular';
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
import { ACCIDENTE, AMBULANCIA, BOMBERO, ESTADO_ENVIADA, INCENDIO, POLICIA, ROBO, SWAL_ERROR, SWAL_INFO, SWAL_SUCCESS, SWAL_WARN } from 'src/constantes';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';


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
  intervalId: any;
  isLoadingNotificaciones: boolean = false;


  constructor(
    private emergenciaService: SolicitudDeEmergenciaService,
    private _usuarioService: UsuarioService,
    private _notificacionService: NotificacionService,
    private _contactoService: ContactosemergenciaService,
    private popoverController: PopoverController,
    private _gestorArchivos: GestorArchivosService,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    await this._usuarioService.cargarUsuario(); // Cargar el usuario desde el servicio
    this.usuario = this._usuarioService.getUsuario();

    // Cargar las notificaciones solo si no está en proceso de carga
    if (!this.isLoadingNotificaciones) {
      this.isLoadingNotificaciones = true;
      await this.cargarNotificacionesNuevas();
      this.isLoadingNotificaciones = false; // Restablecer el estado
    }

    // Iniciar el intervalo para cargar notificaciones cada 10 segundos (10,000 ms)
    setInterval(() => {
      console.log('Cargando Notificaciones');
      if (!this.isLoadingNotificaciones) {
        this.isLoadingNotificaciones = true;
        this.cargarNotificacionesNuevas().then(() => {
          this.isLoadingNotificaciones = false;
        });
      }
    }, 10000);

    loading.dismiss();
  }

  limpiarNotificaciones(ev: MouseEvent) {
    this.mostrarNotificaciones(ev)
    this.notificacion = 0;
  }

  async mostrarNotificaciones(ev: MouseEvent): Promise<void> {
    // Verifica si hay notificaciones
    if (this.notificaciones && this.notificaciones.length > 0) {
      // Si hay notificaciones, muestra el popover
      const popover = await this.popoverController.create({
        component: NotificacionPopoverComponent,
        event: ev, // Pasa el evento para la posición
        componentProps: {
          notificaciones: this.notificaciones // Pasa las notificaciones aquí
        }
      });

      await popover.present();
    } else {
      // Si no hay notificaciones, muestra el Swal
      this.mostrarSwal(SWAL_INFO, 'Sin notificaciones', 'No hay notificaciones nuevas.');
    }
  }


  carabineros(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia(ROBO, entidad, POLICIA)
  }

  bomberos(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia(INCENDIO, entidad, BOMBERO)
  }

  ambulancia(entidad: string) {
    // Lógica para realizar una llamada a emergencias
    this.enviarSolicitudDeEmergencia(ACCIDENTE, entidad, AMBULANCIA)

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
      this.mostrarSwal(SWAL_ERROR, 'Error', 'No se pudo mostrar la alerta.');
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

        return this.mostrarSwal(SWAL_WARN, 'Error', 'No hay usuario autenticado para procesar la solicitud.');
      }

      if (!ubicacion) {

        return this.mostrarSwal(SWAL_WARN, 'Error', 'No se pudo obtener la ubicación. Verifica los permisos.');
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
      this.mostrarSwal(SWAL_SUCCESS, 'Éxito', 'Solicitud enviada con éxito.')

      // Obtener la última solicitud y enviar notificación
      const ultimaSolicitud = await this.emergenciaService.obtenerUltimaSolicitud();

      if (ultimaSolicitud) {
        const idSolicitud = ultimaSolicitud.id; // Esto ahora es seguro
        console.log('Id: ' + idSolicitud);

        if (idSolicitud) {
          this.enviarNotificacion(tipoEmergencia, idSolicitud);
        }
      } else {
        this.mostrarSwal(SWAL_WARN, 'Error', 'No se pudo encontrar la última solicitud. Inténtalo nuevamente más tarde.')
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al procesar la solicitud.')

      if (error instanceof HttpErrorResponse) {
        console.error('Error del servidor:', error.message);
        this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un error al enviar la solicitud. Inténtalo nuevamente.')
        console.error('Detalles del error:', error.error); // Esto puede dar más información sobre el problema
      }

      this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un error al enviar la solicitud. Inténtalo nuevamente.')

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
      this.mostrarSwal(SWAL_WARN, 'Error', 'Error al obtener la ubicación.');
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
        estado: ESTADO_ENVIADA
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
                  this.mostrarSwal(SWAL_WARN, 'Error', 'No se encontraron contactos.')

                }
              },
              error: (error) => {
                console.error('Error al obtener contactos:', error);
                this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al obtener contactos.')
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al enviar la notificación:', error);
          this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al enviar la notificación.')
        }
      });
    } else {
      this.mostrarSwal(SWAL_ERROR, 'Error', 'No se encontró el usuario para enviar la notificación.')
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
  async cargarNotificacionesNuevas() {
    if (!this.usuario?.rut) {
      console.error('El RUT del usuario es indefinido.');
      return Promise.reject('RUT indefinido');
    }

    try {
      const response = await firstValueFrom(this._notificacionService.obtenerNotificacionesUsuario(this.usuario.rut));

      // Acceder a `body` que es donde está el array
      const notificaciones = response.body;

      if (Array.isArray(notificaciones)) {
        const cantidadAnterior = this.notificaciones.length;  // Cantidad antes de cargar nuevas
        this.notificaciones = notificaciones;  // Guardar las nuevas notificaciones
        this.notificacion = this.notificaciones.length;  // Actualizar el contador de notificaciones

        // Comparar las longitudes de los arrays
        if (this.notificaciones.length > cantidadAnterior) {
          // Si el número de notificaciones nuevas es mayor, mostrar una alerta
          const nuevaNotificacion = this.notificaciones.length - cantidadAnterior;  // Cuántas nuevas notificaciones
          Swal.fire({
            title: '¡Nuevas Notificaciones!',
            text: `Tienes ${nuevaNotificacion} nueva(s) notificación(es).`,
            icon: 'info',
            heightAuto: false,
            confirmButtonText: 'Ok',
          });
        }
      } else {
        console.error('Las notificaciones no están en formato de array:', notificaciones);
      }
    } catch (error) {
      console.error('Error al cargar las notificaciones:', error);
    }
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
