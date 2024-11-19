import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncriptadorService {


  private secretKey: string = environment.ENCRYPT_KEY;  // Cambia esta clave por una clave más segura

  constructor() { }

  // Encriptar un texto
  encrypt(text: string): string {
    if (!text) {
      return '';
    }
    // Encriptamos el texto usando AES (Advanced Encryption Standard)
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  // Desencriptar un texto
  decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return '';
    }
    // Desencriptamos el texto con la misma clave secreta
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
