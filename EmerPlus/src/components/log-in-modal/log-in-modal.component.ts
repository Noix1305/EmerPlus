import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/loginService/login.service';

@Component({
  selector: 'app-log-in-modal',
  templateUrl: './log-in-modal.component.html',
  styleUrls: ['./log-in-modal.component.scss'],
})
export class LoginModalComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private modalController: ModalController,
    private _loginService: LoginService,
    private router: Router
  ) { }

  closeModal() {
    this.modalController.dismiss();
  }

  async handleLoginSubmit(event: Event) {
    event.preventDefault(); // Evita que el formulario se envíe por defecto
    const encryptedPassword = this._loginService.encryptText(this.password);

    // Intenta autenticar al usuario
    try {
      const user = await this._loginService.login(this.username, encryptedPassword); // Asegúrate de que tu servicio devuelva una promesa

      if (user) {
        // Redirigir y cerrar el modal
        this.router.navigate(['user-info'], { state: { usuario: user } });
        this.closeModal();
      } else {
        this.errorMessage = 'Credenciales incorrectas';
      }
    } catch (error) {
      this.errorMessage = 'Ocurrió un error durante el login. Inténtalo de nuevo.';
      console.error('Error en el login:', error);
    }
  }
}
