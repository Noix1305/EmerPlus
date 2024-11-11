import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment'; // Asegúrate de que esta ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  constructor() {}

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error en el login:', error);
      return false;
    }

    await this.guardarInfoEnStorage(data.session?.access_token || '');
    return true;
  }

  async guardarInfoEnStorage(token: string) {
    try {
      await localStorage.setItem('auth-token', token);
    } catch (error) {
      console.error('Error al guardar en el storage:', error);
    }
  }

  async logout() {
    await this.supabase.auth.signOut();
    localStorage.removeItem('auth-token');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await localStorage.getItem('auth-token');
    return !!token;
  }
}
