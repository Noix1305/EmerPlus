import { Injectable } from '@angular/core';

// Define la interfaz Rol, ajusta según tu estructura si es necesario
export interface Rol {
  id: number;
  nombre: string;
}

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
    // Puedes agregar validaciones antes de agregar el rol, como verificar que el ID no se repita
    const exists = this.roles.some((existingRol) => existingRol.id === rol.id);
    if (!exists) {
      this.roles.push(rol);
    } else {
      console.error('El rol con este ID ya existe');
    }
  }
}