import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';

export const isAdminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const encriptadorService = inject(EncriptadorService); // Inyecta el servicio de encriptación

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: "userInfo" });

  if (value) {
    console.log('Valor recuperado de Preferences:', value); // Log para depuración

    try {
      // Desencripta el valor antes de parsearlo
      const decryptedValue = encriptadorService.decrypt(value);
      console.log('Valor desencriptado:', decryptedValue); // Log para depuración

      const infoUser = JSON.parse(decryptedValue);
      console.log('Información del usuario:', infoUser); // Log para depuración

      // Verifica si el usuario tiene el rol de 'admin'
      if (infoUser.rol && infoUser.rol[0] === 1) {
        return true; // Permitir el acceso
      } else {
        // Redirigir si no es admin
        console.log('Acceso denegado: usuario no es admin'); // Log para depuración
        await Preferences.remove({ key: 'userInfo' });
        router.navigate(['/home']); // Cambia esto a la ruta que desees
        return false; // Denegar el acceso
      }
    } catch (error) {
      console.error('Error al desencriptar o parsear la información del usuario:', error);
      await Preferences.remove({ key: 'userInfo' });
      router.navigate(['/home']); // Redirige a home si ocurre un error
      return false;
    }
  }

  // Si no hay información del usuario, redirigir al inicio
  console.log('No hay información del usuario. Redirigiendo a /home'); // Log para depuración
  router.navigate(['/home']);
  return false;
};
