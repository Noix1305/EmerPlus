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
      password: "u#f0a&tsu#f0a&t!a%i&ri#m0e%so#b%e&r123",
      nombre: "Nombre",
      pApellido: "Pino",
      sApellido: "Araya",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: {
        rut_usuario:"17799487-1",
        nombre: "Juan Pérez",
        telefono: 912345678,
        correo:"juanperez@gmail.com",
        relacion: "Amigo"
      },
      rol: [this.rolService.getRolByIds([2])[0]!]
    },
    {
      rut: "admin",
      password: "!a%i&dmi#m0e%sn123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: undefined,
      rol: [this.rolService.getRolByIds([1])[0]!]
    },
    {
      rut: "bombero",
      password: "bo#b%e&rmbe#n=t0e!r%ro#b%e&r123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: undefined,
      rol: [this.rolService.getRolByIds([3])[0]!]
    },
    {
      rut: "policia",
      password: "po#b%e&rli#m0e%sci#m0e%s!a%i&123",
      nombre: "Jose",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: undefined,
      rol: [this.rolService.getRolByIds([4])[0]!]
    },
    {
      rut: "ambulancia",
      password: "!a%i&mbu#f0a&tl!a%i&nci#m0e%s!a%i&123",
      nombre: "Nombre",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: undefined,
      rol: [this.rolService.getRolByIds([5])[0]!]
    },
  ];


  constructor(private rolService: RolService, private router: Router) { }

  agregarUsuario(usuario: Usuario): void {
    this.lista_de_usuarios.push(usuario);
    console.log('Usuario agregado:', usuario);
  }

  agregarRolAUsuarioPorId(rut: string, rolId: number) {
    // Obtener el rol por su ID desde el servicio
    const roles = this.rolService.getRolByIds([rolId]); // Esto retorna un arreglo de roles

    // Verificar si se encontró al menos un rol
    if (!roles || roles.length === 0) {
      console.error('Rol no encontrado');
      return;
    }

    // Extraer el primer rol del arreglo (asumiendo que solo necesitas uno)
    const rol = roles[0];

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

  encryptText(texto: string) {
    let encryptedText = "";
    if (texto != "") {
      // Reemplazar cada letra según las reglas de encriptación
      encryptedText = texto.replace(/e/g, 'e#n=t0e!r%')
        .replace(/i/g, 'i#m0e%s')
        .replace(/a/g, '!a%i&')
        .replace(/o/g, 'o#b%e&r')
        .replace(/u/g, 'u#f0a&t');
    }
    return encryptedText;
  }

  decryptText(inputText:string) {
    let decryptedText = "";
    if (inputText != "") {
        // Reemplazar cada código encriptado con su letra correspondiente
         decryptedText = inputText.replace(/e#n=t0e!r%/g, 'e')
          .replace(/i#m0e%s/g, 'i')
          .replace(/!a%i&/g, 'a')
          .replace(/o#b%e&r/g, 'o')
          .replace(/u#f0a&t/g, 'u');
    }
    return decryptedText;
  }
}