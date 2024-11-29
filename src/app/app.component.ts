import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from './models/usuario';
import { UsuarioService } from './services/usuarioService/usuario.service';
import { MenuController } from '@ionic/angular'; // Importar MenuController
import { Subscription } from 'rxjs';
import { EncriptadorService } from './services/encriptador/encriptador.service'; // Importar el servicio de encriptación
import { KEY_USER_INFO, RUTA_HOME, RUTA_LOGIN } from 'src/constantes';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  isUser: boolean = false;
  isStaff: boolean = false;
  usuario: Usuario | null = null;
  userSubscription: Subscription | undefined;
  isLogged: boolean = false;

  constructor(
    private router: Router,
    private _usuarioService: UsuarioService,
    private menu: MenuController, // Inyectar MenuController
  ) { }

  ngOnInit() {
    // Cargar usuario y suscribirse a cambios
    this.cargarUsuarioYActualizarRol();
  }

  // Función para cargar el usuario y actualizar el rol
  cargarUsuarioYActualizarRol() {
    this._usuarioService.cargarUsuario();

    // Evitar múltiples suscripciones duplicadas
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    // Suscribirse a cambios en el usuario
    this.userSubscription = this._usuarioService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      this.actualizarRolUsuario(); // Actualizar roles basados en el nuevo usuario
    });
  }

  // Actualizar los roles según el rol del usuario actual
  actualizarRolUsuario() {

    if (this.usuario) {
      if ([3, 4, 5, 6].includes(this.usuario.rol[0])) {
        this.isStaff = true;
        console.log('Staff: ' + this.isStaff)
      }

      const rol = this.usuario.rol[0];
      this.isUser = rol === 2;
      this.isAdmin = rol === 1;
      console.log('Admin: ' + this.isAdmin);
      console.log('User: ' + this.isUser);

    } else {
      this.isAdmin = this.isUser = this.isStaff = false;
    }
    this.isLogged = true;

  }

  // Función para cerrar sesión
  async cerrarSesion() {
    console.log('Cerrando sesión...');
    try {
      // Cancelar suscripción y limpiar usuario
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
        console.log('Suscripción cancelada.');
      }

      // Limpiar datos de Preferences y del usuario
      await Preferences.remove({ key: KEY_USER_INFO });
      this.usuario = null;
      this.isAdmin = this.isUser = this.isStaff = false;

      // Navegar al inicio y cerrar el menú
      await this.navigateAndCloseMenu(RUTA_HOME);
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    this.isLogged = false;
    window.location.reload();
  }

  // Función para navegar y cerrar el menú
  async navigateAndCloseMenu(path: string) {
    await this.menu.close();
    await this.router.navigate([path]);
    this.cargarUsuarioYActualizarRol(); // Recargar usuario y rol después de navegación
  }

  iniciarSesion() {
    this.router.navigate([RUTA_LOGIN]);
  }

  ngOnDestroy() {
    // Cancelar suscripción al destruir el componente
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('Suscripción cancelada en ngOnDestroy.');
    }
  }
}
