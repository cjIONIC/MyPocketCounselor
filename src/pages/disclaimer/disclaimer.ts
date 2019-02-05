import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { LoginPage } from '../login/login';

/**
 * Generated class for the DisclaimerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-disclaimer',
  templateUrl: 'disclaimer.html',
})
export class DisclaimerPage {

  display:any;

  constructor(public navCtrl: NavController, 
    public db: DatabaseProvider,
    public app: App,
    public navParams: NavParams) {
    this.initialize();
  }

  async initialize() {
    try {
      this.display = await this.db.getDisclaimer();
    } catch {

    }
  }

  proceedToLogin() {
    console.log("Proceed to login");
    let nav = this.app.getRootNav();
    nav.setRoot(LoginPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DisclaimerPage');
  }

  ionViewWillLeave(){
    this.db.setDisclaimer();
  }

}
