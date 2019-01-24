import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Item, Events, PopoverController, ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

//Firebase
import { AngularFireDatabase } from 'angularfire2/database';

//Provides
import { DatabaseProvider } from '../../providers/database/database';
import { PopFeedOptionsComponent } from '../../components/pop-feed-options/pop-feed-options';

import { Network} from '@ionic-native/network';
import { PostAddPage } from '../post-add/post-add';

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {

  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  academic: Subscription;
  post: Subscription

  //Array of posts
  userInfo = [];
  feedList = [];

  constructor(public db: DatabaseProvider,
    public fireDatabase: AngularFireDatabase,
    public navCtrl: NavController, 
    public network: Network,
    public popoverCtrl: PopoverController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private app : App) {

      this.initialize();
  }

  async initialize() {
    await this.getUserInfo();
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
          await this.fetchPostForFeed();
        }, error => console.log(error));

    }, error => console.log(error));
  }

  //Fetches all posts from the database
  async fetchPostForFeed() {
    let list = this.fireDatabase.list<Item>('post');
    let item = list.valueChanges();

    item.subscribe( async posts => {
      console.log('%c Fetching Posts to Feed','color: black; background: yellow; font-size: 16px');
      const allAcademicUnits = await this.db.fetchAllNodesByTableInDatabase("academic");
      const allCounselors = await this.db.fetchAllNodesByTableInDatabase("counselor");

      if(this.userInfo["type"] ==="Student") { //Gets post and matches for student
        const studentLikes = await this.db.fetchAllNodesByTableInDatabase("like");
        this.feedList = await this.db.filterFeedForStudent(posts, studentLikes, allAcademicUnits, allCounselors)
      } else { //Gets and matches post for counselor
        let counselorAcademic = await this.db.fetchMatchAcademicUnit();
        this.feedList = await this.db.filterFeedForCounselor(posts, counselorAcademic, allAcademicUnits, allCounselors);
        
        this.feedList.reverse();
      }

      console.log("Filtered Feed: ", this.feedList);
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
 

  popOptions(myEvent, post) {
    let popover = this.popoverCtrl.create(PopFeedOptionsComponent, {post:post},{ cssClass: 'custom-popover' });
    popover.present({
      ev: myEvent
    });
  }

  addPost(postType) {
    console.log("Post type: ", postType);
    this.app.getRootNav().push(PostAddPage, { type: postType});
  }

  likePost(post) {
    let timeout = Math.floor(Math.random() * 1000) + 500;

    let list = this.fireDatabase.list<Item>("like");
    let item = list.valueChanges(["child_added"]);

    setTimeout(() => {
      item.subscribe(likes => {
        console.log('%c Liking Post','color: black; background: yellow; font-size: 16px');
        this.db.likePost(post["id"], likes);
      })
    }, 500)

    
  }

  unlikePost(post) {
    console.log('%c Unliking Post','color: black; background: yellow; font-size: 16px');
    
    let list = this.fireDatabase.list<Item>("like");
    let item = list.valueChanges(["child_removed"]);

    setTimeout(() => {
      item.subscribe(likes => {
        console.log('%c Unliking Post','color: black; background: yellow; font-size: 16px');
        this.db.unlikePost(post["id"], likes);
      })
    }, 500)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedPage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    
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
