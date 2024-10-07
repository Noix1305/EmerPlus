import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

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

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private navParams: NavParams) {

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
    // Si el formulario es inválido, no se procederá
    if (this.form.invalid) {
      console.error('Formulario inválido');
      return;
    }

    // Extraer valores del formulario
    let { contrasenaActual, nuevaContrasena } = this.form.value;

    // Desencriptar la contraseña actual almacenada para comparar
    const contrasenaDesencriptada = this._loginService.decryptText(this.password);
    console.log('Contraseña Actual desencriptada: ' + contrasenaDesencriptada);

    // Verificar si la contraseña actual proporcionada coincide con la desencriptada
    if (contrasenaActual !== contrasenaDesencriptada) {
      this.errorMsg = 'La contraseña actual no es correcta';
      return;
    }

    // Encriptar la nueva contraseña antes de enviarla al servidor
    try {
      const nuevaContrasenaEncriptada = this._loginService.encryptText(nuevaContrasena);
      await firstValueFrom(this._usuarioService.cambiarContrasena(this.rut, nuevaContrasenaEncriptada));
      console.log('Contraseña cambiada con éxito');
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
    }

    // Cerrar el modal
    this.closeModal();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
