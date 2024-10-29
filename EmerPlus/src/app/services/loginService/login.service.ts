import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../usuarioService/usuario.service';
import { SupabaseService } from '../supabase_service/supabase.service';
import { AuthResponse } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // ID del rol por defecto (Usuario)
  defaultRoleId: number = 2;
  correo: string = '';
  correoUserBD: string = environment.correoUserBD
  passwordUserBD: string = environment.password

  constructor(
    private _usuarioService: UsuarioService,
    private supabaseService: SupabaseService) {
  }

  mostrarUsuarios() { }

  async login(rut: string, password: string): Promise<Usuario | undefined> {
    try {
      // Obtener el usuario utilizando firstValueFrom
      const usuarioResponse = await firstValueFrom(this._usuarioService.getUsuarioPorRut(rut));
  
      // Verificar si el usuario existe y si el password coincide
      if (Array.isArray(usuarioResponse.body) && usuarioResponse.body.length > 0) {
        const usuario = usuarioResponse.body[0]; // Asumimos que el primer usuario es el que buscamos
  
        // Validar el password
        if (usuario.password === password) {
          this.correo = usuario.correo; // Asignar el correo a la variable
          console.log('Correo del usuario:', this.correo);
  
          // Intentar autenticación en Supabase
          const authenticatedUser = await this.authSupabase(this.correo, password);
          if (authenticatedUser) {
            console.log('Usuario autenticado con éxito:', authenticatedUser);
            return usuario; // Retornar el usuario autenticado si todo va bien
          } else {
            console.error('Error al autenticar con Supabase.');
            return undefined; // Manejar el error si no se puede autenticar en Supabase
          }
        } else {
          console.error('Contraseña incorrecta.');
          return undefined; // Contraseña incorrecta
        }
      } else {
        console.error('Usuario no encontrado.');
        return undefined; // No se encontró el usuario
      }
    } catch (error) {
      console.error('Error al obtener el usuario o durante la autenticación:', error);
      return undefined; // Manejar errores y devolver undefined
    }
  }
  
  private async authSupabase(email: string, password: string): Promise<any> {
    try {
      const { data, error }: AuthResponse = await this.supabaseService.auth.signInWithPassword({
        email: email,
        password: password
      });
  
      // Si ocurre un error, intentar con credenciales predeterminadas
      if (error) {
        console.warn('Error al iniciar sesión con las credenciales del usuario, intentando con las predeterminadas.');
  
        // Intentar autenticación con credenciales predeterminadas
        const { data: defaultData, error: defaultError }: AuthResponse = await this.supabaseService.auth.signInWithPassword({
          email: this.correoUserBD, // Correo predeterminado
          password: this.passwordUserBD // Contraseña predeterminada
        });
  
        if (defaultError) {
          console.error('Error al iniciar sesión con las credenciales predeterminadas:', defaultError);
          return undefined;
        } else {
          return defaultData.user; // Retornar el usuario autenticado con las credenciales predeterminadas
        }
      } else {
        return data.user; // Retornar el usuario autenticado con las credenciales del usuario
      }
    } catch (error) {
      console.error('Error al intentar iniciar sesión en Supabase:', error);
      return undefined; // Manejar errores de autenticación
    }
  }
  


  validarRUT(rut: string): boolean {
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

}
