import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const isStaffGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: "userInfo" });

  if (value) {
    console.log('Valor recuperado de Preferences:', value); // Log para depuración
    const infoUser = JSON.parse(value);
    console.log('Información del usuario:', infoUser); // Log para depuración

    if ([1, 3, 4, 5].includes(infoUser.rol[0])) {
      return true;
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
