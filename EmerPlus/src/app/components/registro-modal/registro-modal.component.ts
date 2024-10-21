import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { CrearUsuario } from 'src/app/models/crearUsuario';
import { Usuario } from 'src/app/models/usuario';
import { LoginService } from 'src/app/services/loginService/login.service';
import { SupabaseService } from 'src/app/services/supabase_service/supabase.service';
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
  correo: string = '';

  errorMessage: string = '';
  successMessage: string = '';


  constructor(
    private modalController: ModalController,
    private _usuarioService: UsuarioService,
    private _loginService: LoginService,
    private supabaseService: SupabaseService,
    private toastController: ToastController) { }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
    this.rut = '';
    this.password = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.correo = '';
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
    if (!this.rut || !this.password || !this.repeatPassword || !this.correo) {
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

    try {
      // Verificar si el usuario ya existe en tu base de datos
      const usuarioExistenteBD = await firstValueFrom(this._usuarioService.getUsuarioPorRut(this.rut));
      if (usuarioExistenteBD.body && Array.isArray(usuarioExistenteBD.body) && usuarioExistenteBD.body.length > 0) {
        // Si el RUT ya está registrado
        this.errorMessage = 'El RUT ya está registrado en la base de datos.';
        console.error(this.errorMessage);
        return;
      }

      // // Verificar si el correo ya existe en Supabase
      // const { data: supabaseUserExistente, error: supabaseError } = await this.supabaseService.auth.signUp({
      //   email: this.correo,
      //   password: passwordFinal
      // });

      // if (supabaseError) {
      //   this.errorMessage = 'Error al registrar el usuario en Supabase: ' + supabaseError.message;
      //   console.error(this.errorMessage);
      //   return;
      // }

      // Ahora verifica si el usuario puede ser registrado en tu base de datos
      const nuevoUsuario: CrearUsuario = {
        rut: this.rut,
        password: passwordFinal,
        rol: [this.defaultRoleId],
        correo: this.correo,
        estado: 1
      };

      // // Verificar si el usuario ya existe en la base de datos nuevamente, en caso de que se registre en Supabase
      // const usuarioExistenteBD2 = await firstValueFrom(this._usuarioService.getUsuarioPorRut(this.rut));
      // if (usuarioExistenteBD2.body && Array.isArray(usuarioExistenteBD2.body) && usuarioExistenteBD2.body.length > 0) {
      //   // Si el RUT ya está registrado después de intentar registrar en Supabase
      //   this.errorMessage = 'El RUT ya está registrado en la base de datos después de intentar registrarse en Supabase.';
      //   console.error(this.errorMessage);
      //   return;
      // }

      // Ahora proceder a registrar en tu base de datos
      console.log('Registrando nuevo usuario en la base de datos...');
      await firstValueFrom(this._usuarioService.crearUsuario(nuevoUsuario));

      this.successMessage = 'Usuario creado exitosamente.';
      this.presentToast(this.successMessage);
      this.closeModal(); // Cierra el modal si el registro fue exitoso
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
      console.log(this.errorMessage);
      console.error('Error al crear usuario:', error);
    }
  }

}
