import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { NAV_SOLICITUD, RUTA_MAPA, KEY_USER_INFO, SWAL_WARN, SWAL_ERROR, SWAL_SUCCESS } from 'src/constantes';
import { firstValueFrom } from 'rxjs';  // Importa firstValueFrom
import { SolicitudPatch } from 'src/app/models/solicitudPatch';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestionar-solicitud',
  templateUrl: './gestionar-solicitud.page.html',
  styleUrls: ['./gestionar-solicitud.page.scss'],
})
export class GestionarSolicitudPage implements OnInit {
  solicitud: SolicitudDeEmergencia | undefined;
  usuarios: Usuario[] = [];  // Lista de usuarios
  usuarioSeleccionado: Usuario | undefined;  // Usuario seleccionado

  // Estado del modal
  modalAbierto: boolean = false;
  tipoUsuarioAdmin: boolean = false;

  constructor(
    private router: Router,
    private _usuarioService: UsuarioService,
    private _solicitudService: SolicitudDeEmergenciaService,
  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.solicitud = navigation.extras.state[NAV_SOLICITUD] as SolicitudDeEmergencia;
      this.tipoUsuarioAdmin = navigation.extras.state['tipoUsuarioAdmin'] as boolean;

      console.log('Solicitud recibida:', this.solicitud);
      console.log('Tipo de usuario admin:', this.tipoUsuarioAdmin);
    }

    // Obtener el usuario activo de Preferences y desencriptarlo
    // Cargar usuarios según el rol del usuario activo
    this.getUsuariosPorRol();
  }

  // Obtener usuarios según el rol del usuario activo
  async getUsuariosPorRol() {

    if (this.solicitud) {
      try {
        const response = await firstValueFrom(this._usuarioService.getUsuarioPorRol(this.solicitud?.entidad));
        this.usuarios = response.body || [];
        console.log('Usuarios encontrados:', this.usuarios);
      } catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
      }
    } else {
      console.error('Rol del usuario activo no disponible');
    }
  }

  ejecutarSolicitud() {
    if (this.solicitud && this.solicitud.id) {
      const solicitudPatch: SolicitudPatch = {
        id: this.solicitud?.id,
        estado: 2 //En ejecución
      };

      this.modificarSolicitud(solicitudPatch);
    }
  }

  solicitudAtendida() {
    if (this.solicitud && this.solicitud.id) {
      const solicitudPatch: SolicitudPatch = {
        id: this.solicitud?.id,
        estado: 1 //Atendida
      };
      this.modificarSolicitud(solicitudPatch);
    }

  }

  verImagen() {
    Swal.fire({
      html: `<div class="swal-image-container">
               <img src="${this.solicitud?.imageUrl}" alt="Imagen" style="width: 100%; max-height: 80vh; object-fit: contain;" id="swal-image" />
             </div>`,
      showCloseButton: true,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        popup: 'swal-popup-image'
      },
      didOpen: () => {
        // Usamos un pequeño retraso para asegurarnos de que la imagen esté disponible
        setTimeout(() => {
          const image = document.getElementById('swal-image') as HTMLImageElement;
          if (image) {
            let scale = 1;

            // Función para aplicar el zoom
            const applyZoom = (e: WheelEvent) => {
              e.preventDefault();
              if (e.deltaY > 0) {
                scale = Math.max(scale - 0.1, 1); // Zoom out
              } else {
                scale = Math.min(scale + 0.1, 3); // Zoom in
              }
              image.style.transform = `scale(${scale})`;
            };

            image.addEventListener('wheel', applyZoom);
          }
        }, 50);  // 50ms de retraso para asegurar que el DOM está listo
      },
      willClose: () => {
        const image = document.getElementById('swal-image') as HTMLImageElement;
        if (image) {
          image.removeEventListener('wheel', applyZoom);
        }
      }
    });
  }

  asignarSolicitud() {
    if (this.solicitud && this.solicitud.id && this.usuarioSeleccionado) {

      const solicitudPatch: SolicitudPatch = {
        id: this.solicitud?.id,
        asignacion: this.usuarioSeleccionado.rut  // Asumiendo que "rut" es el identificador en Usuario
      };

      // Llamada para actualizar la solicitud (método ficticio para enviar la solicitud actualizada)
      this.modificarSolicitud(solicitudPatch);
    }
  }

  modificarSolicitud(solicitud: SolicitudPatch) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas modificar el estado de la solicitud?',
      icon: SWAL_WARN,
      showCancelButton: true,
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true, // Opcional: cambia el orden de los botones
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, se ejecuta la modificación
        this._solicitudService.modificarSolicitud(solicitud.id, solicitud).subscribe({
          next: () => {
            console.log('Solicitud en Ejecución con éxito');
            this.cerrarModal();
            Swal.fire({
              title: 'Ejecutada',
              text: 'La solicitud ha sido modificada.',
              icon: SWAL_SUCCESS,
              heightAuto: false
            });
          },
          error: (error) => {
            console.error('Error al ejecutar la solicitud:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al modificar la solicitud.',
              icon: SWAL_ERROR,
              heightAuto: false
            });
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si el usuario cancela, solo se muestra un mensaje y no se realiza ninguna acción
        console.log('La modificación fue cancelada');
        Swal.fire({
          title: 'Cancelada',
          text: 'La modificación de la solicitud ha sido cancelada.',
          icon: 'info',
          heightAuto: false
        });
      }
    });

  }

  // Ver la solicitud en el mapa
  verEnMapa(solicitud: SolicitudDeEmergencia) {
    this.router.navigate([RUTA_MAPA], { state: { solicitud } });
  }

  // Mostrar los usuarios (puedes usarlo para abrir un modal o desplegar la lista)
  mostrarUsuarios() {
    console.log('Mostrar opciones de usuarios');
    this.modalAbierto = true;  // Abre el modal (o puede ser cualquier acción para mostrar la lista)
  }

  seleccionarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    console.log('Usuario seleccionado:', usuario);
  }

  // Cerrar el modal de usuarios
  cerrarModal() {
    this.modalAbierto = false;
  }


}
function applyZoom(this: HTMLImageElement, ev: WheelEvent) {
  throw new Error('Function not implemented.');
}

