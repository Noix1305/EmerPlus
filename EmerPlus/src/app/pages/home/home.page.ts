import { Component, ViewChild } from '@angular/core';
import {  IonModal, MenuController } from '@ionic/angular';

import { Router } from '@angular/router';
import { LoginService } from '../../services/loginService/login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild('modalRegistro', { static: false }) modalRegistro!: IonModal; // Captura el modal de registro específicamente
  @ViewChild('loginModal', { static: false }) loginModal!: IonModal;
  
  username: string = '';
  password: string = '';

  name!: string;
  message = 'Ingresar Credenciales';
  errorMessage: string = '';

  constructor(private _loginService: LoginService, private router: Router, private menu: MenuController) { }

  closeModal(modal: IonModal) {
    if (modal) {
      // Limpia los campos de entrada
      this.username = '';
      this.password = '';
      this.errorMessage = '',

      // Cierra el modal
      modal.dismiss(null, 'cancel');
    } else {
      console.error('El modal no está disponible para cerrar.');
    }
  }

  mostrarUsuarios() {
    this._loginService.mostrarUsuarios();
  }

  onLogin() {
    // Encripta la contraseña antes de enviar al servicio de login
    this.password = this._loginService.encryptText(this.password);
  
    // Intenta autenticar al usuario
    try {
      const user = this._loginService.login(this.username, this.password);
  
      if (user) {
        // Si el usuario es encontrado, redirige y cierra el modal
        this.router.navigate(['user-info'], {
          state: { usuario: user }
        }).then(() => {
          this.closeModal(this.loginModal);
        }).catch(error => {
          // Maneja errores de redirección aquí
          console.error('Error al redirigir:', error);
          this.errorMessage = 'No se pudo redirigir al usuario. Inténtalo de nuevo.';
        });
      } else {
        // Si las credenciales son incorrectas, muestra un mensaje de error
        this.errorMessage = 'Credenciales incorrectas';
        console.error('Credenciales incorrectas');
      }
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir en el proceso de login
      console.error('Error durante el proceso de login:', error);
      this.errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
  }
  

  // Método para manejar el formulario de registro
  async handleRegistroSubmit(event: Event) {
    // Espera a que se complete la función handleAddUserSubmit y captura su resultado
    const success = await this._loginService.handleAddUserSubmit(event);
  
    // Si el usuario fue agregado correctamente, cierra el modal de registro
    if (success) {
      this.closeModal(this.modalRegistro);
    }
  }
  
}