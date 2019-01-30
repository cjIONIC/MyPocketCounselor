import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { HeadControlsStatisticsPage } from '../head-controls-statistics/head-controls-statistics';

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
      public navParams: NavParams,
      public app: App) {
  }

  //Views Statistics
  statistics() {
    this.app.getRootNav().push(HeadControlsStatisticsPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsPage');
  }

}
