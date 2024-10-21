import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../usuarioService/usuario.service';
import { SupabaseService } from '../supabase_service/supabase.service';
import { AuthResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // ID del rol por defecto (Usuario)
  defaultRoleId: number = 2;
  correo: string = '';

  constructor(
    private _usuarioService: UsuarioService,
    private supabaseService: SupabaseService) {
  }

  mostrarUsuarios() { }

  async login(rut: string, password: string): Promise<Usuario | undefined> {
    const usuarioResponse = await firstValueFrom(this._usuarioService.getUsuarioPorRut(rut));

    // Verificar si se encontró el usuario y obtener el correo
    if (usuarioResponse.body && Array.isArray(usuarioResponse.body) && usuarioResponse.body.length > 0) {
      const usuario = usuarioResponse.body[0]; // Asumiendo que el primer usuario es el que buscas
      this.correo = usuario.correo; // Asignar el correo a la variable
      console.log('Correo del usuario:', this.correo);
    } else {
      console.error('Usuario no encontrado.');
    }
    try {
      const { data, error }: AuthResponse = await this.supabaseService.auth.signInWithPassword({
        email: this.correo, // Cambia esto si no estás usando el RUT como parte del correo
        password: password

      });
      console.log('Rut: ' + rut)
      console.log(password);

      if (error) {
        console.error('Error al iniciar sesión con Supabase:', error.message);
        return undefined; // Maneja el error y devuelve undefined
      }

      const user = data.user; // Accede al objeto de usuario
      if (!user) {
        console.error('Usuario no encontrado en la respuesta de Supabase');
        return undefined; // Devuelve undefined si el usuario no existe
      }

      // Aquí puedes seguir buscando el usuario en tu base de datos local
      const usuariosActivos: Usuario[] = await firstValueFrom(this._usuarioService.obtenerUsuarios());
      const usuarioEncontrado = usuariosActivos.find((usuario: Usuario) => usuario.rut === rut);

      if (!usuarioEncontrado) {
        console.error('Usuario no encontrado en la base de datos');
        return undefined; // Devuelve undefined si el usuario no se encuentra en tu base de datos
      }

      console.log('Usuario autenticado con éxito:', usuarioEncontrado);
      return usuarioEncontrado; // Retorna el usuario autenticado
    } catch (error) {
      console.error('Error al loguear el usuario:', error);
      return undefined; // Maneja el error de obtención de usuarios y devuelve undefined
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
