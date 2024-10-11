import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { Usuario } from 'src/app/models/usuario';
import { firstValueFrom, map } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-log-in-modal',
  templateUrl: './log-in-modal.component.html',
  styleUrls: ['./log-in-modal.component.scss'],
})
export class LoginModalComponent {
  @Input() openRegistroModal!: () => void;
  username: string = '';
  password: string = '';
  emailInput: string = '';
  errorMessage: string = '';
  rutNoRegistrado: string = '';
  msgContrasenaOlvidada: string = '';
  isPasswordRecovery: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private modalController: ModalController,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private router: Router
  ) { }

  closeModal() {
    this.modalController.dismiss();
  }

  togglePasswordRecovery() {
    this.errorMessage = ''; // Reinicia mensaje de error
    this.rutNoRegistrado = ''; // Reinicia mensaje de RUT no registrado
    this.username = '';
    this.password = '';
    this.emailInput = '';
    this.errorMessage = '';
    this.rutNoRegistrado = '';
    this.msgContrasenaOlvidada = '';
    this.isPasswordRecovery = !this.isPasswordRecovery; // Alterna el estado
  }

  async handlePasswordRecovery(event: Event) {

  }

  async onSubmitForgotPassword(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;
  
    if (!rut) {
      console.error('RUT es requerido');
      return;
    }
  
    try {
      await this._usuarioService.enviarContraseñaPorRut(rut);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error durante la recuperación de contraseña:', error.message);
        alert(error.message || 'Ocurrió un error inesperado.');
      } else {
        console.error('Error desconocido:', error);
        alert('Ocurrió un error inesperado.');
      }
    }
  }

  async handleLoginSubmit(event: Event) {
    event.preventDefault(); // Evita que el formulario se envíe por defecto

    this.errorMessage = ''; // Reinicia los mensajes de error
    this.rutNoRegistrado = ''; // Reinicia el mensaje de RUT no registrado

    const rut = this.username; // Usa el RUT como nombre de usuario
    const password = this._loginService.encryptText(this.password); // Encripta la contraseña del formulario

    try {
      // Obtiene los usuarios activos como un observable
      const response = await firstValueFrom(this._usuarioService.obtenerUsuarios().pipe(
        map(res => res.body || [])
      ));

      const usuariosActivos: Usuario[] = response; // Ahora puedes acceder a usuarios activos directamente

      // Usar el tipo de usuario aquí
      const usuarioExistente = usuariosActivos.find((usuario: Usuario) => usuario.rut === rut);

      if (!usuarioExistente) {
        // Si el usuario no existe, solicita el registro
        this.rutNoRegistrado = 'El RUT ingresado no se encuentra registrado. Por favor, regístrate.';
        return; // Salir de la función temprano
      }

      // Ahora intenta iniciar sesión
      const user = await this._loginService.login(rut, password); // Llama al método de inicio de sesión

      if (user) {

        const setName = async () => {
          await Preferences.set({
            key: 'userInfo',
            value: JSON.stringify(user),
          });
        };
        // Si el usuario se encuentra y la contraseña es correcta
        this.router.navigate(['user-info'], { state: { usuario: user } });
        this.closeModal(); // Cierra el modal
      } else {
        // Si la contraseña es incorrecta
        this.errorMessage = 'Credenciales incorrectas'; // Maneja credenciales incorrectas
      }
    } catch (error) {
      // Maneja cualquier error durante el proceso de inicio de sesión
      this.errorMessage = 'Ocurrió un error durante el login. Inténtalo de nuevo.';
      console.error('Error en el login:', error); // Registra el error
    }
  }




  rutNotRegistrado() {
    this.closeModal();
    if (this.openRegistroModal) {
      this.openRegistroModal(); // Llama solo si está definido
    } else {
      console.error('openRegistroModal no está definido');
    }
  }

  contraseñaOlvidada() {

  }
}
