import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FeedPage } from '../feed/feed';
import { PeoplePage } from '../people/people';
import { NotificationPage } from '../notification/notification';
import { MenuPage } from '../menu/menu';
import { SearchPage } from '../search/search';
import { ChatPage } from '../chat/chat';
import { AppointmentPage } from '../appointment/appointment';
/**
 * Generated class for the TabPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tab',
  templateUrl: 'tab.html',
})
export class TabPage {

  search = false;

  tab1 = FeedPage;
  tab2 = PeoplePage;
  tab3 = AppointmentPage;
  tab4 = NotificationPage;
  tab5 = MenuPage;

  pushSearchPage: any;
  pushChatPage: any;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams) {

    //Opening pages in Toolbar
    this.pushChatPage = ChatPage;
    this.pushSearchPage = SearchPage;
  } 


  ionViewDidLoad() {
    console.log('ionViewDidLoad TabPage');
  }

}
