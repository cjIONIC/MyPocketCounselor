import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppointmentAddPage } from './appointment-add';

@NgModule({
  declarations: [
    AppointmentAddPage,
  ],
  imports: [
    IonicPageModule.forChild(AppointmentAddPage),
  ],
})
export class AppointmentAddPageModule {}
