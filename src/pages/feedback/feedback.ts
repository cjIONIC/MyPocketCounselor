import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  userInfo = [];
  rating: any;

  feedbackList = [];

  spinner: any = true;  

  constructor(public navCtrl: NavController, 
      public navParams: NavParams,
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase) {

        this.initialize();
  }

  initialize() {
    try {
      this.spinner = true;
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
    .valueChanges().subscribe(() => {
      item.subscribe(async accounts => {
        await this.db.refreshUserInfo(accounts, userInfo);
        this.userInfo = await this.db.getUserInfo();
        console.log("User information: ", this.userInfo);

        this.fetchFeedbacks();

      }, error => console.log(error));
      
    }, error => console.log(error));

  }

  fetchFeedbacks() {
    let list = this.fireDatabase.list<Item>("feedback");
    let item = list.valueChanges();

    item.subscribe(async feedbacks => {
      let tempArray;
      
      if(this.userInfo["type"] === "Student") {
        tempArray = await this.db.fetchFeedbackStudent(feedbacks);
      } else {
        tempArray = await this.db.fetchFeedbackCounselor(feedbacks)
      }

      this.spinner = false;

      this.feedbackList = await tempArray;
      console.log("Fetched feedback list: ",this.feedbackList);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
  }

}
