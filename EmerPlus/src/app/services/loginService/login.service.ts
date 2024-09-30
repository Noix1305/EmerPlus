import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from '../rolService/rol.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Contacto } from 'src/app/models/contacto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {


  // ID del rol por defecto (Usuario)
  defaultRoleId: number = 2;

  constructor(private alertController: AlertController, private _rolService: RolService, private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  private supabase: SupabaseClient;


  // Ejemplo de método para obtener datos
  async getData() {
    // Obtener todas las regiones
    const { data: regiones, error: errorRegiones } = await this.supabase
      .from('regiones')
      .select('id, nombre, comunas(id, nombre)'); // Suponiendo que tienes una relación entre regiones y comunas

    if (errorRegiones) {
      console.error('Error al obtener regiones:', errorRegiones);
    }

    return regiones; // Devuelve las regiones con sus comunas
  }

  //async updateUser(rut: string, updatedUser: Partial<Usuario>): Promise<boolean> 

  //updateContact(rut: string, updatedContact: Contacto): boolean { }



  //agregarUsuario(usuario: Usuario) {}

  //agregarRolAUsuarioPorId(rut: string, rolId: number) {}

  mostrarUsuarios() {}

  async login(rut: string, password: string): Promise<Usuario | undefined> {
    // Verificar si el RUT existe en la base de datos
    const { data: usuarioData, error: fetchError } = await this.supabase
      .from('usuarios') // Nombre de tu tabla de usuarios
      .select('*')
      .eq('rut', rut)
      .single();

    if (fetchError) {
      console.error('Error al obtener el usuario:', fetchError);
      return undefined; // Manejar error
    }

    if (!usuarioData) {
      console.error('Usuario no encontrado');
      return undefined; // Manejar caso donde no se encuentra el usuario
    }

    // Verificar contraseña (esto depende de cómo almacenes la contraseña)
    if (usuarioData.password === password) {
      return usuarioData; // Retorna el usuario encontrado
    } else {
      console.error('Contraseña incorrecta');
      return undefined; // Contraseña incorrecta
    }
  }

  async isRUTExist(rut: string): Promise<boolean> {
  // Verifica si un RUT ya existe en la base de datos de Supabase.
  // Retorna true si el RUT ya está registrado, de lo contrario retorna false.

  const { data, error } = await this.supabase
    .from('usuarios') // Nombre de tu tabla de usuarios
    .select('rut')
    .eq('rut', rut)
    .single(); // Obtiene un único registro

  if (error) {
    console.error('Error al verificar el RUT:', error);
    return false; // Maneja el error según tus necesidades
  }

  return !!data; // Devuelve true si hay datos, false si no
}


  getUserByRUT(rut: string) {
    
  }

  //verifarEmailConRUT(rut: string, email: string): boolean {}

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
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;
    let password = formData.get('password') as string;
    const repeatPassword = formData.get('repeatPassword') as string;
    const rolId = parseInt(formData.get('rol') as string, 10) || this.defaultRoleId; // Usa el rol por defecto si no se especifica.

    // Validar que el campo de contraseña no esté vacío
    if (!password || !repeatPassword) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'La contraseña no puede estar vacía.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Validar que las contraseñas coincidan
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
    if (await this.isRUTExist(rut)) {
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
