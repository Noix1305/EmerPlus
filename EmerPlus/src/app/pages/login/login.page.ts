import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { Usuario } from 'src/app/models/usuario';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';
  emailInput: string = '';
  errorMessage: string = '';
  rutNoRegistrado: string = '';
  msgContrasenaOlvidada: string = '';
  isPasswordRecovery: boolean = false;

  ngOnInit() {

  }

  constructor(
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private router: Router,
  ) { }

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

  async mostrarFormularioRegistro() {
    mostrarFormularioRegistro(this._usuarioService, this._loginService);
  }

  async onSubmitForgotPassword(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;

    if (!rut) {
      this.errorMessage = 'RUT es requerido';
      console.error('RUT es requerido');
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
        heightAuto: false
      });
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
      // Obtiene los usuarios activos directamente como un observable
      const usuariosActivos: Usuario[] = await firstValueFrom(this._usuarioService.obtenerUsuarios());

      // Usar el tipo de usuario aquí
      const usuarioExistente = usuariosActivos.find((usuario: Usuario) => usuario.rut === rut);

      if (!usuarioExistente) {
        // Si el usuario no existe, solicita el registro
        this.rutNoRegistrado = 'El RUT ingresado no se encuentra registrado. ';
        return false; // Salir de la función temprano
      }

      // Ahora intenta iniciar sesión
      const user = await this._loginService.login(rut, password); // Llama al método de inicio de sesión

      if (user) {
        // Guarda la información del usuario en Preferences
        await Preferences.set({
          key: 'userInfo',
          value: JSON.stringify(user) // Convierte el objeto de usuario a string
        });

        this._usuarioService.actualizarUsuario(user);

        if ([1, 3, 4, 5].includes(user.rol[0])) {
          this.router.navigate(['admin']);
        } else if (user.rol[0] === 2) {
          this.router.navigate(['dashboard']);
        } else {
          this.router.navigate(['home']);
        }

      } else {
        // Si la contraseña es incorrecta
        this.errorMessage = 'Credenciales incorrectas'; // Maneja credenciales incorrectas
        return false; // No permite el acceso
      }
    } catch (error) {
      // Maneja cualquier error durante el proceso de inicio de sesión
      this.errorMessage = 'Ocurrió un error durante el login. Inténtalo de nuevo.';
      console.error('Error en el login:', error); // Registra el error
      return false; // No permite el acceso
    }

    return false; // Valor por defecto al final de la función
  }
}



