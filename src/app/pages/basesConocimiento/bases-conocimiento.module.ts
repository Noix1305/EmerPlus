import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BasesConocimientoPageRoutingModule } from './bases-conocimiento-routing.module';

import { BasesConocimientoPage } from './bases-conocimiento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BasesConocimientoPageRoutingModule
  ],
  declarations: [BasesConocimientoPage]
})
export class BasesConocimientoPageModule {}
