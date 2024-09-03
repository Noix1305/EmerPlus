import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { LoginModalComponent } from '../login-modal/login-modal.component'; // Importación correcta del componente

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    LoginModalComponent  // Declaración del componente modal
  ]
})
export class HomePageModule {}
