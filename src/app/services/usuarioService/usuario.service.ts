import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Usuario } from 'src/app/models/usuario';
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
import { MailSenderService } from '../mailService/mail-sender.service';
import { ActualizarRol } from 'src/app/models/actualizarRol';
import { Preferences } from '@capacitor/preferences';
import Swal from 'sweetalert2';
import { EncriptadorService } from '../encriptador/encriptador.service';



@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  path = 'usuarios';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private apiConfig: ApiConfigService,
    private mailSenderService: MailSenderService,
    private _encriptadorService: EncriptadorService) {
    this.cargarUsuario();
  }

  getUsuarioPorRut(rut: string): Observable<HttpResponse<Usuario>> {
    const params = new HttpParams().set('rut', `eq.${rut}`);
    return this.apiConfig.get<Usuario>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener usuario por RUT:', error);
        return throwError(() => new Error('Error al obtener usuario por RUT.'));
      })
    );
  }

  getUsuarioPorRol(rol: number): Observable<HttpResponse<Usuario[]>> {
    // Usamos "cs" para verificar si el array "rol" contiene el número dado
    const params = new HttpParams().set('rol', `cs.{${rol}}`);
    console.log('Rol de consulta: ' + rol);

    return this.apiConfig.get<Usuario[]>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener usuarios por rol:', error);
        return throwError(() => new Error('Error al obtener usuarios por rol.'));
      })
    );
  }

  async enviarContraseñaPorRut(rut?: string, email?: string): Promise<void> {
    if (rut) {
      const usuarioResponse = await firstValueFrom(this.getUsuarioPorRut(rut));

      if (usuarioResponse.body && Array.isArray(usuarioResponse.body) && usuarioResponse.body.length > 0) {
        const usuario: Usuario = usuarioResponse.body[0];
        const email = usuario.correo;

        const passDesencriptada = this.decryptText(usuario.password);

        if (email) {
          // Enviar la contraseña al correo
          await this.enviarCorreoConContraseña(email, passDesencriptada);
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El correo electrónico no está disponible para el usuario.',
            heightAuto: false
          });
          throw new Error('El correo electrónico no está disponible para el usuario.');

        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Usuario no encontrado.',
          heightAuto: false
        });
        throw new Error('Usuario no encontrado.');
      }
    } else if (email) {

    } else {
      console.error('No se encontraron los parametros para el envío del correo:')
    }
  }

  // Método para enviar el correo (puedes usar una librería como nodemailer)
  private async enviarCorreoConContraseña(email: string, contraseña: string): Promise<void> {
    const asunto = 'Recuperación de Contraseña';
    const html = `
      <p>Estimado/a Usuario,</p>
      <p>Esperamos que se encuentre bien.</p>
      <p>Hemos recibido una solicitud para recuperar su contraseña asociada a su cuenta. A continuación, encontrará la información necesaria para acceder nuevamente a su cuenta:</p>
      <p><strong>Su contraseña es:</strong> ${contraseña}</p>
      <p>Le recordamos que es importante mantener su contraseña segura y privada. Si tiene sospechas de que alguien más pueda tener acceso a su cuenta, le recomendamos seguir estos pasos:</p>
      <ol>
        <li>Cambie su contraseña de inmediato.</li>
        <li>Asegúrese de utilizar una contraseña única que no haya sido utilizada anteriormente.</li>
        <li>Habilite la autenticación de dos factores en su cuenta, si está disponible, para una mayor seguridad.</li>
        <li>No comparta su contraseña con nadie.</li>
      </ol>
      <p>Si necesita más ayuda o tiene alguna otra consulta, no dude en ponerse en contacto con nuestro equipo de soporte.</p>
      <p>Atentamente,<br>El equipo de Emerplus. Conectándote con la ayuda que necesitas, cuando la necesitas.</p>
    `;

    // Enviar el correo utilizando MailSenderService
    this.mailSenderService.enviarCorreo(email, asunto, html).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Se ha enviado un correo con la recuperación de contraseña.',
          heightAuto: false
        });
      },
      error: (error) => {
        console.error('Error al enviar el correo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar el correo de recuperación',
          heightAuto: false
        });
      }
    });
  }



  async enviarCorreoRegistroContacto(email: string, usuario: Usuario, nombreContacto: string): Promise<void> {
    const asunto = 'Registro como Contacto de Emergencia';
    const html = `
      <p>Estimado/a ${nombreContacto},</p>
      <p>Esperamos que se encuentre bien.</p>
      <p>Le informamos que ha sido registrado/a como <strong>contacto de emergencia</strong> en nuestro servicio por el usuario ${usuario.nombre} ${usuario.papellido}.
      Esto significa que, en caso de emergencia, usted será notificado/a y podrá ser contactado/a en situaciones donde se necesite su ayuda.</p>
      <p>A continuación, le ofrecemos algunos detalles adicionales:</p>
      <ol>
        <li><strong>Servicio de Emergencia:</strong> Este registro permite al usuario confiar en usted como parte importante de su red de apoyo.</li>
        <li><strong>Acciones a tomar:</strong> En caso de recibir notificaciones, por favor, responda lo más pronto posible para brindar asistencia.</li>
        <li><strong>Confidencialidad y Seguridad:</strong> La información proporcionada se maneja de forma confidencial y está protegida por nuestras políticas de seguridad.</li>
      </ol>
      <p>Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nuestro equipo de soporte.</p>
      <p>Atentamente,<br>El equipo de Emerplus. Conectándote con la ayuda que necesitas, cuando la necesitas.</p>
    `;

    // Enviar el correo utilizando MailSenderService
    this.mailSenderService.enviarCorreo(email, asunto, html).subscribe({
      next: () => {
        // Puedes agregar alguna acción si se envía con éxito
      },
      error: (error) => {
        console.error('Error al enviar el correo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar el correo',
          heightAuto: false
        });
      }
    });
  }



  obtenerUsuarios(): Observable<Usuario[]> {
    const params = new HttpParams().set('select', '*');
    return this.apiConfig.get<Usuario[]>(this.path, params).pipe(
      map(response => {
        // Filtramos los usuarios que están activos
        const usuariosActivos = response.body?.filter(usuario => usuario.estado === 1);
        return usuariosActivos || [];
      }),
      catchError((error) => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => new Error('Error al obtener usuarios.'));
      })
    );
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

  cambiarContrasena(rut: string, nuevaContrasena: string): Observable<HttpResponse<Usuario>> {
    const path = `${this.path}?rut=eq.${rut}`;
    const body = { password: nuevaContrasena }; // Asegúrate de que el nombre del campo sea el correcto

    return this.apiConfig.patch<Usuario>(path, body, { observe: 'response' });
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
        return throwError(() => new Error('test')); // Propaga el error
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

  actualizarRol(rut: string, data: ActualizarRol): Observable<HttpResponse<any>> {
    const path = `${this.path}?rut=eq.${rut}`;
    return this.apiConfig.patch<any>(path, data);
  }

  async cargarUsuario() {
    const result = await Preferences.get({ key: 'userInfo' });
    const value = result.value;

    console.log('Valor recuperado de userInfo:', value); // Verifica el valor almacenado

    if (value) {
      try {
        // Desencriptar el valor antes de intentar parsearlo
        const decryptedValue = this._encriptadorService.decrypt(value);
        console.log('Valor desencriptado:', decryptedValue); // Verifica el valor desencriptado

        // Validar que el valor es un JSON antes de intentar parsearlo
        if (this.esJsonValido(decryptedValue)) {
          const usuario = JSON.parse(decryptedValue) as Usuario;
          this.usuarioSubject.next(usuario); // Emite el nuevo usuario
        } else {
          console.error('El valor almacenado no es un JSON válido');
        }
      } catch (error) {
        console.error('Error al desencriptar o parsear el JSON:', error);
        await Preferences.remove({ key: 'userInfo' }); // Eliminar el valor corrupto si el parseo o desencriptado falla
      }
    } else {
      console.log('No hay información del usuario');
    }
  }

  // Función para verificar si una cadena es un JSON válido
  esJsonValido(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }



  async guardarUsuario(usuario: Usuario) {
    try {
      const value = JSON.stringify(usuario);  // Convertir el objeto a JSON
      await Preferences.set({ key: 'userInfo', value });
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    }
  }



  actualizarUsuario(usuario: Usuario) {
    this.usuarioSubject.next(usuario); // Actualiza el estado del usuario
  }

  limpiarUsuario() {
    this.usuarioSubject.next(null); // Limpia el usuario en caso de logout
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.getValue(); // Obtiene el valor actual del BehaviorSubject
  }
}