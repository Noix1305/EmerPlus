import { Injectable } from '@angular/core';
import { Rol } from 'src/app/models/rol';
 // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class RolService {
  // Lista de roles disponibles
  private roles: Rol[] = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Usuario' },
    { id: 3, nombre: 'Bombero' },
    { id: 4, nombre: 'Policía' },
    { id: 5, nombre: 'Ambulancia' },
  ];

  constructor() {}

  // Método para obtener todos los roles
  getRoles(): Rol[] {
    return this.roles;
  }

  // Método para obtener un rol por ID
  getRolById(id: number): Rol | undefined {
    return this.roles.find((rol) => rol.id === id);
  }

  // Método para agregar un nuevo rol (opcional)
  addRol(rol: Rol): void {
    this.roles.push(rol);
  }
  
}
