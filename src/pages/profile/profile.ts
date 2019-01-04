import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  userInfo = [];

  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams) {
    this.initialize();
  }

  initialize() {
    try {
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

    item.subscribe(async accounts => {
      await this.db.refreshUserInfo(accounts, userInfo);
      this.userInfo = await this.db.getUserInfo();
      console.log("User information: ", this.userInfo);
    }, error => console.log(error));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
