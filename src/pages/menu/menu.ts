import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, Item, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { LoginPage } from '../login/login';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { RegisterValidationPage } from '../register-validation/register-validation';

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
  userInfo = [];

  constructor(public navCtrl: NavController,
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public network: Network,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public app: App) {
      this.initialize();
  }

  initialize() {
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
    }, error => console.log(error));
  }

  registration() {
    this.app.getRootNav().push(RegisterValidationPage);
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
              this.db.logoutUser().then(() => {
                let nav = this.app.getRootNav();
                nav.setRoot(LoginPage);
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
    console.log('ionViewDidLoad MenuPage');
  }
  

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    if(this.account) {
      this.account.unsubscribe();
    }
    
  }

  ionViewDidEnter() {
    this.connected = this.network.onConnect().subscribe( data => {
      this.initialize();
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
