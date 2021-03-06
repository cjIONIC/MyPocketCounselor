import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, Item, ToastController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { LoginPage } from '../login/login';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { RegisterValidationPage } from '../register-validation/register-validation';
import { ProfilePage } from '../profile/profile';
import { HeadControlsPage } from '../head-controls/head-controls';
import { SettingsPage } from '../settings/settings';

/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  register: Subscription;
  feedback: Subscription;
  hasRegister: any = false;
  hasFeedback: any = false;

  userInfo = [];

  registrationBadge: any;
  feedbackBadge: any;
  popBadgeRegistration: any;
  popBadgeFeedback: any;

  spinner: any = true;

  constructor(public navCtrl: NavController,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public network: Network,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public app: App) {
  }

  initialize() {
    this.spinner = true;
    this.getUserInfo();
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
  
  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.account = item.subscribe(async accounts => {
      await this.db.refreshUserInfo(accounts, userInfo);
      this.userInfo = await this.db.getUserInfo();
      console.log("User information: ", this.userInfo);

      if(this.userInfo["type"] !== "Student") {
        this.scanFeedbacks();
        await this.scanRegistrations();
      }
      else this.spinner = false;
    }, error => console.log(error));
  }

  openProfile() {
    this.app.getRootNav().push(ProfilePage);
  }

  registration() {
    this.app.getRootNav().push(RegisterValidationPage);
  }

  controls() {
    this.app.getRootNav().push(HeadControlsPage);
  }

  settings() {
    this.app.getRootNav().push(SettingsPage);
  }

  async scanFeedbacks() {
    let list = this.fireDatabase.list<Item>("feedback");
    let item = list.valueChanges();

    this.feedback = item.subscribe(async feedbacks => {
      this.hasFeedback = true;
      this.popBadgeFeedback = false;
      this.feedbackBadge = await this.db.scanFeedbacks(feedbacks);
      console.log("Current no. of feedbacks: ", this.feedbackBadge);
      this.popBadgeFeedback = true;
    })

  }

  async scanRegistrations() {
    let list = this.fireDatabase.list<Item>("registration");
    let item = list.valueChanges();

    
    let academicList = [];

    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    academics.forEach(academic => {
      if(academic["cID"] === this.userInfo["id"]) {
        academicList.push(academic);
      }
    })

    this.register = item.subscribe(async registrations => {
      this.hasRegister = true;
      this.popBadgeRegistration = false;
      this.registrationBadge = await this.db.scanRegistrations(academicList, registrations);
      console.log("Current no. of registrations: ", this.registrationBadge);
      this.popBadgeRegistration = true;
      this.spinner = false;
    })

  }

  logout() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Press "Continue" to logout',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            try {
              
              let loading = this.loadingCtrl.create({
                spinner: 'ios',
                content: 'Please Wait...'
              });

              loading.present().then(()=> {
                this.db.logoutUser().then(() => {
                  loading.dismiss();
                  let nav = this.app.getRootNav();
                  nav.setRoot(LoginPage);
                })
              })
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    this.initialize();
    console.log('ionViewDidLoad MenuPage');
  }
  

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    this.account.unsubscribe();
    if(this.hasRegister) this.register.unsubscribe();
    if(this.hasFeedback) this.feedback.unsubscribe();
  }

  ionViewDidEnter() {
    this.popBadgeRegistration = false;
    this.initialize();
    this.connected = this.network.onConnect().subscribe( data => {
      this.initialize();
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
