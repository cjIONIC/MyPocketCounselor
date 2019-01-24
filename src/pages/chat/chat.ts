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
      this.chatList.reverse();
      console.log("Chats: ", this.chatList);
    })
  }

  openChat(recipient) {
    console.log("Recipient: ", recipient);
      this.app.getRootNav().push(ChatMessagePage, {person: recipient});
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  ionViewDidEnter() {
    
    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
      this.initialize();
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }

}
