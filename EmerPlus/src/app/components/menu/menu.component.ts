import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {

  constructor(private router: Router) { }

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
