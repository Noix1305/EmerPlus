import { Component, ViewChild } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

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

  constructor(private _loginService: LoginService, private router: Router) { }

  closeModal(modal: IonModal) {
    if (modal) {
      // Limpia los campos de entrada
      this.username = '';
      this.password = '';

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
    this.password = this._loginService.encryptText(this.password);
    const user = this._loginService.login(this.username, this.password);

    if (user) {
      // Si se encuentra el usuario, redirige y cierra el modal de inicio de sesión
      this.router.navigate(['user-info'], {
        state: {
          usuario: user // Asegúrate de que 'usuario' tenga los datos correctos
        }
      });
      this.closeModal(this.loginModal); // Asegúrate de que se cierra el modal correcto
    } else {
      this.errorMessage = 'Credenciales incorrectas';
      console.error('Credenciales incorrectas');
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