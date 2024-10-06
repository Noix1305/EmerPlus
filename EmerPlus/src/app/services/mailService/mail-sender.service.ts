import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailSenderService {

  private apiUrl = 'http://localhost:3001/send-email'; // Cambiar esto a la URL del servidor

  constructor(private http: HttpClient) { }

  enviarCorreo(destinatario: string, asunto: string, texto: string): Observable<any> {
    const payload = {
      destinatario,
      asunto,
      texto,
    };

    return this.http.post(this.apiUrl, payload).pipe(
      catchError(this.handleError) // Maneja el error aquí
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Manejo de errores
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Errores del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Errores del lado del servidor
      errorMessage = `Código de estado: ${error.status}, Mensaje: ${error.message}`;
    }

    // Puedes usar `console.error` o cualquier otro método para registrar el error
    console.error(errorMessage);
    return throwError(() => new Error('Error')); // Lanza el error
  }
}
