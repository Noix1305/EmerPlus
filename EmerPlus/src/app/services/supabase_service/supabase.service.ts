import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  async uploadFile(file: File) {
    const client = createClient(environment.supabaseUrl, environment.supabaseKey);
    const { data, error } = await this.client.storage.from('imagenes').upload(file.name, file)
    if (error) {
      // Handle error
    } else {
      // Handle success
    }
  }



  // Función para subir una imagen con tipo de contenido
  async uploadImage2(file: File): Promise<string | null> {
    if (!file || !file.name) {
      console.error('El archivo no tiene nombre o es inválido');
      return null;
    }

    // Verificar que el archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('El archivo seleccionado no es una imagen.');
      return null;
    }

    try {
      // Genera un nombre único para el archivo
      const fileName = `${file.name}`;

      // Subir la imagen al bucket de Supabase
      const { data, error } = await this.supabase.storage
        .from('imagenes') // Reemplaza con tu nombre de bucket
        .upload(fileName, file, {
          contentType: file.type
        });

      if (error) {
        console.error('Error al subir la imagen:', error);
        return null;
      }

      // Obtener la URL pública de la imagen subida
      const { data: publicData } = this.supabase
        .storage
        .from('imagenes')
        .getPublicUrl(fileName); // Asegúrate de usar el nombre generado

      // Retornar la URL pública
      return publicData?.publicUrl || null;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  }


  // Función para manejar el evento de carga de archivos
  async handleFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Obtiene el primer archivo seleccionado
      const publicUrl = await this.uploadImage2(file);

      if (publicUrl) {
        console.log('URL pública de la imagen:', publicUrl);
        // Aquí puedes usar la URL como necesites
      } else {
        console.error('No se pudo subir la imagen.');
      }
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
  }
}
