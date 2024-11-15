import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase = createClient(environment.API_URL, environment.API_KEY_SUPABASE);

  constructor(private authService: AuthService) { }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: any }> {

    const user = this.authService.getUser();

    if (!user) {
      // Si no está autenticado, redirigir al login o pedir credenciales
      await this.redirectToLogin();
      return { url: null, error: 'Usuario no autenticado' };
    }
    const { data, error } = await this.supabase.storage.from(bucket).upload(path, file);

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '' + error.message,
        heightAuto: false
      });
      return { url: null, error };
    }

    const { data: { publicUrl } } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return { url: publicUrl, error: null };

  }


  // Redirigir al usuario a la página de login si no está autenticado
  private async redirectToLogin() {
    const credentials = { email: environment.CORREO_USER_DB, password: environment.PASSWORD_DB };

    // Si el usuario ha ingresado datos, intentar loguearlo
    if (credentials) {
      await this.authService.login(credentials.email, credentials.password);
    }
  }

}
