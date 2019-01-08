import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, ToastController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { request } from 'http';
import { Subscription } from 'rxjs/Subscription';

import { Network} from '@ionic-native/network';
import { ModalNotificationComponent } from '../../components/modal-notification/modal-notification';

/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {

  connected: Subscription;
  disconnected: Subscription;

  notificationList = [];
  userInfo=[];

  constructor(public navCtrl: NavController,
      public db: DatabaseProvider,
      public network: Network,
      public toastCtrl: ToastController,
      public modalCtrl: ModalController,
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams) {
  
    this.initialize();
  }

  async initialize() {
    await this.getUserInfo();
  }

  async getUserInfo() {
    let userInfo = await this.db.getUserInfo();
    let table;

    if(await userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          await this.fetchNotification();
        }, error => console.log(error));

    }, error => console.log(error));
    
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

  fetchNotification() {
    this.fireDatabase.list<Item>("appointment")
      .valueChanges().subscribe(async appointment => {
        console.log('%c Fetching Notifications','color: white; background: red; font-size: 16px');
        this.notificationList = await this.db.fetchAppointmentsForNotification(appointment);
        this.notificationList.reverse();
        console.log("Notifications: ", await this.notificationList);
      }, error => console.log("Error!"));
  }

  openNotification(notification) {
    try {
      let id = notification.id;
      console.log("Notification ID: ", id);
      if(this.userInfo["type"] !== "Student"){
        const modal = this.modalCtrl.create(ModalNotificationComponent,  { id: id},{ cssClass: 'custom-modal-notification-counselor' });
        modal.present();
      } else {
        const modal = this.modalCtrl.create(ModalNotificationComponent,  { id: id},{ cssClass: 'custom-modal-notification-student' });
        modal.present();
      }
    } catch {

    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

  }

  ionViewDidEnter() {
    this.initialize();
    
    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
      this.initialize();
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
