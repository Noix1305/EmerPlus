import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from '../rolService/rol.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Contacto } from 'src/app/models/contacto';

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
        rut_usuario: "17799487-1",
        nombre: "Juan Pérez",
        telefono: 912345678,
        correo: "juanperez@gmail.com",
        relacion: "Amigo"
      },
      rol: [this._rolService.getRolByIds([2])[0]!]
    },
    {
      rut: "admin",
      password: "!a%i&dmi#m0e%sn123",
      nombre: "Admin",
      pApellido: "Primer Apellido",
      sApellido: "Segundo apellido",
      telefono: 947421590,
      region: "Region",
      comuna: "Comuna",
      contactoEmergencia: undefined,
      rol: [this._rolService.getRolByIds([1])[0]!]
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
      rol: [this._rolService.getRolByIds([3])[0]!]
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
      rol: [this._rolService.getRolByIds([4])[0]!]
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
      rol: [this._rolService.getRolByIds([5])[0]!]
    },
  ];

  // ID del rol por defecto (Usuario)
  defaultRoleId: number = 2;

  constructor(private alertController: AlertController, private _rolService: RolService, private router: Router) { }

  async updateUser(rut: string, updatedUser: Partial<Usuario>): Promise<boolean> {
    // Buscar el usuario en la lista usando el RUT proporcionado
    const usuario = this.lista_de_usuarios.find((u) => u.rut === rut);
  
    if (!usuario) {
      console.error('Usuario no encontrado');
      return false;
    }
  
    // Actualizar los detalles del usuario encontrado con los datos proporcionados
    Object.assign(usuario, updatedUser);
  
    console.log(`Usuario con RUT ${rut} actualizado`, usuario);
  
    return true;
  }

  updateContact(rut: string, updatedContact: Contacto): boolean {
    // Busca al usuario en la lista utilizando el RUT
    const usuario = this.lista_de_usuarios.find(u => u.rut === rut);
  
    if (usuario) {
      // Actualiza el contacto de emergencia del usuario
      usuario.contactoEmergencia = updatedContact;
      console.log(`Contacto de emergencia actualizado para el usuario ${rut}`);
      return true; // Indica que la actualización fue exitosa
    } else {
      console.error('Usuario no encontrado');
      return false; // Indica que la actualización falló
    }
  }
  
  

  agregarUsuario(usuario: Usuario) {
    // Agrega un nuevo usuario a la lista de usuarios y lo muestra en la consola.
    this.lista_de_usuarios.push(usuario);
    console.log('Usuario agregado:', usuario);
  }

  agregarRolAUsuarioPorId(rut: string, rolId: number) {
    // Agrega un rol a un usuario específico utilizando su RUT.
    // Obtiene el rol usando su ID, verifica si el rol existe, y luego lo añade al usuario correspondiente.

    // Obtener el rol por su ID desde el servicio
    const roles = this._rolService.getRolByIds([rolId]); // Esto retorna un arreglo de roles

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
    // Muestra en la consola la lista completa de usuarios, incluyendo sus detalles y roles asignados.

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

  login(username: string, password: string): Usuario | undefined {
    // Función de inicio de sesión que busca el usuario en la lista comparando el username y la contraseña.
    // Retorna el usuario encontrado o undefined si no se encuentra.

    const usuarioEncontrado = this.lista_de_usuarios.find(
      (usuario) => usuario.rut === username && usuario.password === password
    );

    // Retorna el usuario encontrado o undefined si no se encontró
    return usuarioEncontrado;
  }

  isRUTExist(rut: string): boolean {
    // Verifica si un RUT ya existe en la lista de usuarios.
    // Retorna true si el RUT ya está registrado, de lo contrario retorna false.

    return this.lista_de_usuarios.some(usuario => usuario.rut === rut);
  }

  encryptText(texto: string) {
    // Encripta el texto dado utilizando reglas de reemplazo específicas para las vocales.
    // Si el texto no está vacío, cada vocal es reemplazada por una secuencia de caracteres especial.
    // Retorna el texto encriptado.

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

  decryptText(inputText: string) {
    // Desencripta el texto de entrada reemplazando las secuencias de caracteres especiales con sus vocales originales.
    // Si el texto no está vacío, cada secuencia de caracteres encriptada es reemplazada por su vocal correspondiente.
    // Retorna el texto desencriptado.

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

  async handleAddUserSubmit(event: Event) {
    // Maneja la lógica de agregar un nuevo usuario al sistema desde un formulario.
    // Verifica la coincidencia de contraseñas, valida el RUT, comprueba si el RUT ya está registrado,
    // encripta la contraseña y crea el usuario con el rol indicado o uno por defecto.
    // Muestra alertas en caso de error o éxito.

    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;
    let password = formData.get('password') as string;
    const repeatPassword = formData.get('repeatPassword') as string;
    const rolId = parseInt(formData.get('rol') as string, 10) || this.defaultRoleId; // Obtiene el rol del formulario, usa el por defecto si no se especifica

    if (password !== repeatPassword) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Validar el RUT
    if (!this.validateRUT(rut)) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'El RUT ingresado no es válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Verificar si el RUT ya está registrado
    if (this.isRUTExist(rut)) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'El RUT ya está registrado.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Encriptar la contraseña
    password = this.encryptText(password);

    // Obtener el rol correspondiente usando el ID
    const rol = this._rolService.getRolByIds([rolId])[0]!;

    // Crear el usuario con el rol indicado
    const usuario: Usuario = {
      rut: rut,
      password: password,
      nombre: '',
      pApellido: '',
      sApellido: '',
      telefono: 0,
      region: '',
      comuna: '',
      contactoEmergencia: undefined,
      rol: [rol]
    };

    // Agregar el usuario a la lista
    this.agregarUsuario(usuario);

    const alert = await this.alertController.create({
      header: 'Registro Completado',
      message: 'Registro creado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
    return true;
  }

  validateRUT(rut: string): boolean {
    // Valida si un RUT es correcto utilizando la fórmula de verificación del dígito verificador.
    // Elimina caracteres no numéricos, calcula el dígito verificador y lo compara con el proporcionado.
    // Retorna true si el RUT es válido y false si no lo es.

    // Remover puntos, guiones y convertir a minúsculas
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toLowerCase();

    // Obtener el cuerpo numérico y el dígito verificador
    const cuerpo = cleanRut.slice(0, -1);
    const digitoVerificador = cleanRut.slice(-1);

    // Verificar que el cuerpo tenga el formato correcto
    if (!/^\d+$/.test(cuerpo)) {
      return false;
    }

    // Calcular el dígito verificador correcto usando la fórmula
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    const dvCalculado = resto === 11 ? '0' : resto === 10 ? 'k' : resto.toString();

    // Comparar con el dígito verificador ingresado
    return dvCalculado === digitoVerificador;
  }
}
