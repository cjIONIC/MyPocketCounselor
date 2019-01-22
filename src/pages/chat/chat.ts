import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item, ToastController } from 'ionic-angular';
import { ChatPeopleListPage } from '../chat-people-list/chat-people-list';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';
import { ChatMessagePage } from '../chat-message/chat-message';
import { Subscription } from 'rxjs/Subscription';
import { Network } from '@ionic-native/network';
import { userInfo } from 'os';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  connected: Subscription;
  disconnected: Subscription;

  chatList = [];
  currentDate: Date;
  week: any;

  userInfo = [];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public fireDatabase: AngularFireDatabase,
    public network: Network,
    public db: DatabaseProvider,
    public app: App) {

      this.initialize();
  }

  initialize() {
    try {
      this.currentDate = new Date(moment().format());
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
          await this.fetchChats();
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

  addChat() {
    console.log("Adding Chat");
    this.app.getRootNav().push(ChatPeopleListPage);
  }

  fetchChats() {
    let list = this.fireDatabase.list<Item>("message");
    let item = list.valueChanges();

    item.subscribe( async messages => {
      this.chatList = await this.db.fetchChats(messages);
      console.log("Chats: ", this.chatList);
    })
  }

  compareDate(date) {
    console.log("Comparing...");
    let status, datetime = new Date(date);
    let currentDate = this.currentDate;
    let yesterday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-1)

    if(moment(this.currentDate).format('MM/dd/yy') === moment(datetime).format('MM/dd/yy')) {
      status = "today";
    } else if(moment(yesterday).format('MM/dd/yy') === moment(datetime).format('MM/dd/yy')) {
    } else if(moment(this.currentDate).format('ww') === moment(datetime).format('ww')) {
      status = "week";
    } else if(moment(this.currentDate).format('yyyy') === moment(datetime).format('yyyy')) {
      status = "year";
    } else {
      status = "past"
    }

    return status;
  }

  openChat(recipient) {
    console.log("Recipient: ", recipient);
      this.app.getRootNav().push(ChatMessagePage, {person: recipient});
  }

  async updateChatStatus() {

    let messages = await this.db.fetchAllNodesBySnapshot("message");
    let ref = this.fireDatabase.list('messages');

    let keys = Object.keys(messages);

    for(let i = 0; i < keys.length; i++) {
      let count = keys[i];
      let message = messages[count].payload.val();

      if(message.mType=== "Student") {
        if(message.cID === this.userInfo["id"] &&
            message.mDevice === "Sent")
              ref.update(messages[count].key, { mDevice: "Received" });
      } else {
        if(message.sID === this.userInfo["id"] &&
            message.mDevice === "Sent")
              ref.update(messages[count].key, { mDevice: "Received" });
      }
    }

    return;
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

    this.updateChatStatus();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
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
