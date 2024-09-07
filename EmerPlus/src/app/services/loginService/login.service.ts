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
      username: "usuario",
      password: "usuario123",
      rol: [this.rolService.getRolById(2)!] // Ajusta el rol según tu definición de Rol
    },
    {
      username: "admin",
      password: "admin123",
      rol: [this.rolService.getRolById(1)!]
    },
    {
      username: "bombero",
      password: "bombero123",
      rol: [this.rolService.getRolById(3)!]
    },
    {
      username: "policia",
      password: "policia123",
      rol: [this.rolService.getRolById(4)!]
    },
    {
      username: "ambulancia",
      password: "ambulancia123",
      rol: [this.rolService.getRolById(5)!]
    },
  ];


  constructor(private rolService: RolService, private router: Router) { }

  agregarRolAUsuarioPorId(username: string, rolId: number): void {
    // Obtener el rol por su ID desde el servicio
    const rol = this.rolService.getRolById(rolId);

    if (!rol) {
      console.error('Rol no encontrado');
      return;
    }

    // Buscar el usuario en la lista
    const usuario = this.lista_de_usuarios.find((u) => u.username === username);

    if (usuario) {
      // Agregar el rol al usuario
      usuario.rol.push(rol);
      console.log(`Rol ${rol.nombre} agregado al usuario ${username}`);
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
      // Muestra el nombre de usuario, la contraseña y los nombres de los roles
      console.log(`Username: ${usuario.username}, Password: ${usuario.password}, Rol: ${rolesNombres}`);
    });
  }

  // Función de inicio de sesión
  login(username: string, password: string): Usuario | undefined {
    // Busca el usuario en la lista comparando username y password
    const usuarioEncontrado = this.lista_de_usuarios.find(
      (usuario) => usuario.username === username && usuario.password === password
    );

    // Retorna el usuario encontrado o undefined si no se encontró
    return usuarioEncontrado;
  }


}
