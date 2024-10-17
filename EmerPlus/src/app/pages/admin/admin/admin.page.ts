import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {

  constructor(private router: Router) { }

  ngOnInit() { }

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

  // Función para salir de la sesión


  async cerrarSesion() {
    console.log('Cerrando sesión...'); // Asegúrate de que esto se imprima en la consola
    try {
      // Eliminar datos específicos de Preferences
      await Preferences.remove({ key: 'userInfo' }); // Elimina solo el campo userInfo

      // Redirigir al usuario a la página de inicio
      this.router.navigate(['/home']);
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
