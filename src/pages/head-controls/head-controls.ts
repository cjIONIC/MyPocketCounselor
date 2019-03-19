import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController } from 'ionic-angular';
import { HeadControlsStatisticsPage } from '../head-controls-statistics/head-controls-statistics';
import { HeadControlsConcernsPage } from '../head-controls-concerns/head-controls-concerns';
import { HeadControlsCounselorsPage } from '../head-controls-counselors/head-controls-counselors';
import { ModalHotlineComponent } from '../../components/modal-hotline/modal-hotline';
import { HeadControlsAcademicsPage } from '../head-controls-academics/head-controls-academics';

/**
 * Generated class for the HeadControlsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls',
  templateUrl: 'head-controls.html',
})
export class HeadControlsPage {

  constructor(public navCtrl: NavController, 
      public modalCtrl: ModalController,
      public navParams: NavParams,
      public app: App) {
  }

  //Views Statistics
  statistics() {
    this.app.getRootNav().push(HeadControlsStatisticsPage);
  }

  //Views Student Concerns
  concerns() {
    this.app.getRootNav().push(HeadControlsConcernsPage);
  }

  counselors() {
    this.app.getRootNav().push(HeadControlsCounselorsPage);
  }

  academics() {
    console.log("Academic Units");
    this.app.getRootNav().push(HeadControlsAcademicsPage);
  }

  hotline() {
    const modal = this.modalCtrl.create(ModalHotlineComponent, "",{ cssClass: 'custom-modal-hotline' });
    modal.present();
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsPage');
  }

}
