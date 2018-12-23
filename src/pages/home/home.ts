import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

import { PostPage } from '../post/post';
import { PeoplePage } from '../people/people';
import { NotificationPage } from '../notification/notification';
import { MenuPage } from '../menu/menu';
import { SearchPage } from '../search/search';
import { ChatPage } from '../chat/chat';
import { AppointmentPage } from '../appointment/appointment';

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


  tab1 = PostPage;
  tab2 = PeoplePage;
  tab3 = AppointmentPage;
  tab4 = NotificationPage;
  tab5 = MenuPage;

  pushSearchPage: any;
  pushChatPage: any;

  constructor(public navCtrl: NavController, 
    public app: App,
    public navParams: NavParams) {

    //Opening pages in Toolbar
    this.pushSearchPage = SearchPage;
  } 

  search() {
    this.app.getRootNav().push(SearchPage, "", {animate: false}).then(() => {
      
    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TabPage');
  }
}
