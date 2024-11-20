import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';

export const isAdminOrUserGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const encriptadorService = inject(EncriptadorService); // Inyecta el servicio de encriptación

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: 'userInfo' });

  if (value) {
    console.log('Valor recuperado de Preferences:', value); // Log para depuración
    
    // Desencripta el valor recuperado antes de intentar parsearlo
    const decryptedValue = encriptadorService.decrypt(value);
    
    try {
      const infoUser = JSON.parse(decryptedValue); // Parsea el valor desencriptado
      console.log('Información del usuario:', infoUser); // Log para depuración

      // Verifica si el usuario tiene el rol de 'admin' o uno de los otros roles permitidos
      if ([1, 2, 3, 4, 5].includes(infoUser.rol[0])) {
        return true;
      } else {
        // Redirigir si no es admin
        console.log('Acceso denegado: usuario no es admin o user'); // Log para depuración
        await Preferences.remove({ key: 'userInfo' });
        router.navigate(['/home']); // Cambia esto a la ruta que desees
        return false; // Denegar el acceso
      }
    } catch (error) {
      console.error('Error al parsear la información del usuario:', error);
      router.navigate(['/home']);
      return false;
    }
  }

  // Si no hay información del usuario, redirigir al inicio
  console.log('No hay información del usuario. Redirigiendo a /home'); // Log para depuración
  router.navigate(['/home']);
  return false;
};
