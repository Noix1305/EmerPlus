import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { RolService } from '../rolService/rol.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private currentUser: Usuario | null = null;

  lista_de_usuarios: Usuario[] = [
    {
      username: "usuario",
      password: "usuario123",
      rol: [this._rolService.getRolById(2)!]
    },
    {
      username: "admin",
      password: "admin123",
      rol: [this._rolService.getRolById(1)!]
    },
    {
      username: "bombero",
      password: "bombero123",
      rol: [this._rolService.getRolById(3)!]
    },
    {
      username: "policia",
      password: "policia123",
      rol: [this._rolService.getRolById(4)!]
    },
    {
      username: "ambulancia",
      password: "ambulancia123",
      rol: [this._rolService.getRolById(5)!],
    },

  ];

  constructor(private _rolService: RolService) {}

  encontrar_usuario(userInfo: Usuario) {
    for (let i = 0; i < this.lista_de_usuarios.length; i++) {
      if (this.lista_de_usuarios[i].username === userInfo.username && this.lista_de_usuarios[i].password === userInfo.password) {
        this.currentUser = this.lista_de_usuarios[i];
        return this.lista_de_usuarios[i];
      }
    }
    return null;
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
  
}

