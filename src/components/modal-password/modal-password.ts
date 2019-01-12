import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
//Pages

//Provides
import { DatabaseProvider } from '../../providers/database/database';

//Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

//Plugin
import { GooglePlus } from '@ionic-native/google-plus';
import { Network} from '@ionic-native/network';
import { EmailComposer } from '@ionic-native/email-composer';
import { addListener } from 'cluster';

/**
 * Generated class for the ModalPasswordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-password',
  templateUrl: 'modal-password.html'
})
export class ModalPasswordComponent {

  text: string;
  currentUser: any;

  constructor(private alertCtrl:AlertController, 
    public navCtrl: NavController, 
    public emailComposer: EmailComposer,
    public navParams: NavParams,
    public googlePlus: GooglePlus,
    public db: DatabaseProvider,
    public app: App,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public network: Network,
    private fireAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController) {
    console.log('Hello ModalPasswordComponent Component');
    this.text = 'Hello World';
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  onSubmit(form) {
    firebase.auth().fetchProvidersForEmail(form["email"])
    .then(student => {
      if (student.length === 0) {
        this.presentAlert("Info", "The account doesn't exist")
      } else {
        this.sendEmail(form["email"]).then(() => {
          this.viewCtrl.dismiss();
          this.presentAlert("Info", "A new password has been sent to your SU Email Address");
        });
      }
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  async sendEmail(email) {
  //Now we know we can send
      var auth = firebase.auth();
      let address = email;
      auth.sendPasswordResetEmail(address).then(function() {
       
        // An error happened.
      });

      return;
  }

}
