import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { MailSenderService } from '../mailService/mail-sender.service';
import { Notificacion } from 'src/app/models/notificacion';
import { Observable } from 'rxjs';
import { Contacto } from 'src/app/models/contacto';
import { HttpResponse } from '@angular/common/http';
import { ApiConfigService } from '../apiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  path = 'notificacion'

  constructor(
    private _apiConfig: ApiConfigService,
    private _mailSenderService: MailSenderService
  ) { }

  async enviarNotificacionCorreo(email: string, notificacion: Notificacion, usuario: Usuario): Promise<void> {
    const asunto = `Nueva Notificación de Emergencia - ${notificacion.tipo}`;

    const texto = `
Estimado/a,

Se ha generado una nueva notificación de emergencia en nuestro sistema por parte del usuario **${usuario.nombre} ${usuario.papellido}**:

**RUT del usuario:** ${usuario.rut}  
**Mensaje de la notificación:** ${notificacion.mensaje}

**Fecha:** ${notificacion.fecha}  
**Hora:** ${notificacion.hora}  
**Tipo de notificación:** ${notificacion.tipo}

Ya hemos notificado al servicio de emergencia correspondiente. Ellos están al tanto de la situación y tomarán las medidas necesarias.

Le recomendamos que tome las precauciones necesarias según la información proporcionada.

Si necesita más ayuda o tiene alguna pregunta, no dude en contactarnos.

Atentamente,  
El equipo de Emerplus. Conectándote con la ayuda que necesitas, cuando la necesitas.
    `;

    // Enviar el correo utilizando el servicio de correo
    this._mailSenderService.enviarCorreo(email, asunto, texto).subscribe({
      next: () => {
        console.log('Correo enviado con éxito.');
      },
      error: (error) => {
        console.error('Error al enviar el correo:', error);
        alert('Hubo un error al enviar el correo.');
      }
    });
  }




  crearNotificacion(notificacion: Notificacion): Observable<HttpResponse<Notificacion>> {
    return this._apiConfig.post(this.path, notificacion);
  }
}
