import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { RolService } from '../rolService/rol.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private currentUser: Usuario | null = null;
  private passEncriptada: string = "";

  lista_de_usuarios: Usuario[] = [
    {
      rut: "usuario",
      password: "ufatsufatairimesober123",
      rol: [this._rolService.getRolById(2)!]
    },
    {
      rut: "admin",
      password: "aidmimesn123",
      rol: [this._rolService.getRolById(1)!]
    },
    {
      rut: "bombero",
      password: "bobermbenterrober123",
      rol: [this._rolService.getRolById(3)!]
    },
    {
      rut: "policia",
      password: "policia123",
      rol: [this._rolService.getRolById(4)!]
    },
    {
      rut: "ambulancia",
      password: "poberlimescimesai123",
      rol: [this._rolService.getRolById(5)!],
    },

  ];

  constructor(private _rolService: RolService) { }


  encontrar_usuario(rut: string, password: string): Usuario | undefined {
    this.passEncriptada= this.encryptText(password);
    for (let i = 0; i < this.lista_de_usuarios.length; i++) {
      if (this.lista_de_usuarios[i].rut === rut && this.lista_de_usuarios[i].password === this.passEncriptada) {
        this.currentUser = this.lista_de_usuarios[i];
        console.log(this.currentUser);
        return this.currentUser;
      }
    }
    return undefined;
  }

  mostrarUsuarios() {
    // Recorre cada usuario dentro de la lista_de_usuarios
    this.lista_de_usuarios.forEach((usuario) => {
      // Extrae los nombres de los roles del usuario y los convierte en una cadena separada por comas
      // usuario.rol es un array de roles, y map() toma cada rol y extrae su nombre
      const rolesNombres = usuario.rol.map((rol) => rol.nombre).join(', ');

      // Imprime en la consola los detalles del usuario
      // Muestra el nombre de usuario, la contraseña y los nombres de los roles
      console.log(`Username: ${usuario.rut}, Password: ${usuario.password}, Rol: ${rolesNombres}`);
    });
  }

  encryptText(password: string): string {
    // Reemplaza cada letra según las reglas de encriptación
    const encryptedText = password
      .replace(/e/g, 'enter')
      .replace(/i/g, 'imes')
      .replace(/a/g, 'ai')
      .replace(/o/g, 'ober')
      .replace(/u/g, 'ufat');
  
    return encryptedText;
  }
}  

