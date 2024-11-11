import { Injectable, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from 'src/app/models/usuario';
import { SupabaseService } from '../supabase_service/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GestorArchivosService implements OnInit {

  usuario: Usuario | null = null;

  constructor(
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    this.cargarUsuario();
  }

  async uploadPhoto(file: File, ruta: string): Promise<string | null> {
    const path = ruta + '/' + `${this.usuario?.rut}_${file.name}`;
    const uploadResult = await this.supabaseService.uploadFile('images', path, file);

    // Asegúrate de que la estructura de `uploadResult` es correcta
    if (uploadResult.url) {
      return uploadResult.url; // Retorna la URL directamente si existe
    } else {
      console.error('Error al subir el archivo:', uploadResult.error);
      return null; // Retorna null en lugar de undefined
    }
  }

  async tomarFotoDesdeCamara(): Promise<File | undefined> {
    let file: File | undefined;

    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });

      if (image && image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        file = new File([blob], `foto_${new Date().getTime()}.jpg`, { type: blob.type }); // Asigna nombre al archivo
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }

    return file; // Retorna el archivo tomado
  }

  async seleccionarFotoDesdeGaleria(): Promise<File | undefined> {
    let file: File | undefined;

    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Cambia esto para seleccionar desde la galería
        quality: 90,
      });

      if (image && image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        file = new File([blob], `foto_${new Date().getTime()}.jpg`, { type: blob.type }); // Asigna nombre al archivo
      }
    } catch (error) {
      console.error('Error al seleccionar la foto desde la galería:', error);
    }

    return file; // Retorna el archivo seleccionado
  }

  async cargarUsuario() {
    if (!this.usuario) {
      const { value } = await Preferences.get({ key: 'userInfo' });

      if (value) {
        this.usuario = JSON.parse(value) as Usuario; // Convierte el JSON a Usuario
      } else {
        console.log('No se encontró el usuario en Preferences.');
      }
    }
  }
}
