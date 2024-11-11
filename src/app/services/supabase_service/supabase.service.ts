import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  bucket: string = 'images'

  constructor() {
    console.log(environment.API_URL)
    this.supabase = createClient(environment.API_URL, environment.API_KEY_SUPABASE);
  }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: any }> {
    // Subir el archivo al bucket
    const { data, error } = await this.supabase.storage.from(bucket).upload(path, file);

    // Si hay un error, retornarlo
    if (error) {
      return { url: null, error };
    }

    // Si la carga fue exitosa, obtenemos la URL pública
    const { data: { publicUrl } } = this.supabase.storage.from(bucket).getPublicUrl(path);

    // Retornamos la URL pública y el posible error
    return { url: publicUrl, error: null };
  }

}
