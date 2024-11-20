import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { NAV_SOLICITUD, RUTA_MAPA, KEY_USER_INFO } from 'src/constantes';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { firstValueFrom } from 'rxjs';  // Importa firstValueFrom
import { SolicitudPatch } from 'src/app/models/solicitudPatch';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';

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

  constructor(
    private router: Router,
    private _usuarioService: UsuarioService,
    private _solicitudService: SolicitudDeEmergenciaService,
    private encriptadorService: EncriptadorService
  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.solicitud = navigation.extras.state[NAV_SOLICITUD] as SolicitudDeEmergencia;
      console.log('Solicitud recibida:', this.solicitud);
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

  asignarSolicitud() {
    if (this.solicitud && this.solicitud.id && this.usuarioSeleccionado) {

      const solicitudPatch: SolicitudPatch = {
        id: this.solicitud?.id,
        estado: 2,
        asignacion: this.usuarioSeleccionado.rut  // Asumiendo que "rut" es el identificador en Usuario
      };

      // Llamada para actualizar la solicitud (método ficticio para enviar la solicitud actualizada)
      this._solicitudService.modificarSolicitud(this.solicitud.id, solicitudPatch).subscribe({
        next: () => {
          console.log('Solicitud asignada con éxito');
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al asignar la solicitud:', error);
        }
      });
    }
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
