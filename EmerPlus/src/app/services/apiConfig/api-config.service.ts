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
    })
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Error', error);
    return throwError(() => error);
  }

  get<T>(path: string, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.get<T>(`${this.urlBase}/${path}`, { headers: this.getHeaders(), observe: 'response', params })
      .pipe(
        catchError(this.handleError)
      );
  }

  post<T>(path: string, data: any): Observable<HttpResponse<T>> {
    // Asegúrate de que solo haya una barra entre urlBase y path
    const url = `${this.urlBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
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
    return this.httpClient.patch<T>(`${this.urlBase}/${path}`,
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

  delete<T>(path: string, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.delete<T>(`${this.urlBase}/${path}`, {
      headers: this.getHeaders(),
      observe: 'response',
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

}
