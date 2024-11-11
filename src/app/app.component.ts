import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from './models/usuario';
import { UsuarioService } from './services/usuarioService/usuario.service';
import { MenuController } from '@ionic/angular'; // Importar MenuController
import { register } from 'swiper/element/bundle'; 
import { Subscription } from 'rxjs';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isAdmin = false;
  isUser = false;
  usuario: Usuario | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private _usuarioService: UsuarioService,
    private menu: MenuController // Inyectar MenuController
  ) {}

  ngOnInit() {
    this.userSubscription = this._usuarioService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      if (this.usuario) {
        const rol = this.usuario.rol[0];
        this.isAdmin = rol === 1;
        this.isUser = rol === 2;
      } else {
        this.isAdmin = false;
        this.isUser = false;
      }
    });

    // Cargar el usuario al iniciar la aplicación
    this._usuarioService.cargarUsuario();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.verificarRol(); 
  }

  verificarRol() {
    const usuario = this._usuarioService.getUsuario();
    if (usuario) {
      const rol = usuario.rol[0];
      this.isAdmin = rol === 1;
    } else {
      this.isAdmin = false;
    }
  }

  async cerrarSesion() {
    console.log('Cerrando sesión...');
    try {
      await Preferences.remove({ key: 'userInfo' }); 
      this.navigateAndCloseMenu('/home')
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async navigateAndCloseMenu(path: string) {
    // Cerrar el menú
    await this.menu.close();
    // Redirigir a la página
    await this.router.navigate([path]);
  }
}
