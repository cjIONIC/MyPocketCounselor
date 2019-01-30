import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HeadControlsPage } from './head-controls';

@NgModule({
  declarations: [
    HeadControlsPage,
  ],
  imports: [
    IonicPageModule.forChild(HeadControlsPage),
  ],
})
export class HeadControlsPageModule {}
