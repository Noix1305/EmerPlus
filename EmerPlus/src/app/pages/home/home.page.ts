import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import { Router } from '@angular/router';
import { LoginService } from '../../services/loginService/login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild('modalRegistro', { static: false }) modalRegistro!: IonModal; // Captura el modal de registro específicamente
  @ViewChild('loginModal', { static: false }) loginModal!: IonModal;
  username: string = '';
  password: string = '';

  name!: string;
  message = 'Ingresar Credenciales';
  errorMessage: string = '';

  constructor(private _loginService: LoginService, private router: Router) { }

  closeModal(modal: IonModal) {
    if (modal) {
      modal.dismiss(null, 'cancel');
    } else {
      console.error('El modal no está disponible para cerrar.');
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log('Modal cerrado con confirmación');
    }
  }

  mostrarUsuarios() {
    this._loginService.mostrarUsuarios();
  }

  onLogin() {
    const user = this._loginService.login(this.username, this.password);
  
    if (user) {
      // Si se encuentra el usuario, redirige y cierra el modal de inicio de sesión
      this.router.navigate(['user-info'], {
        state: {
          usuario: user // Asegúrate de que 'usuario' tenga los datos correctos
        }
      });
      this.loginModal.dismiss(); // Asegúrate de que se cierra el modal correcto
    } else {
      this.errorMessage = 'Credenciales incorrectas';
      console.error('Credenciales incorrectas');
    }
  }

  // Método para manejar el formulario de registro
  handleRegistroSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const rut = formData.get('rut') as string;
    const password = formData.get('password') as string;
    const repeatPassword = formData.get('repeatPassword') as string;

    if (!this.validateRUT(rut)) {
      this.errorMessage = 'RUT inválido';
      return;
    }

    if (password === repeatPassword) {
      if (this._loginService.isRUTExist(rut)) {
        this.errorMessage = 'El RUT ya está registrado.'; // Mostrar mensaje de error si el RUT ya existe
      } else {
        console.log('Registro exitoso:', { rut, password });
        // Aquí puedes manejar el registro (enviar datos al servidor, etc.)
        this.closeModal(this.modalRegistro); // Asegúrate de cerrar el modal de registro
      }
    } else {
      this.errorMessage = 'Las contraseñas no coinciden.';
    }
  }

  validateRUT(rut: string): boolean {
    rut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();
    if (!/^\d{7,8}[Kk\d]$/.test(rut)) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    const dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();

    return dv === dvEsperado;
  }
}