import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item, Platform, LoadingController } from 'ionic-angular';

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
  feedbackBadge: any;
  popBadgeFeedback: any;
  hasFeedback: any = false;
  hasRegister: any = false;

  registrationBadge: any;
  tempRegistrationBadge: any;
  menuHasEnter: any = false;

  chatBadge: any;

  menuBadge: any;

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

  hasRun: any = false;

  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  academic: Subscription;
  message: Subscription;
  appointment: Subscription;
  register: Subscription;
  feedback: Subscription;

  constructor(public navCtrl: NavController, 
    public app: App,
    public fireAuth: AngularFireAuth,
    private platform: Platform,
    public network: Network,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {

  } 

  initialize() {
    try {
      this.getUserInfo1();
      //this.chatBadge = 12;
    } catch {

    }
  }
  
  async getUserInfo1() {
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      let userInfo = await this.db.getProfileInStorage();
      console.log("Currently logged in: ", userInfo);
      let table;
  
      if(userInfo["type"] === "Student") table = "student"
      else table = "counselor";
  
      let list = this.fireDatabase.list<Item>(table);
      let item = list.valueChanges();
  
      this.academic = this.fireDatabase.list<Item>("academic")
        .valueChanges().subscribe(academics => {
  
          this.account = item.subscribe(async accounts => {
            await this.db.refreshUserInfo(accounts, userInfo);
            this.userInfo = await this.db.getUserInfo();

            loading.dismiss();
            this.hasRun = true;

            console.log("User information: ", this.userInfo);
            this.scanAppointmentChanges();
            this.scanChatChanges();
            if(this.userInfo["type"] !== "Student")this.scanMenuChanges();
  
          }, error => console.log(error));
  
      }, error => console.log(error));
    })
  }

  search() {
    this.app.getRootNav().push(SearchPage, "", {animate: false}).then(() => {
      
    });
  }

  chat() {
    this.app.getRootNav().push(ChatPage);
  }

  scanChatChanges() {
    let list = this.fireDatabase.list<Item>("message");
    let item = list.valueChanges();

    this.message = item.subscribe(messages => {
      let chatBadge = 0;
      this.chatBadge = null
      let fetchedID = [];

      messages.forEach(async message => {
        if(this.userInfo["type"] === "Student") {

          if(this.userInfo["id"] === message["sID"] 
              && message["mType"] === "Counselor") {
                let counselorID = message["cID"];
                let push = false;

                messages.forEach(message2 => {
                  if(counselorID === message2["cID"]
                    &&message2["sID"] === this.userInfo["id"]
                    && message2["mType"] === "Counselor"
                    && message2["mDevice"] === "Sent")
                      push = true;
                })

                if(push) {
                  let found = false;
                  console.log("Currently fetched chat IDs: ", fetchedID);
                  fetchedID.forEach(id => {
                    if(id === message["cID"]) found = true;
                  })
  
                  if(!found) {
                    chatBadge++;
                    fetchedID.push(message["cID"]);
                  }
                }
          }
        } else {
          if(this.userInfo["id"] === message["cID"] 
              && message["mType"] === "Student") {
                let studentID = message["sID"];
                let push = false;

                messages.forEach(message2 => {
                  if(studentID === message2["sID"]
                    && message2["cID"] === this.userInfo["id"]
                    && message2["mType"] === "Student"
                    && message2["mDevice"] === "Sent")
                      push = true;
                })

                if(push) {
                  let found = false;
                  console.log("Currently fetched chat IDs: ", fetchedID);
                  fetchedID.forEach(id => {
                    if(id === message["sID"]) found = true;
                  })
  
                  if(!found) {
                    chatBadge++;
                    fetchedID.push(message["sID"]);
                  }
                }
          }
        }
      })

      if(chatBadge != 0)this.chatBadge = chatBadge;
      else this.chatBadge = null;
      
    }, error => console.log("Error"))
  }
  
  scanAppointmentChanges() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();
    
    this.appointment = item.subscribe(appointments => {
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
      }, error => console.log("Error"))
   
  }

  async scanMenuChanges() {
    this.scanFeedbacks();
    this.scanRegistrations()
  }

  async scanFeedbacks() {
    let list = this.fireDatabase.list<Item>("feedback");
    let item = list.valueChanges();

    item.subscribe(async feedbacks => {
      if(this.menuBadge > 0 && this.hasFeedback) this.menuBadge--;
      this.hasFeedback = false;
      let found = false;
      let badge = 0;

      let appointments = await this.db.fetchAllNodesByTableInDatabase("appointment");

      feedbacks.forEach(feedback => {

        appointments.forEach(appointment => {
          if(appointment["aID"] === feedback["aID"]
              && appointment["cID"] === this.userInfo["id"]
              && feedback["fNotification"] !== "Received")
              found = true;
        })

      })



      if(found){ 
        badge++;
        this.hasFeedback = true;
        if(this.menuBadge )this.menuBadge += badge;
        else this.menuBadge = badge;
      } 
      if(this.menuBadge === 0) this.menuBadge = null;
      console.log("FBadge: ", this.menuBadge);
    })

  }
  
  async scanRegistrations() {
    let list = this.fireDatabase.list<Item>("registration");
    let item = list.valueChanges();

    
    let academicList = [];

    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    academics.forEach(academic => {
      if(academic["cID"] === this.userInfo["id"]) {
        academicList.push(academic);
      }
    })

    item.subscribe(async registrations => {
      if(this.menuBadge >0 && this.hasRegister) this.menuBadge--;
      this.hasRegister = false;
      let badge = 0;
      this.registrationBadge = await this.db.scanRegistrations(academicList, registrations);
      console.log("Current no. of registrations: ", this.registrationBadge);

      if(this.registrationBadge){
        this.hasRegister = true;
        badge++;
        if(this.menuBadge )this.menuBadge += badge;
        else this.menuBadge = badge;
      } 
      if(this.menuBadge === 0) this.menuBadge = null;
      console.log("RBadge: ", this.menuBadge);
    })

  }

  scanTabChange(ev:any) {
    let page = ev.root.name;


    console.log("Tab selected: ", page);

    if(page === "NotificationPage")
      this.notificationBadge = null;
  }

  ionViewWillLeave(){
    this.account.unsubscribe();
    this.academic.unsubscribe();
    this.message.unsubscribe();
    this.appointment.unsubscribe();
  }

  ionViewDidLoad() {
    this.initialize();
    console.log('ionViewDidLoad TabPage');
  }

  ionViewDidEnter() {
  }
}
