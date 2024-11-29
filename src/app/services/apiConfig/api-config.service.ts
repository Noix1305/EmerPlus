import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {


  public urlBase = environment.API_URL;

  constructor(private httpClient: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'apiKey': environment.API_KEY_SUPABASE,
      'Authorization': 'Bearer ' + environment.API_KEY_SUPABASE,
      'Prefer': 'return=representation'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Error', error);
    return throwError(() => error);
  }

  get<T>(path: string, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.get<T>(`${this.urlBase}/rest/v1/${path}`, {
      headers: this.getHeaders(),
      observe: 'response',
      params
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  post<T>(path: string, data: any): Observable<HttpResponse<T>> {
    const url = `${this.urlBase}/rest/v1/${path}`;
    console.log('URL de la solicitud:', url);

    return this.httpClient.post<T>(
      url,
      data,
      {
        headers: this.getHeaders(),  // Aquí aplicamos los headers
        observe: 'response'
      }
    ).pipe(
      map((response) => {
        if (Array.isArray(response.body)) {
          response = response.clone({ body: response.body[0] });
        }
        return response;
      }),
      catchError(this.handleError)
    );
}


  patch<T>(path: string, data: any, options: { headers?: HttpHeaders, observe?: 'response', params?: HttpParams } = {}): Observable<HttpResponse<T>> {
    return this.httpClient.patch<T>(
      `${this.urlBase}/rest/v1/${path}`,
      data,
      {
        ...options,
        headers: options.headers || this.getHeaders(), // Usa el valor de `headers` pasado o el valor por defecto
        observe: 'response',  // Define `observe: 'response'` aquí para asegurarte de que devuelva el HttpResponse completo
      }
    ).pipe(
      catchError(this.handleError)
    );
  }


  patchParcial<T>(path: string, userModel: Partial<T>, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.patch<T>(`${this.urlBase}/rest/v1/${path}`, // Agregar '/rest/v1/' a la URL
      userModel,
      {
        headers: this.getHeaders(),
        observe: 'response',
        params
      })
      .pipe(
        catchError(this.handleError)
      );
  }

  delete<T>(path: string, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.delete<T>(`${this.urlBase}/rest/v1/${path}`, // Agregar '/rest/v1/' a la URL
      {
        headers: this.getHeaders(),
        observe: 'response',
        params
      })
      .pipe(
        catchError(this.handleError)
      );
  }

  editField<T>(path: string, fieldName: string, value: any, params?: HttpParams): Observable<HttpResponse<T>> {
    // Crear el objeto que contiene el campo a actualizar
    const data = { [fieldName]: value };

    return this.httpClient.patch<T>(`${this.urlBase}/rest/v1/${path}`, // Agregar '/rest/v1/' a la URL
      data,
      {
        headers: this.getHeaders(),
        observe: 'response',
        params
      })
      .pipe(
        catchError(this.handleError)
      );
  }

  signUpUser(correo: string, password: string): Observable<HttpResponse<any>> {
    return this.httpClient.post<any>(`${this.urlBase}/auth/v1/signup`, {
      email: correo,
      password: password
    }, {
      headers: this.getHeaders(),
      observe: 'response'  // Importante para obtener el HttpResponse
    }).pipe(
      catchError(this.handleError)  // Manejo de errores
    );
  }
}
