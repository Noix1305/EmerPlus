import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { MailSenderService } from '../mailService/mail-sender.service';
import { Notificacion } from 'src/app/models/notificacion';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Contacto } from 'src/app/models/contacto';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiConfigService } from '../apiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  path = 'notificacion'

  notificaciones: Notificacion[] = [];

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

  obtenerNotificaciones(): Observable<Notificacion[]> {
    const params = new HttpParams().set('select', '*');
    return this._apiConfig.get<Notificacion[]>(this.path, params).pipe(
      map(response => {
        return response.body || [];
      }),
      catchError((error) => {
        console.error('Error al obtener notificaciones:', error);
        return throwError(() => new Error('Error al obtener notificaciones.'));
      })
    );
  }

  obtenerNotificacionesUsuario(id_usuario: string): Observable<HttpResponse<Notificacion[]>> {
    // Crea los parámetros, añadiendo ambos filtros
    const params = new HttpParams()
      .set('usuario_id', `eq.${id_usuario}`)
      .set('estado', `eq.Enviada`); // Agrega el nuevo parámetro para el estado

    // Realiza la llamada GET con los parámetros
    return this._apiConfig.get<Notificacion[]>(this.path, params);
  }




  obtenerNotificacionesFiltradas(): Observable<Notificacion[]> {
    const params = new HttpParams().set('select', '*');
    return this._apiConfig.get<Notificacion[]>(this.path, params).pipe(
      map(response => {
        // Filtramos los usuarios que están activos
        const notificacionesNuevas = response.body?.filter(notificacion => notificacion.estado = 'Enviada');
        return notificacionesNuevas || [];
      }),
      catchError((error) => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => new Error('Error al obtener usuarios.'));
      })
    );
  }

}
