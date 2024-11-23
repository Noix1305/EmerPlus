import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service'; // Importar el servicio de encriptación
import { RUTA_AGREGAR_USER_ADMIN, RUTA_GESTOR_ROLES, RUTA_SOLICITUDES, RUTA_SOPORTE, KEY_USER_INFO, RUTA_HOME } from 'src/constantes';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  constructor(
    private router: Router,
    private _rolService: RolService,
    private loadingController: LoadingController,
    private _usuarioService: UsuarioService
  ) { }

  rolUsuarioActivo: string = '';
  usuarioActivo: Usuario | null = null;
  rolUsuario: number = 0;

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    await this._usuarioService.cargarUsuario(); // Cargar el usuario desde el servicio
    this.usuarioActivo = this._usuarioService.getUsuario();

    if (this.usuarioActivo) {
      // Si obtenerNombreRol devuelve undefined, se asigna 'Desconocido' como valor por defecto
      this.rolUsuarioActivo = await this._rolService.obtenerNombreRol(this.usuarioActivo.rol[0]) || 'Desconocido';
    }


    this.cargarRolUsuario();
    console.log(this.rolUsuarioActivo);

    loading.dismiss();
  }

  private cargarRolUsuario() {
    if (this.usuarioActivo) {
      this.rolUsuario = this.usuarioActivo.rol[0];
    }
  }

  // Función para ver todas las solicitudes
  verSolicitudes() {
    this.router.navigate([RUTA_SOLICITUDES]); // Redirigir a una página de solicitudes
  }

  // Función para agregar un nuevo usuario
  agregarUsuario() {
    this.router.navigate([RUTA_AGREGAR_USER_ADMIN]); // Redirigir a una página para agregar usuarios
  }

  // Función para gestionar roles de usuarios
  gestionarRoles() {
    this.router.navigate([RUTA_GESTOR_ROLES]); // Redirigir a la página para gestionar roles
  }

  solicitudesTecnicas() {
    this.router.navigate([RUTA_SOPORTE]);
  }

  verSolicitudesBomberos() { }

  verSolicitudesPolicia() { }

  verSolicitudesAmbulancia() { }

  // Función para salir de la sesión
  async cerrarSesion() {
    console.log('Cerrando sesión...'); // Asegúrate de que esto se imprima en la consola
    try {
      // Eliminar datos específicos de Preferences
      await Preferences.clear(); // Elimina solo el campo userInfo

      // Redirigir al usuario a la página de inicio
      this.router.navigate([RUTA_HOME]);
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 500,
    });
    await loading.present();
  }
}
