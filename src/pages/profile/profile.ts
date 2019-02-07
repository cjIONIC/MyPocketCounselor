import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, App, ModalController, ViewController, PopoverController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { FeedbackPage } from '../feedback/feedback';
import { ModalProfileEditComponent } from '../../components/modal-profile-edit/modal-profile-edit';
import { PopFeedOptionsComponent } from '../../components/pop-feed-options/pop-feed-options';

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

  spinner: any = true;  

  studentStatus: any;

  academicList = [];

  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public app: App,
      public fireDatabase: AngularFireDatabase,
      public modalCtrl: ModalController,
      public popoverCtrl: PopoverController,
      public viewCtrl: ViewController,
      public navParams: NavParams) {
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
  
        if(this.userInfo["type"] !== "Student") {
          this.fetchRating();
          this.fetchPersonalPosts();
          this.fetchAcademic("Counselor");
          this.spinner = false;
        } else {
          this.fetchAcademic("Student");
          this.fetchStatus();
          this.spinner = false;
        }
      }, error => console.log(error));
      
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

  async fetchAcademic(type) {
    if(type === "Counselor") this.academicList = await this.db.fetchMatchAcademicUnit();
    else this.academicList = await this.db.fetchStudentUnit();

    console.log("Current listed academics: ", this.academicList);
  }

  async fetchStatus() {
    let students = await this.db.fetchAllNodesByTableInDatabase("student");

    students.forEach(student => {
      if(student["sID"] === this.userInfo["id"])
        this.studentStatus = student["sStatus"];
    })
  }

  editProfile() {
    const modal = this.modalCtrl.create(ModalProfileEditComponent,  "",{ cssClass: 'custom-modal-profile-edit' });
    modal.present();
  }

  popOptions(myEvent, post) {
    let popover = this.popoverCtrl.create(PopFeedOptionsComponent, {post:post},{ cssClass: 'custom-popover' });
    popover.present({
      ev: myEvent
    });
  }

  viewFeedbacks() {
    console.log("Viewing feedback");
    
    this.app.getRootNav().push(FeedbackPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
