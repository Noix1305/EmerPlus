import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from '../rolService/rol.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // Define la lista de usuarios con roles asignados
  lista_de_usuarios: Usuario[] = [
    {
      rut: "17799487-1",
      password: "usuario123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: 947421590,
      rol: [this.rolService.getRolById(2)!]
    },
    {
      rut: "admin",
      password: "admin123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: 947421590,
      rol: [this.rolService.getRolById(1)!]
    },
    {
      rut: "bombero",
      password: "bombero123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: 947421590,
      rol: [this.rolService.getRolById(3)!]
    },
    {
      rut: "policia",
      password: "policia123",
      nombre: "Jose",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: 947421590,
      rol: [this.rolService.getRolById(4)!]
    },
    {
      rut: "ambulancia",
      password: "ambulancia123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: 947421590,
      rol: [this.rolService.getRolById(5)!]
    },
  ];


  constructor(private rolService: RolService, private router: Router) { }

  agregarRolAUsuarioPorId(rut: string, rolId: number): void {
    // Obtener el rol por su ID desde el servicio
    const rol = this.rolService.getRolById(rolId);

    if (!rol) {
      console.error('Rol no encontrado');
      return;
    }

    // Buscar el usuario en la lista
    const usuario = this.lista_de_usuarios.find((u) => u.rut === rut);

    if (usuario) {
      // Agregar el rol al usuario
      usuario.rol.push(rol);
      console.log(`Rol ${rol.nombre} agregado al usuario ${rut}`);
    } else {
      console.error('Usuario no encontrado');
    }
  }

  mostrarUsuarios() {
    // Recorre cada usuario dentro de la lista_de_usuarios
    this.lista_de_usuarios.forEach((usuario) => {
      // Extrae los nombres de los roles del usuario y los convierte en una cadena separada por comas
      // usuario.rol es un array de roles, y map() toma cada rol y extrae su nombre
      const rolesNombres = usuario.rol.map((rol) => rol.nombre).join(', ');

      // Imprime en la consola los detalles del usuario
      console.log(`Username: ${usuario.rut}, 
        Password: ${usuario.password}, 
        Nombre: ${usuario.nombre}, 
        Primer Apellido: ${usuario.pApellido}, 
        Segundo Apellido: ${usuario.sApellido}, 
        Teléfono: ${usuario.telefono}, 
        Región: ${usuario.region}, 
        Comuna: ${usuario.comuna}, 
        Contacto de Emergencia: ${usuario.contactoEmergencia}, 
        Rol: ${rolesNombres}`);

    });
  }

  // Función de inicio de sesión
  login(username: string, password: string): Usuario | undefined {
    // Busca el usuario en la lista comparando username y password
    const usuarioEncontrado = this.lista_de_usuarios.find(
      (usuario) => usuario.rut === username && usuario.password === password
    );

    // Retorna el usuario encontrado o undefined si no se encontró
    return usuarioEncontrado;
  }

  isRUTExist(rut: string): boolean {
    return this.lista_de_usuarios.some(usuario => usuario.rut === rut);
  }


}