import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  public urlBase = environment.supabaseUrl;

  constructor(private httpClient: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'apiKey': environment.supabaseKey,
      'Authorization': 'Bearer ' + environment.supabaseKey
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
    const url = `${this.urlBase}/rest/v1/${path}`; // Agregar '/rest/v1/' a la URL
    console.log('URL de la solicitud:', url);

    return this.httpClient.post<T>(
      url,
      data,
      {
        headers: this.getHeaders(),
        observe: 'response'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  patch<T>(path: string, data: any, params?: HttpParams): Observable<HttpResponse<T>> {
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
