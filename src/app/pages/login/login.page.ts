import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/loginService/login.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { Usuario } from 'src/app/models/usuario';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { LoadingController } from '@ionic/angular';
import { KEY_USER_INFO, MENSAJE_CARGANDO, RUTA_ADMIN, RUTA_DASHBOARD, RUTA_HOME, RUTA_SOPORTE, SWAL_ERROR } from 'src/constantes';

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
    private _encriptadorService: EncriptadorService,
    private router: Router,
    private loadingController: LoadingController
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
    mostrarFormularioRegistro(this._usuarioService, this._encriptadorService);
  }

  async onSubmitForgotPassword(event: Event): Promise<void> {

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;

    if (!rut) {
      this.errorMessage = 'RUT es requerido';
      console.error('RUT es requerido');

      this.mostrarSwal(SWAL_ERROR, 'Error', this.errorMessage)

      loading.dismiss();
      return;
    }

    try {
      await this._usuarioService.enviarContraseñaPorRut(rut);
      loading.dismiss();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.mostrarSwal(SWAL_ERROR, 'Ocurrió un error inesperado.', 'Error: ' + error.message)
      } else {
        console.error();
        this.mostrarSwal(SWAL_ERROR, 'Ocurrió un error inesperado.', 'Error desconocido:' + error)
      }
    }
  }

  async handleLoginSubmit(event: Event) {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });
    await loading.present();
    event.preventDefault(); // Evita que el formulario se envíe por defecto

    this.errorMessage = ''; // Reinicia los mensajes de error
    this.rutNoRegistrado = ''; // Reinicia el mensaje de RUT no registrado

    try {
      // Obtiene los usuarios activos directamente como un observable
      const usuariosActivos: Usuario[] = await firstValueFrom(this._usuarioService.obtenerUsuarios());

      // Usar el tipo de usuario aquí
      const usuarioExistente = usuariosActivos.find((usuario: Usuario) => usuario.rut === this.username);

      if (!usuarioExistente) {
        // Si el usuario no existe, solicita el registro
        this.rutNoRegistrado = 'El RUT ingresado no se encuentra registrado. ';
        loading.dismiss();
        return; // Salir de la función temprano
      }

      // Ahora intenta iniciar sesión
      const user = await this._loginService.login(usuarioExistente.rut, this.password); // Llama al método de inicio de sesión

      if (user) {
        // Encriptar el usuario antes de guardarlo en Preferences
        const encryptedUser = this._encriptadorService.encrypt(JSON.stringify(user)); // Encriptar el objeto del usuario

        // Guarda la información del usuario en Preferences de forma encriptada
        await Preferences.set({
          key: KEY_USER_INFO,
          value: encryptedUser // Guardamos el usuario encriptado
        });

        loading.dismiss();

        // Navegar según el rol del usuario
        if ([1, 3, 4, 5, 6].includes(user.rol[0])) {
          this.router.navigate([RUTA_ADMIN]);
        } else if (user.rol[0] === 2) {
          this.router.navigate([RUTA_DASHBOARD]);
        } else {
          this.router.navigate([RUTA_HOME]);
        }


      } else {
        // Si la contraseña es incorrecta
        this.errorMessage = 'Credenciales incorrectas'; // Maneja credenciales incorrectas
        loading.dismiss();
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

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      text: text,
      heightAuto: false
    });
  }

  public navSoporte() {
    this.router.navigate([RUTA_SOPORTE]);
  } 

}



