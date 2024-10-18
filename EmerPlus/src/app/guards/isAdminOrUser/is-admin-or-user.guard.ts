import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const isAdminOrUserGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: "userInfo" });

  if (value) {
    console.log('Valor recuperado de Preferences:', value); // Log para depuración
    const infoUser = JSON.parse(value);
    console.log('Información del usuario:', infoUser); // Log para depuración

    // Verifica si el usuario tiene el rol de 'admin'
    if (infoUser.rol && infoUser.rol[0] === 1 || infoUser.rol[0] === 2) {
      return true; // Permitir el acceso
    } else {
      // Redirigir si no es admin
      console.log('Acceso denegado: usuario no es admin o user'); // Log para depuración
      await Preferences.remove({ key: 'userInfo' });
      router.navigate(['/home']); // Cambia esto a la ruta que desees
      return false; // Denegar el acceso
    }
  }

  // Si no hay información del usuario, redirigir al inicio
  console.log('No hay información del usuario. Redirigiendo a /home'); // Log para depuración
  router.navigate(['/home']);
  return false;
};
