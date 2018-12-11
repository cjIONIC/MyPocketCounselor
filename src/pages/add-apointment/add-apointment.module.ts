import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddApointmentPage } from './add-apointment';

@NgModule({
  declarations: [
    AddApointmentPage,
  ],
  imports: [
    IonicPageModule.forChild(AddApointmentPage),
  ],
})
export class AddApointmentPageModule {}
