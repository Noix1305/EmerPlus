import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { RegistroModalComponent } from 'src/app/components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/app/components/log-in-modal/log-in-modal.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    RegistroModalComponent,
    LoginModalComponent
  ]
})
export class HomePageModule { }
