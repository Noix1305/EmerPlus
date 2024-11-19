import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service'; // Importar el servicio de encriptación

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
    private _encriptadorService: EncriptadorService // Inyectar el servicio de encriptación
  ) { }

  rolUsuarioActivo: string = '';
  usuarioActivo: Usuario | null = null;

  async ngOnInit() {
    await this.presentLoading();

    // Obtener el valor encriptado desde Preferences
    const { value } = await Preferences.get({ key: 'userInfo' });

    if (value) {
      // Desencriptar el valor obtenido
      const decryptedValue = this._encriptadorService.decrypt(value);

      // Parsear el valor desencriptado a un objeto Usuario
      this.usuarioActivo = JSON.parse(decryptedValue) as Usuario;

      if (this.usuarioActivo) {
        // Si obtenerNombreRol devuelve undefined, se asigna 'Desconocido' como valor por defecto
        this.rolUsuarioActivo = await this._rolService.obtenerNombreRol(this.usuarioActivo.rol[0]) || 'Desconocido';
      }
    }
    console.log(this.rolUsuarioActivo);
  }

  // Función para ver todas las solicitudes
  verSolicitudes() {
    this.router.navigate(['/solicitudes']); // Redirigir a una página de solicitudes
  }

  // Función para agregar un nuevo usuario
  agregarUsuario() {
    this.router.navigate(['/agregar-usuario-admin']); // Redirigir a una página para agregar usuarios
  }

  // Función para ver estadísticas
  verEstadisticas() {
    this.router.navigate(['/estadisticas']); // Redirigir a la página de estadísticas
  }

  // Función para gestionar roles de usuarios
  gestionarRoles() {
    this.router.navigate(['/gestor-roles']); // Redirigir a la página para gestionar roles
  }

  solicitudesTecnicas() {
    this.router.navigate(['/soporte']);
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
      this.router.navigate(['/home']);
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 1000,
    });
    await loading.present();
  }
}
