import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    this.router.navigate(['/agregar-usuario']); // Redirigir a una página para agregar usuarios
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
  logout() {
    // Implementar lógica de cierre de sesión
    this.router.navigate(['/login']); // Redirigir al login
  }
}
