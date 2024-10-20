import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from './models/usuario';
import { UsuarioService } from './services/usuarioService/usuario.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isAdmin = false;
  isUser = false;
  usuario: Usuario | null = null;

  constructor(private router: Router, private _usuarioService: UsuarioService) {
  }

  ngOnInit() {
    this._usuarioService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      let rol = 2
      if (this.usuario) {
        rol = this.usuario.rol[0];
        if (rol === 1) {
          this.isAdmin = true;
        } else if (rol === 2) {
          this.isUser = true;
        }
      } else {
        this.isAdmin = false;
        this.isUser = false;
      }
    });

    // Cargar el usuario al iniciar la aplicación
    this._usuarioService.cargarUsuario();
  }

  ionViewWillEnter() {
    this.verificarRol(); // Se llama cada vez que la vista entra en foco
  }

  verificarRol() {
    const usuario = this._usuarioService.getUsuario();
    if (usuario) {
      const rol = usuario.rol[0];
      this.isAdmin = rol === 1;
      console.log('Rol verificado:', rol);
    } else {
      this.isAdmin = false;
    }
  }

  async cerrarSesion() {
    console.log('Cerrando sesión...'); // Asegúrate de que esto se imprima en la consola
    try {
      // Eliminar datos específicos de Preferences
      await Preferences.remove({ key: 'userInfo' }); // Elimina solo el campo userInfo

      // Redirigir al usuario a la página de inicio
      this.router.navigate(['/home']);
      console.log('Sesión cerrada y datos eliminados de Preferences.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
