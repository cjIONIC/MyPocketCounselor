import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item } from 'ionic-angular';

import { PostPage } from '../post/post';
import { PeoplePage } from '../people/people';
import { NotificationPage } from '../notification/notification';
import { MenuPage } from '../menu/menu';
import { SearchPage } from '../search/search';
import { ChatPage } from '../chat/chat';
import { AppointmentPage } from '../appointment/appointment';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { updateDate } from 'ionic-angular/umd/util/datetime-util';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  notificationHasEnter: any = false;
  notificationBadge: any;
  selectedPage: any;
  updatedNotification: any = false;

  userInfo = [];
  googleID:any;

  tab1 = PostPage;
  tab2 = PeoplePage;
  tab3 = AppointmentPage;
  tab4 = NotificationPage;
  tab5 = MenuPage;

  pushSearchPage: any;
  pushChatPage: any;

  authState: any = null;

  connected: Subscription;
  disconnected: Subscription;

  constructor(public navCtrl: NavController, 
    public app: App,
    public fireAuth: AngularFireAuth,
    public network: Network,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public navParams: NavParams) {

      this.initialize();
  } 

  initialize() {
    try {
      this.getUserInfo();
    } catch {

    }
  }
  
  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          this.scanAppointmentChanges();

        }, error => console.log(error));

    }, error => console.log(error));
  }

  search() {
    this.app.getRootNav().push(SearchPage, "", {animate: false}).then(() => {
      
    });
  }

  chat() {
    this.app.getRootNav().push(ChatPage);
  }
  
  scanAppointmentChanges() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();
    

    item.subscribe(appointments => {
      console.log("Scanning...");
      let notificationBadge = 0;
      this.notificationBadge = null;

        appointments.forEach(appointment => {
          if(this.userInfo["type"] === "Student") {
            if(appointment["sID"] === this.userInfo["id"] 
              && appointment["aNotification"] === "Sent"
              && appointment["aStatus"] !== "Pending") {
              notificationBadge++;
            }
          }else if(this.userInfo["type"] !== "Student"){
            if(appointment["cID"] === this.userInfo["id"] 
              && appointment["aNotification"] === "Sent"
              && appointment["aStatus"] === "Pending") {
              notificationBadge++;
            }
          }
        })
  
        if(notificationBadge !== 0) this.notificationBadge = notificationBadge;
        else this.notificationBadge = null;
  
        console.log("Notification badge: ", notificationBadge);
      })
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabPage');
  }
}
