import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Usuario } from 'src/app/models/usuario';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
import { MailSenderService } from '../mailService/mail-sender.service';
import { AgregarContactoUsuario } from 'src/app/models/agregarContactoUsuario';



@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  path = 'usuarios';

  constructor(private apiConfig: ApiConfigService, private mailSenderService: MailSenderService) { }

  getUsuarioPorRut(rut: string): Observable<HttpResponse<Usuario>> {
    const params = new HttpParams().set('rut', `eq.${rut}`);
    return this.apiConfig.get<Usuario>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener usuario por RUT:', error);
        return throwError(() => new Error('Error al obtener usuario por RUT.'));
      })
    );
  }

  async enviarContraseñaPorRut(rut: string): Promise<void> {
    const usuarioResponse = await firstValueFrom(this.getUsuarioPorRut(rut));

    if (usuarioResponse.body && Array.isArray(usuarioResponse.body) && usuarioResponse.body.length > 0) {
      const usuario: Usuario = usuarioResponse.body[0];
      const email = usuario.correo;

      console.log('Usuario encontrado:', usuario.nombre);
      console.log('Correo:', email);

      const passDesencriptada = this.decryptText(usuario.password);

      if (email) {
        // Enviar la contraseña al correo
        await this.enviarCorreoConContraseña(email, passDesencriptada);
      } else {
        throw new Error('El correo electrónico no está disponible para el usuario.');
      }
    } else {
      throw new Error('Usuario no encontrado.');
    }
  }

  // Método para enviar el correo (puedes usar una librería como nodemailer)
  private async enviarCorreoConContraseña(email: string, contraseña: string): Promise<void> {
    const asunto = 'Recuperación de Contraseña';
    const texto = `
Estimado/a Usuario,

Esperamos que se encuentre bien. 

Hemos recibido una solicitud para recuperar su contraseña asociada a su cuenta. A continuación, encontrará la información necesaria para acceder nuevamente a su cuenta:

**Su contraseña es:** ${contraseña}

Le recordamos que es importante mantener su contraseña segura y privada. Si tiene sospechas de que alguien más pueda tener acceso a su cuenta, le recomendamos seguir estos pasos:

1. Cambie su contraseña de inmediato.
2. Asegúrese de utilizar una contraseña única que no haya sido utilizada anteriormente.
3. Habilite la autenticación de dos factores en su cuenta, si está disponible, para una mayor seguridad.
4. No comparta su contraseña con nadie.

Si necesita más ayuda o tiene alguna otra consulta, no dude en ponerse en contacto con nuestro equipo de soporte.

Atentamente,  
El equipo de Emerplus. Conectándote con la ayuda que necesitas, cuando la necesitas.
`;



    // Enviar el correo utilizando MailSenderService
    this.mailSenderService.enviarCorreo(email, asunto, texto).subscribe({
      next: () => {
        alert('Correo enviado con éxito');
      },
      error: (error) => {
        console.error('Error al enviar el correo:', error);
        alert('Hubo un error al enviar el correo.');
      }
    });
  }

  obtenerUsuarios() {
    const params = new HttpParams().set('select', '*')
    return this.apiConfig.get<Usuario[]>(this.path, params).pipe(
      map(response => {
        console.log(response)
        const datoFiltrado = response.body?.filter(usuario => usuario.estado === 1)

        return new HttpResponse({
          body: datoFiltrado,
          headers: response.headers,
          status: response.status,
          statusText: response.statusText
        })
      })
    )
  }

  // Método para crear un nuevo usuario
  crearUsuario(usuario: Usuario): Observable<HttpResponse<Usuario>> {
    return this.apiConfig.post(this.path, usuario);
  }

  // Cambia el tipo de usuario a Usuario
  editarUsuario(rut: string, usuario: Usuario): Observable<HttpResponse<Usuario>> {
    const path = `${this.path}?rut=eq.${rut}`;
    return this.apiConfig.patch<Usuario>(path, usuario).pipe(
      map(response => {
        return new HttpResponse<Usuario>({
          body: response.body || null, // Puedes modificar esto si es necesario
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      })
    );
  }

  editarCampoUsuario(rut: string, usuario: Partial<Usuario>): Observable<HttpResponse<Usuario>> {
    const path = `${this.path}?rut=eq.${rut}`; // Construye la ruta con el RUT
    return this.apiConfig.patchParcial<Usuario>(path, usuario).pipe(
      map(response => {
        return new HttpResponse<Usuario>({
          body: response.body || null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      })
    );
  }

  editariIdcontactoUsuario(rut: string, data: any): Observable<HttpResponse<any>> {
    const path = `${this.path}?rut=eq.${rut}`;
    return this.apiConfig.patch<any>(path, data);
  }

  cambiarContrasena(rut: string, nuevaContrasena: string): Observable<HttpResponse<Usuario>> {
    const path = `${this.path}?rut=eq.${rut}`;
    const body = { password: nuevaContrasena }; // Asumiendo que el campo de la contraseña es 'password'

    return this.apiConfig.patch<Usuario>(path, body).pipe(
      map(response => {
        return new HttpResponse<Usuario>({
          body: response.body || null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      })
    );
  }

  eliminarCuenta(rut: string): Observable<HttpResponse<void>> {
    const path = `${this.path}?rut=eq.${rut}`;

    return this.apiConfig.delete<void>(path).pipe(
      map(response => {
        // Aquí podrías manejar cualquier lógica adicional si es necesario
        return new HttpResponse<void>({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }),
      catchError(error => {
        console.error('Error al eliminar la cuenta:', error);
        return throwError(error); // Propaga el error
      })
    );
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
