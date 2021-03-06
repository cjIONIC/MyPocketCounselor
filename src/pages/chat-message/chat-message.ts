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
  account: Subscription;
  academic: Subscription;
  message: Subscription;
  recipientSub: Subscription;

  scroll = false;
  currentDate: Date;

  spinner: any = true;

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
  }

  initialize() {
    try {
      this.spinner = true;
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

    this.academic = this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        this.account = item.subscribe(async accounts => {
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

    this.recipientSub = item.subscribe(async accounts => {
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

    this.message = item.subscribe(async messages => {
      this.messageList = await this.db.fetchMessages(this.recipient["id"], messages);
      console.log("Messages: ", this.messageList);
      this.updateMessageStatus();
      this.spinner = false;
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

  async updateMessageStatus(){
    let student, counselor;
    let type;

    if(this.userInfo["type"] === "Student") {
      console.log("Type Student");
      student = this.userInfo["id"];
      counselor = this.recipient["id"];
      type = "Counselor";
    } else {
      console.log("Type Counselor");
      counselor = this.userInfo["id"];
      student = this.recipient["id"];
      type = "Student";
    }

    let messages = await this.db.fetchAllNodesBySnapshot("message");

    let ref =this.fireDatabase.list("message");
    let keys = Object.keys(messages);

      for(let i = 0; i < keys.length; i++) {
        let count = keys[i];
        let refKey = messages[count].key;
        let message = messages[count].payload.val();

        if(message.cID === counselor 
            && message.sID === student
            && message.mDevice === "Sent"
            && message.mType === type) {
          ref.update(refKey, { mDevice: "Received" });
          console.log("UPDATED!")
        }
      }
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

    this.account.unsubscribe();
    this.academic.unsubscribe();
    this.message.unsubscribe();
    this.recipientSub.unsubscribe();
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.initialize();

    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }


}
