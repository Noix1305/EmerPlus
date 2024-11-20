import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { COLOR_ERROR, COLOR_EXITO, SWAL_ERROR, SWAL_SUCCESS } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

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

  colorVerde: string = COLOR_EXITO;
  colorRojo: string = COLOR_ERROR;


  constructor(
    private loadingController: LoadingController,
    private _usuarioService: UsuarioService,
    private _encriptadorService: EncriptadorService) { }

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
      this.mostrarSwal(SWAL_ERROR, 'Error', this.errorMessage);
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.mostrarSwal(SWAL_ERROR, 'Error', this.errorMessage);
      return;
    }

    // if (!this._loginService.validarRUT(this.rut)) {
    //   this.errorMessage = 'El RUT ingresado no es válido.';
    //   this.mostrarSwal('error', 'Error', this.errorMessage);
    //   return;
    // }

    passwordFinal = this._encriptadorService.encrypt(this.password);

    const newUser: Usuario = {
      rut: this.rut,
      password: passwordFinal,
      rol: [this.roleId],
      estado: 1
    };

    // Muestra el loading
    const loading = await this.loadingController.create({
      message: 'Creando usuario...',
    });
    await loading.present(); // Presenta el loading

    try {
      // Llama al servicio para crear el usuario
      await firstValueFrom(this._usuarioService.crearUsuario(newUser)); // Asegúrate de que la función `crearUsuario` devuelva un Observable
      this.successMessage = 'Usuario creado exitosamente.';
      this.mostrarSwal(SWAL_SUCCESS, 'Éxito', this.successMessage);

    } catch (error) {

      console.error('Error al crear usuario:', error);
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
      this.mostrarSwal(SWAL_ERROR, 'Error', this.errorMessage);

    } finally {
      // Cierra el loading después de procesar la solicitud
      loading.dismiss();
    }
  }

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      text: text,
      heightAuto: false
    });
  }


}
