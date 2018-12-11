import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ToastController, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
//Pages
import { TabPage } from '../tab/tab';
import { RegisterPage } from '../register/register';

//Provides
import { DatabaseProvider } from '../../providers/database/database';

//Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

//Plugin
import { GooglePlus } from '@ionic-native/google-plus';
import { Network} from '@ionic-native/network';


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

          var user = firebase.auth().currentUser;
          this.fireAuth.auth.signOut();
          this.googlePlus.logout();
          user.delete();
  
          console.log("Action ",JSON.stringify(action));
  
          googleInfo.push({
            "name": action["displayName"],
            "picture": action["photoURL"],
            "email": action["email"],
            "id": action["uid"]
          });
  
          googleInfo = googleInfo[0];
          console.log("Google Info ",googleInfo);
  
          this.verifyAccount(googleInfo, "","", "googleSignIn");
        }).catch(err => {
          console.log("Error: ", err);
        })
      })
    }).catch(err => {
      console.log("Error: ", err);
    })
  }

  //Logs in using username and password
  upLogin() {
    console.log('%c Logging in with username and password','color: white; background: blue; font-size: 16px');
    let googleInfo = "";
    let type = "usernamepassword"

    if(!this.username && !this.password){
      this.presentToast("Invalid username or password!");
    } else {
      this.verifyAccount(googleInfo, this.username, this.password, type);
    }

  }

  verifyAccount(googleInfo, username, password, type) {

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });
    loading.present().then(() => {
      this.db.loginSearchCounselor(googleInfo, username, password, type).then((result) => {
        var counselorFound = result;
  
        if(counselorFound) {
          let currentIndex = this.navCtrl.getActive().index;
          loading.dismiss();
          this.app.getRootNav().push(TabPage).then(() => {
            this.navCtrl.remove(currentIndex);
          });
        }
        else {
          this.db.loginSearchStudent(googleInfo, username, password, type).then((result) => {
            var studentFound = result;
  
            if(studentFound) {
              let currentIndex = this.navCtrl.getActive().index;
              loading.dismiss();
              this.app.getRootNav().push(TabPage).then(() => {
                this.navCtrl.remove(currentIndex);
              });
            } else {
  
              loading.dismiss();
              this.db.registerCheckAccounts(googleInfo).then((foundAccount) => {
                if(foundAccount) {
                  this.presentAlert("Registration Info", "Your account is still being verified.");
                } else if(type === "googleSignIn" && !foundAccount) {
                  this.app.getRootNav().push(RegisterPage, {user: googleInfo});
                } else {
                  this.presentToast("Username or password is invalid");
                }
              })
            }
          });
        }
      });
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
