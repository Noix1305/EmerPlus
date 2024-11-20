import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
// Asegúrate de importar el servicio

export const isUsuarioGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const encriptadorService = inject(EncriptadorService);  // Inyectamos el servicio de encriptación

  const { value } = await Preferences.get({ key: "userInfo" });

  // Verifica si el valor existe
  if (value) {
    try {
      // Desencriptar el valor usando el servicio de desencriptación
      const decryptedData = encriptadorService.decrypt(value);

      if (decryptedData) {
        const infoUser = JSON.parse(decryptedData);  // Ahora que está desencriptado, lo parseamos como JSON

        // Verifica si el usuario tiene el rol de 'usuario' (en este caso rol[0] === 2)
        if (infoUser.rol && infoUser.rol[0] != 1) {
          return true; // Permite el acceso si el rol es correcto
        } else {
          console.log('Acceso denegado: usuario no tiene rol de usuario');
          router.navigate(['/home']);  // Redirige a home si el rol no es válido
          return false;
        }
      } else {
        console.error('Error al desencriptar los datos');
        router.navigate(['/home']);
        return false;
      }
    } catch (error) {
      console.error('Error al desencriptar o parsear los datos:', error);
      router.navigate(['/home']);
      return false;
    }
  }

  console.log('No hay información del usuario o valor inválido. Redirigiendo a /home');
  router.navigate(['/home']);
  return false;
};
