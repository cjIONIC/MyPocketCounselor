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
  rating: any;

  postArray = [];

  academicList = [];

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

      if(this.userInfo["type"] !== "Student") {
        this.fetchRating();
        this.fetchPersonalPosts();
        this.fetchAcademic();
      }
    }, error => console.log(error));
  }

  fetchRating() {
    let list = this.fireDatabase.list<Item>("feedback");
    let item = list.valueChanges();

    item.subscribe(async feedbacks => {
      this.rating = await this.db.fetchFeedbackRating(this.userInfo["id"], feedbacks);

      if(!this.rating) console.log("No rating available");
    })
  }

  fetchPersonalPosts() {
    let list =  this.fireDatabase.list<Item>('post');
    let item = list.valueChanges();

    item.subscribe( async posts => {
      this.postArray = await this.db.fetchPostForProfile(posts);
    })
  }

  async fetchAcademic() {
    this.academicList = await this.db.fetchMatchAcademicUnit();

    console.log("Current listed academics: ", this.academicList);
  }

  viewFeedbacks() {
    console.log("Viewing feedback");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
