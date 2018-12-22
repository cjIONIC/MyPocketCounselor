import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item } from 'ionic-angular';
import { ChatPeopleListPage } from '../chat-people-list/chat-people-list';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';

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

    if(moment(this.currentDate).format('MM/dd/yy') === moment(datetime).format('MM/dd/yy')) {
      status = "today";
    } else if(moment(this.currentDate.getDate()-1).format('MM/dd/yy') === moment(datetime.getDate()-1).format('MM/dd/yy')) {
      status = "yesterday";
    } else if(moment(this.currentDate).format('ww') === moment(datetime).format('ww')) {
      status = "week";
    } else if(moment(this.currentDate).format('yyyy') === moment(datetime).format('yyyy')) {
      status = "year";
    } else {
      status = "past"
    }

    return status;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

}
