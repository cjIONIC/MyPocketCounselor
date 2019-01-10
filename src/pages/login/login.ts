import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ToastController, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
//Pages
import { RegisterPage } from '../register/register';

//Provides
import { DatabaseProvider } from '../../providers/database/database';

//Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

//Plugin
import { GooglePlus } from '@ionic-native/google-plus';
import { Network} from '@ionic-native/network';
import { HomePage } from '../home/home';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  

  username: any;
  password: any;

  connected: Subscription;
  disconnected: Subscription;

  //Variables

  constructor(private alertCtrl:AlertController, 
    public navCtrl: NavController, 
    public navParams: NavParams,
    public googlePlus: GooglePlus,
    public db: DatabaseProvider,
    public app: App,
    public network: Network,
    private fireAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
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

  googleLogin() {
    console.log('%c Logging in with google','color: white; background: blue; font-size: 16px');

    var googleInfo = [];
    //Opens dialog to choose account
    this.googlePlus.login({
      'webClientId':'578845672664-vo40upp9jd6qd4eauift56dgas0pn5qm.apps.googleusercontent.com',
      'offline':true
    }).then(res => {
      console.log("Result: ", res );

      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        content: 'Please Wait...'
      });

      loading.present().then(()=> {
        firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
        .then(action => {
  
          loading.dismiss();

          console.log("Informations: ", action);

          /*
          var user = firebase.auth().currentUser;
          this.fireAuth.auth.signOut();
          this.googlePlus.logout();
          user.delete();
          */
  
          console.log("Action ",JSON.stringify(action));
  
          googleInfo.push({
            "name": action["displayName"],
            "picture": action["photoURL"],
            "email": action["email"],
            "id": action["uid"]
          });
  
          googleInfo = googleInfo[0];
          console.log("Google Info ",googleInfo);
  
          this.verifyGoogleAccount(googleInfo);
        }).catch(err => {
          console.log("Error: ", err);
        })
      })
    }).catch(err => {
      console.log("Error: ", err);
    })
  }

  //Logs in using username and password
  upLogin(loginInfo) {
    console.log('%c Logging in with username and password','color: white; background: blue; font-size: 16px');
    this.verifyLogin(loginInfo["username"], loginInfo["password"]);

  }

  forgotPassword() {
    console.log("Forgot Password");
  }

  verifyGoogleAccount(googleInfo){
    let counselorFound = this.db.searchGoogleAccount(googleInfo, "counselor");
    let studentFound = this.db.searchGoogleAccount(googleInfo, "student");
    let registerFound =  this.db.searchGoogleAccount(googleInfo, "registration");

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      if ((counselorFound || studentFound ) && !registerFound) {
        this.presentAlert("Info", "This account already exist");
        loading.dismiss();
      } else if(registerFound){
        loading.dismiss();
        this.presentAlert("Registration Info", "Your account is still being verified.");
      } else {
        loading.dismiss();
        this.app.getRootNav().push(RegisterPage, {user: googleInfo});
      }
    })

  }

  verifyLogin(username, password) {

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      let counselorFound = await this.db.loginSearchCounselor(username, password);
      let studentFound = await this.db.loginSearchStudent(username, password);
      let registerFound = await this.db.registerCheckAccounts(username);

      if ((counselorFound || studentFound ) && !registerFound) {
        let currentIndex = this.navCtrl.getActive().index;
        loading.dismiss();
        this.app.getRootNav().push(HomePage).then(() => {
          this.navCtrl.remove(currentIndex);
        });
      } else if(registerFound){
        loading.dismiss();
        this.presentAlert("Registration Info", "Your account is still being verified.");
      } else {
        loading.dismiss();
        this.presentToast("Username or password is invalid");
      }
    }).catch(error => {

    })//End of Loading Presentation
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  ionViewDidEnter() {
    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
