import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncriptadorService {
  

  private secretKey: string = 'emerplus2024';  // Cambia esta clave por una clave más segura

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
