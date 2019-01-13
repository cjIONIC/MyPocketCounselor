import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ToastController } from 'ionic-angular';
import { initializeApp } from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { Network} from '@ionic-native/network';

/**
 * Generated class for the ChatMessagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-message',
  templateUrl: 'chat-message.html',
})
export class ChatMessagePage {
  connected: Subscription;
  disconnected: Subscription;

  scroll = false;
  currentDate: Date;

  recipient = [];
  recipientID:any;
  userInfo = [];

  messageList = [];
  messageDefault:any;

  messageDate =  new Date('December 10, 2018');

  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, 
    public network: Network,
    public fireDatabase: AngularFireDatabase,
    public toastCtrl: ToastController,
    public db: DatabaseProvider,
    public navParams: NavParams) {
      this.initialize()
  }

  initialize() {
    try {
      this.currentDate = new Date(moment().format());
      this.recipientID =  this.navParams.get('person');
      console.log("Fetched Recipient: ", this.recipientID);
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
          this.fetchRecipientInfo();
          this.fetchMessages();
        }, error => console.log(error));

    }, error => console.log(error));
  }

  fetchRecipientInfo() {
    let table;
    if(this.userInfo["type"] === 'Student') {
      table = "counselor";
    } else {
      table = "student";
    }

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    item.subscribe(async accounts => {
      this.recipient = await this.db.fetchRecipient(this.recipientID, accounts);
      console.log("Fetched Recipient: ", this.recipient);
    })
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

  compareTime(messageDatetime) {
    console.log("Datetime: ", messageDatetime);
    let datetime = new Date(messageDatetime);
    let sample = this.messageDate.valueOf() - datetime.valueOf()
    console.log("Message: ", sample);
    if(!this.messageDate) {
      this.messageDate = datetime;
    } else {
    }
  }

  fetchMessages() {

    let list = this.fireDatabase.list<Item>("message");
    let item = list.valueChanges();

    item.subscribe(async messages => {
      this.messageList = await this.db.fetchMessages(this.recipient["id"], messages);
      console.log("Messages: ", this.messageList);
      //this.scrollChat();
    }, error => console.log("Error"));
  }

  scrollChat() {
    if(!this.scroll) {
      setTimeout(() => {
        this.content.scrollToBottom(0);
        }, 100);
      this.scroll = true;
    }
   
   //this.content.scrollToBottom(0);
  }

  compareDate(date) {
    console.log("Comparing...");
    let status, datetime = new Date(date);
    let currentDate = this.currentDate;
    let yesterday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-1)

    if(moment(this.currentDate).format('yyyy') === moment(datetime).format('yyyy')) {
      status = "year";
    } else {
      status = "past"
    }

    return status;
  }

  onSend(messageForm) {
    let message = messageForm["message"];
    console.log("Message: ", message);
    let counselor, student;

    if(this.userInfo["type"] === "Student") {
      counselor = this.recipient["id"];
      student = this.userInfo["id"];
    } else {
      student = this.recipient["id"];
      counselor = this.userInfo["id"];
    }

    this.db.addMessage(counselor, student, message)
      .then(() => {
        this.messageDefault = null;
        this.scroll = false;
      }).catch(() => {
        console.log("Unable to send message");
      })
  }

  updateMessageStatus(){
    let student, counselor;
    let list = this.fireDatabase.list<Item>("message");
    let item = list.valueChanges();

    if(this.userInfo["type"] === "Student") {
      student = this.userInfo["id"];
      counselor = this.recipient["id"];
    } else {
      counselor = this.userInfo["id"];
      student = this.recipient["id"];
    }
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  ionViewDidEnter() {

    this.updateMessageStatus();

    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }


}
