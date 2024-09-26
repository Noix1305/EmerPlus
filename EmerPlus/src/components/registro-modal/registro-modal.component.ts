import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginService } from 'src/app/services/loginService/login.service';

@Component({
  selector: 'app-registro-modal',
  templateUrl: './registro-modal.component.html',
  styleUrls: ['./registro-modal.component.scss'],
})
export class RegistroModalComponent {
  rut: string = '';
  password: string = '';
  repeatPassword: string = '';

  errorMessage: string = '';

  constructor(private modalController: ModalController, private _loginService: LoginService) { }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  async handleRegistroSubmit(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    // Lógica para manejar el registro aquí
    const success = await this._loginService.handleAddUserSubmit(event);

    // Si el usuario fue agregado correctamente, cierra el modal de registro
    if (success) {
      this.closeModal();
    }
  }

}
