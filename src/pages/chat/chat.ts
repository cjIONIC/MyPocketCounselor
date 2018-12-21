import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item } from 'ionic-angular';
import { ChatPeopleListPage } from '../chat-people-list/chat-people-list';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { initializeApp } from 'firebase';
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
  date = moment(new Date()).format("MM/DD/YY");

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public app: App) {

      this.initialize();
  }

  initialize() {
    try {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

}
