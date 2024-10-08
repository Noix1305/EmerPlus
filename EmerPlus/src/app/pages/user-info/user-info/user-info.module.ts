import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInfoPageRoutingModule } from './user-info-routing.module';

import { UserInfoPage } from './user-info.page';
import { CambiarPassComponent } from 'src/app/components/cambiar-pass/cambiar-pass.component';
import { MenuComponent } from 'src/app/components/menu/menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserInfoPageRoutingModule,
    ReactiveFormsModule,
    
  ],
  declarations: [
    UserInfoPage,
    CambiarPassComponent,
    MenuComponent,
  ]
})
export class UserInfoPageModule {}
