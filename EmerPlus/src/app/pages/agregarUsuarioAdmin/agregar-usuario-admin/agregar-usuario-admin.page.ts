import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

@Component({
  selector: 'app-agregar-usuario-admin',
  templateUrl: './agregar-usuario-admin.page.html',
  styleUrls: ['./agregar-usuario-admin.page.scss'],
})
export class AgregarUsuarioAdminPage implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';

  rut: string = '';
  password: string = '';
  repeatPassword: string = '';
  roleId: number = 0;

  colorVerde: string = 'success';
  colorRojo: string = 'danger';


  constructor(
    private _usuarioService: UsuarioService,
    private _loginService: LoginService,
    private toastController: ToastController) { }

  ngOnInit() {
  }

  async formularioRegistroAdmin(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    

    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.successMessage = ''; // Reiniciar el mensaje de éxito
    let passwordFinal = '';

    // Validar campos
    if (!this.rut || !this.password || !this.repeatPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      this.presentToast(this.errorMessage, this.colorRojo);
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.presentToast(this.errorMessage, this.colorRojo);
      return;
    }

    if (!this._loginService.validarRUT(this.rut)) {
      this.errorMessage = 'El RUT ingresado no es válido.';
      this.presentToast(this.errorMessage, this.colorRojo);
      return;
    }

    passwordFinal = this._loginService.encryptText(this.password);

    const newUser: Usuario = {
      rut: this.rut,
      password: passwordFinal,
      rol: [this.roleId],
      estado: 1
    };

    try {
      // Llama al servicio para crear el usuario
      await firstValueFrom(this._usuarioService.crearUsuario(newUser)); // Asegúrate de que la función `crearUsuario` devuelva un Observable
      this.successMessage = 'Usuario creado exitosamente.';
      this.presentToast(this.successMessage, this.colorVerde);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
      this.presentToast(this.errorMessage, this.colorRojo);
    }
  }

  async presentToast(successMessage: string, color: string) {
    const toast = await this.toastController.create({
      message: successMessage,
      duration: 2000, // Duración en milisegundos
      position: 'top', // Posición del Toast
      color: color, // Color del Toast, puedes cambiarlo según tus necesidades
    });
    toast.present();
  }

}
