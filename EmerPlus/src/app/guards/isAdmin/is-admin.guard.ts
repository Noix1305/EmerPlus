import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const isAdminGuard: CanActivateFn = async (route, state) => {

  const router = inject(Router);

  const { value } = await Preferences.get({ key: "userInfo" });



  if (value) {
    console.log(value)
    const infoUser = JSON.parse(value);

    //   if(infoUser.)

    //     router.navigate(["/home"])
    // }
  }

  return false;

};
