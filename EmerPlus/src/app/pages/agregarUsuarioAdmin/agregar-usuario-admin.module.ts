import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarUsuarioAdminPageRoutingModule } from './agregar-usuario-admin-routing.module';

import { AgregarUsuarioAdminPage } from './agregar-usuario-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarUsuarioAdminPageRoutingModule
  ],
  declarations: [AgregarUsuarioAdminPage]
})
export class AgregarUsuarioAdminPageModule {}
