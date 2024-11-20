import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-pass',
  templateUrl: './cambiar-pass.component.html',
  styleUrls: ['./cambiar-pass.component.scss'],
})
export class CambiarPassComponent implements OnInit {

  form: FormGroup;
  rut: string;
  password: string;
  errorMsg: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private _encriptadorService:EncriptadorService,
    private navParams: NavParams,
  ) {

    this.rut = this.navParams.get('rut');
    this.password = this.navParams.get('password');

    this.form = this.fb.group({
      contrasenaActual: ['', Validators.required],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required],
    }, { validator: this.passwordsMatchValidator });
  }

  ngOnInit() { }

  passwordsMatchValidator(form: FormGroup) {
    const nuevaContrasena = form.get('nuevaContrasena')?.value;
    const confirmarContrasena = form.get('confirmarContrasena')?.value;
    return nuevaContrasena === confirmarContrasena ? null : { mismatch: true };
  }

  async cambiarContrasena() {


    if (this.form.invalid) {
      console.error('Formulario inválido');
      return;
    }

    var cambioExitoso = false;

    let { contrasenaActual, nuevaContrasena } = this.form.value;
    const contrasenaDesencriptada = this._encriptadorService.decrypt(this.password);

    if (contrasenaActual !== contrasenaDesencriptada) {
      this.errorMsg = 'La contraseña actual no es correcta';
      return;
    }

    const nuevaContrasenaEncriptada = this._encriptadorService.encrypt(nuevaContrasena);

    try {

      const response = await firstValueFrom(this._usuarioService.cambiarContrasena(this.rut, nuevaContrasenaEncriptada));
      console.log("response: " + response.status)
      // Verificar el código de estado de la respuesta
      if (response.status === 204) {
        this.successMessage = 'Contraseña cambiada con éxito.';

        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.successMessage,
          timer: 2000,
          heightAuto: false
        });

        cambioExitoso = true;
      } else {
        // Mostrar mensaje de error si el código de estado no es 200
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cambiar la contraseña.',
          timer: 2000,
          heightAuto: false
        });
      }

    } catch (error: any) {  // Manejo de error
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error inesperado.',
        timer: 2000,
        heightAuto: false
      });
    }

    if (cambioExitoso) {
      await this.modalCtrl.dismiss({
        success: true,
        nuevaContrasena: nuevaContrasenaEncriptada // Envía la nueva contraseña encriptada
      });
    } else {
      await this.modalCtrl.dismiss({ success: false });
    }

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
