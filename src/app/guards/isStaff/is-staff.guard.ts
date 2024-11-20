import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { KEY_USER_INFO } from 'src/constantes';

export const isStaffGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const encriptadorService = inject(EncriptadorService);  // Inyecta el servicio de encriptación

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: KEY_USER_INFO });

  if (value) {
    console.log('Valor recuperado de Preferences:', value); // Log para depuración

    // Desencriptar el valor antes de parsearlo
    const decryptedValue = encriptadorService.decrypt(value); // Desencriptamos el valor
    console.log('Valor desencriptado:', decryptedValue); // Log para depuración

    // Parsear el valor desencriptado a un objeto
    const infoUser = JSON.parse(decryptedValue);
    console.log('Información del usuario:', infoUser); // Log para depuración

    // Verificar si el usuario tiene los permisos necesarios
    if ([1, 3, 4, 5, 6].includes(infoUser.rol[0])) {
      return true;
    } else {
      // Redirigir si el usuario no tiene los permisos adecuados
      console.log('Acceso denegado: usuario no es admin o user'); // Log para depuración
      await Preferences.remove({ key: KEY_USER_INFO });
      router.navigate(['/home']); // Redirigir a la ruta que desees
      return false; // Denegar el acceso
    }
  }

  // Si no hay información del usuario, redirigir al inicio
  console.log('No hay información del usuario. Redirigiendo a /home'); // Log para depuración
  router.navigate(['/home']);
  return false;
};
