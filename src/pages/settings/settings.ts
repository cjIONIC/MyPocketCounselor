import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, ToastController, ModalController, App } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network } from '@ionic-native/network';
import { ModalPasswordUpdateComponent } from '../../components/modal-password-update/modal-password-update';
import { DisclaimerPage } from '../disclaimer/disclaimer';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  userInfo = [];

  registrationBadge: any;
  popBadge: any;

  spinner: any = true;

  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public network: Network,
      public app: App,
      public toastCtrl: ToastController,
      public modalCtrl: ModalController,
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams) {

        this.initialize();
  }

  initialize() {
    this.spinner = true;
    this.getUserInfo();
  }

  presentToast(description) {
    let toast = this.toastCtrl.create({
      message: description,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.account = item.subscribe(async accounts => {
      await this.db.refreshUserInfo(accounts, userInfo);
      this.userInfo = await this.db.getUserInfo();
      console.log("User information: ", this.userInfo);

      this.spinner = false;
    }, error => console.log(error));
  }

  changePassword() {
    const modal = this.modalCtrl.create(ModalPasswordUpdateComponent,  "",{ cssClass: 'custom-modal-password-update' });
    modal.present();
  }

  disclaimer() {
    this.app.getRootNav().push(DisclaimerPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
  

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    if(this.account) {
      this.account.unsubscribe();
    }
    
  }

  ionViewDidEnter() {
    this.connected = this.network.onConnect().subscribe( data => {
      this.initialize();
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }

}
