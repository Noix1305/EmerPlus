import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private urlBase = environment.supabaseUrl;

  constructor(private httpClient: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'apiKey': environment.supabaseKey,
      'Authorization': 'Bearer ' + environment.supabaseKey
    })
  }

  private handlerError(error: HttpErrorResponse) {
    console.log('Error', error);
    return throwError(() => error);
  }

  get<T>(path: string, params?: HttpParams): Observable<HttpResponse<T>> {
    return this.httpClient.get<T>(this.urlBase + path,
      {
        headers: this.getHeaders(),
        observe: 'response',
        params
      })
      .pipe(
        catchError(this.handlerError)
      )
  }

  post<T>(path: string, data: any): Observable<HttpResponse<T>> {
    return this.httpClient.post<T>(this.urlBase + path, data,
      {
        headers: this.getHeaders(),
        observe: 'response'
      })
      .pipe(
        catchError(this.handlerError)
      )
  }
}
