import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  login() {
    // Aquí puedes agregar la lógica de autenticación
    console.log('Login successful');
    this.dismiss();
  }
}
