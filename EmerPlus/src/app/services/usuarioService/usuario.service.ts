import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Usuario } from 'src/app/models/usuario';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  path = 'usuarios';

  constructor(private apiConfig: ApiConfigService) { }

  getUsuarioPorRut(rut: string): Observable<HttpResponse<Usuario>> {
    const params = new HttpParams().set('rut', `eq.${rut}`);
    return this.apiConfig.get<Usuario>(this.path, params);
  }

  // this.getUsuarioPorRut('17799487-1').subscribe({
  //   next: (response) => {
  //     const usuario = response.body;
  //     console.log(usuario);
  //   },
  //   error: (error) => {
  //     console.error('Error al obtener el usuario:', error);
  //   },
  //   complete: () => {
  //     console.log('Solicitud completada');
  //   }
  // });

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


}
