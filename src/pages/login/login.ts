import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ToastController, LoadingController, ModalController } from 'ionic-angular';
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
import { EmailComposer } from '@ionic-native/email-composer';
import { ModalPasswordComponent } from '../../components/modal-password/modal-password';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  @ViewChild("email") email;
  
  remember: any;

  googleUser: any;

  passwordDefault = "sample";

  connected: Subscription;
  disconnected: Subscription;

  //Variables

  constructor(private alertCtrl:AlertController, 
    public navCtrl: NavController, 
    public emailComposer: EmailComposer,
    public navParams: NavParams,
    public googlePlus: GooglePlus,
    public db: DatabaseProvider,
    public app: App,
    public modalCtrl: ModalController,
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
    let firstname, lastname;
    //Opens dialog to choose account

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      this.googlePlus.login({
        'webClientId':'578845672664-vo40upp9jd6qd4eauift56dgas0pn5qm.apps.googleusercontent.com',
        'offline':true
      }).then(res => {
        console.log("Result: ", res );
        firstname = res["givenName"];
        lastname = res["familyName"];
  
        firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
        .then(action => {
  
          loading.dismiss();

          console.log("Informations: ", action);

          this.googleUser = firebase.auth().currentUser;
          console.log("Google USER: ", this.googleUser);
          //this.fireAuth.auth.signOut();
          this.googlePlus.logout(); //Clears token
  
          googleInfo.push({
            "name": action["displayName"],
            "picture": action["photoURL"],
            "firstname": firstname,
            "lastname": lastname,
            "email": action["email"],
            "id": action["uid"]
          });
          googleInfo = googleInfo[0];
          console.log("Google Info ",googleInfo);

          let email = googleInfo["email"];
          let domain = email.substring(email.lastIndexOf("@") +1);

          if(domain !== "su.edu.ph") {
            this.presentAlert("Info", "Invalid SU Email Address");
            this.googleUser.delete();
          }
          else this.verifyGoogleAccount(googleInfo);

        }).catch(err => {
          console.log("Error: ", err);
          loading.dismiss();
        })
      }).catch(err => {
        console.log("Error: ", err);
        loading.dismiss();
      })
    })
  }

  //Logs in using username and password
  upLogin(loginInfo) {
    console.log('%c Logging in with username and password','color: white; background: blue; font-size: 16px');
    this.verifyLogin(loginInfo["email"], loginInfo["password"]);

  }

  forgotPassword() {
    console.log("Forgot Password");

    const modal = this.modalCtrl.create(ModalPasswordComponent,  "",{ cssClass: 'custom-modal-password' });
    modal.present();
  }

  async verifyGoogleAccount(googleInfo){
    let counselorFound = await this.db.searchGoogleAccount(googleInfo, "counselor");
    let studentFound = await this.db.searchGoogleAccount(googleInfo, "student");
    let registerFound = await this.db.searchGoogleAccount(googleInfo, "registration");

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      if ((counselorFound || studentFound ) && !registerFound) {
        this.presentAlert("Info", "This account already exist");
        loading.dismiss();
      } else if(!counselorFound && !studentFound  && registerFound){
        loading.dismiss();
        this.presentAlert("Registration Info", "Your account is still being verified.");
      } else if (!registerFound) {
        loading.dismiss();
        this.app.getRootNav().push(RegisterPage, {user: googleInfo});
      }
    })

  }

  verifyLogin(email, password) {

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      let counselorFound = await this.db.loginSearchCounselor(email, password);
      let studentFound = await this.db.loginSearchStudent(email, password);
      let registerFound = await this.db.registerCheckAccounts(email);

      if ((counselorFound || studentFound ) && !registerFound) {
        let currentIndex = this.navCtrl.getActive().index;
        this.googleSignInwithEmail(email, password).then(()=> {
          loading.dismiss();
          this.app.getRootNav().push(HomePage).then(() => {
            this.navCtrl.remove(currentIndex);
          });
        })
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

  async googleSignInwithEmail(email, password) {
    this.fireAuth.auth.signInWithEmailAndPassword(email, password).then(() => {
      let user = firebase.auth().currentUser;

      console.log("Google User: ", user);
    });

    return;
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
