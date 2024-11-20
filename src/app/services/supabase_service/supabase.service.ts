import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase = createClient(environment.API_URL, environment.API_KEY_SUPABASE);

  constructor() { }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: any }> {

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


}
