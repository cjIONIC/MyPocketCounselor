import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { initializeApp } from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { DatabaseProvider } from '../../providers/database/database';

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

  scroll = false;

  recipient = [];
  recipientID:any;
  userInfo = [];

  messageList = [];
  message:any;

  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, 
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public navParams: NavParams) {
      this.initialize()
  }

  initialize() {
    try {
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

  compareTime(datetime) {
    console.log("Datetime: ", datetime);
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

  sendMessage() {
    console.log("Message: ", this.message);
    let counselor, student;

    if(this.userInfo["type"] === "Student") {
      counselor = this.recipient["id"];
      student = this.userInfo["id"];
    } else {
      student = this.recipient["id"];
      counselor = this.userInfo["id"];
    }

    this.db.addMessage(counselor, student, this.message)
      .then(() => {
        this.message = null;
        this.scroll = false;
      })
  }

}
