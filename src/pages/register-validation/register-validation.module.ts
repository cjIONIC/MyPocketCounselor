import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterValidationPage } from './register-validation';

@NgModule({
  declarations: [
    RegisterValidationPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterValidationPage),
  ],
})
export class RegisterValidationPageModule {}
