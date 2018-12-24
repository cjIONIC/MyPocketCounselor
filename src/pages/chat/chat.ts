import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item } from 'ionic-angular';
import { ChatPeopleListPage } from '../chat-people-list/chat-people-list';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';
import { ChatMessagePage } from '../chat-message/chat-message';

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

  chatList = [];
  currentDate: Date;
  week: any;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public app: App) {

      this.initialize();
  }

  initialize() {
    try {
      this.currentDate = new Date(moment().format());

      this.fetchChats();
    } catch {

    }
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

}
