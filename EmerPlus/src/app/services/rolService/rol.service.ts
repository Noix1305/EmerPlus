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

  constructor() { }

  // Método para obtener todos los roles
  getRoles(): Rol[] {
    return this.roles;
  }

  // Método para obtener un rol por ID
  // Modificar para aceptar un arreglo de IDs
  getRolByIds(ids: number[]): Rol[] {
    // lógica para obtener roles por un arreglo de IDs
    return ids.map(id => {
      // lógica de búsqueda por id, por ejemplo:
      return this.roles.find(rol => rol.id === id);
    }).filter(rol => rol !== undefined) as Rol[]; // Filtrar los undefined en caso de no encontrar algún rol
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