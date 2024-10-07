import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

@Component({
  selector: 'app-registro-modal',
  templateUrl: './registro-modal.component.html',
  styleUrls: ['./registro-modal.component.scss'],
})
export class RegistroModalComponent {
  rut: string = '';
  password: string = '';
  defaultRoleId: number = 2;
  repeatPassword: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private modalController: ModalController,
    private _usuarioService: UsuarioService,
    private _loginService: LoginService,
    private toastController: ToastController) { }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
    this.rut = '';
    this.password = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  async presentToast(successMessage: string) {
    const toast = await this.toastController.create({
      message: successMessage,
      duration: 2000, // Duración en milisegundos
      position: 'top', // Posición del Toast
      color: 'success', // Color del Toast, puedes cambiarlo según tus necesidades
    });
    toast.present();
  }

  async formularioRegistro(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.successMessage = ''; // Reiniciar el mensaje de éxito
    let passwordFinal = '';

    // Validar campos
    if (!this.rut || !this.password || !this.repeatPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this._loginService.validarRUT(this.rut)) {
      this.errorMessage = 'El RUT ingresado no es válido.';
      return;
    }

    passwordFinal = this._loginService.encryptText(this.password);

    const newUser: Usuario = {
      rut: this.rut,
      password: passwordFinal,
      rol: [this.defaultRoleId],
      estado: 1
    };

    try {
      // Llama al servicio para crear el usuario
      await firstValueFrom(this._usuarioService.crearUsuario(newUser)); // Asegúrate de que la función `crearUsuario` devuelva un Observable
      this.successMessage = 'Usuario creado exitosamente.';
      this.presentToast(this.successMessage);
      this.closeModal(); // Cierra el modal si el registro fue exitoso
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
      console.log(this.errorMessage)
      console.error('Error al crear usuario:', error);
    }
  }

}
