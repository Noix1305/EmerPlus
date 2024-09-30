import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/loginService/login.service';

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

  async handleLoginSubmit(event: Event) {
    event.preventDefault(); // Evita que el formulario se envíe por defecto

    this.errorMessage = ''; // Reinicia mensaje de error
    this.rutNoRegistrado = ''; // Reinicia mensaje de RUT no registrado

    const rut = this.username; // Usa el RUT como nombre de usuario
    const password = this._loginService.encryptText(this.password); // Obtén la contraseña del formulario

    // Verifica si el RUT existe (ahora es asíncrono)
    const rutExists = await this._loginService.isRUTExist(rut);
    if (rutExists) {
      try {
        const user = await this._loginService.login(rut, password); // Llama al método de Supabase para autenticar

        if (user) {
          // Si el usuario se encuentra y la contraseña es correcta
          this.router.navigate(['user-info'], { state: { usuario: user } });
          this.closeModal();
        } else {
          this.errorMessage = 'Credenciales incorrectas'; // Maneja credenciales incorrectas
        }
      } catch (error) {
        this.errorMessage = 'Ocurrió un error durante el login. Inténtalo de nuevo.';
        console.error('Error en el login:', error); // Maneja el error
      }
    } else {
      this.rutNoRegistrado = 'El RUT ingresado no se encuentra registrado.';
      this.cd.detectChanges(); // Forzar la detección de cambios
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
