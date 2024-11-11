import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const isUsuarioGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  // Intenta obtener el valor almacenado en Preferences
  const { value } = await Preferences.get({ key: "userInfo" });

  if (value) {
    const infoUser = JSON.parse(value);

    // Verifica si el usuario tiene el rol de 'usuario'
    if (infoUser.rol && infoUser.rol[0] === 2) { // Asumiendo que el rol de usuario es 2
      return true; // Permitir el acceso
    } else {
      console.log('Acceso denegado: usuario no tiene rol de usuario'); // Log para depuración
      router.navigate(['/home']); // Redirigir a la ruta deseada
      return false; // Denegar el acceso
    }
  }

  // Si no hay información del usuario, redirigir al inicio
  console.log('No hay información del usuario. Redirigiendo a /home'); // Log para depuración
  router.navigate(['/home']);
  return false;
};
