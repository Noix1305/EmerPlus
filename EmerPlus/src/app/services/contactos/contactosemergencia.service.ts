import { HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Contacto } from 'src/app/models/contacto';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { Usuario } from 'src/app/models/usuario';
import { MailSenderService } from '../mailService/mail-sender.service';

@Injectable({
  providedIn: 'root'
})
export class ContactosemergenciaService {
  path = 'contactos';

  constructor(
    private _apiConfig: ApiConfigService,
    private _mailSenderService: MailSenderService
  ) { }

  crearContacto(contacto: Contacto): Observable<HttpResponse<Contacto>> {
    return this._apiConfig.post(this.path, contacto);
  }

  getContactoPorParametro(parametroIngresado: string, valorDeBusqueda: string): Observable<HttpResponse<Contacto>> {
    const params = new HttpParams().set(valorDeBusqueda, `eq.${parametroIngresado}`);
    return this._apiConfig.get<Contacto>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener contacto:', error);
        return throwError(() => new Error('Error al obtener contacto.'));
      })
    );
  }

  getContactoPorRut(rut_usuario: string): Observable<HttpResponse<Contacto>> {
    const params = new HttpParams().set('usuario_id', `eq.${rut_usuario}`);
    return this._apiConfig.get<Contacto>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener usuario por RUT:', error);
        return throwError(() => new Error('Error al obtener usuario por RUT.'));
      })
    );
  }

  async enviarCorreoRegistroContacto(email: string, usuario: Usuario, nombreContacto: string): Promise<void> {
    const asunto = 'Registro como Contacto de Emergencia';
    const texto = `
Estimado/a ${nombreContacto},

Esperamos que se encuentre bien.

Le informamos que ha sido registrado/a como **contacto de emergencia** en nuestro servicio por el usuario ${usuario.nombre} ${usuario.papellido}.
Esto significa que, en caso de emergencia, usted será notificado/a y podrá ser contactado/a en situaciones donde se necesite su ayuda.

A continuación, le ofrecemos algunos detalles adicionales:

1. **Servicio de Emergencia**: Este registro permite al usuario confiar en usted como parte importante de su red de apoyo.
2. **Acciones a tomar**: En caso de recibir notificaciones, por favor, responda lo más pronto posible para brindar asistencia.
3. **Confidencialidad y Seguridad**: La información proporcionada se maneja de forma confidencial y está protegida por nuestras políticas de seguridad.

Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nuestro equipo de soporte.

Atentamente,  
El equipo de Emerplus. Conectándote con la ayuda que necesitas, cuando la necesitas.
`;

    // Enviar el correo utilizando MailSenderService
    this._mailSenderService.enviarCorreo(email, asunto, texto).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Error al enviar el correo:', error);
        alert('Hubo un error al enviar el correo.');
      }
    });
  }

}


