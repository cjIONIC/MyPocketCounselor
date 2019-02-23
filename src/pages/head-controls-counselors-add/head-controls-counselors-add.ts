import { Component, ViewChild } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { IonicPage, NavController, NavParams, AlertController, Item, ViewController, ToastController, LoadingController, Navbar, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

/**
 * Generated class for the HeadControlsCounselorsAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls-counselors-add',
  templateUrl: 'head-controls-counselors-add.html',
})
export class HeadControlsCounselorsAddPage {
  
  connected: Subscription;
  disconnected: Subscription;
  
  academic: any;

  emailDefault: any;
  fNameDefault: any;
  lNameDefault: any;

  matchPassword: any;
  passwordDefault: any;

  googleUser: any;

  academicArray: any;
  googleInfo = [];
  profilePic: any; //Stores the image for the profile picture

  constructor(private fireDatabase: AngularFireDatabase, 
    public fireAuth: AngularFireAuth,
    public db: DatabaseProvider,
    public viewCtrl: ViewController,
    public network: Network,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public platform: Platform,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private camera: Camera) {
  }

  async onSubmit(form) {
    console.log("Value: ",form);
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Adding Please Wait...'
    });

    
    let timeout = Math.floor(Math.random() * 1500) + 500;

    loading.present().then(() => {
      setTimeout(async () => {

        let found = await this.checkEmailDuplication(form["email"]);

        if(found) {
          this.presentAlert("Duplicate", "Email already exist!");
          console.log("Duplicate email addresses");
          loading.dismiss();
        } else {
          this.addCounselor(form).then(() => {
            let currentIndex = this.navCtrl.getActive().index;
            this.navCtrl.remove(currentIndex);
            console.log("Successfully added Counselor");
            loading.dismiss();
          }); 
        }

      }, timeout);
    });

   
  }

  changeProfilePic() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      allowEdit: true,
      targetWidth: 300,
      targetHeight: 300
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     this.profilePic='data:image/jpeg;base64,' + imageData;
     console.log("Pic: ", this.profilePic);
    }, (err) => {
      console.log("Error: ", err);
    });
  }

  removeProfilePic() {
    this.profilePic= null;
  }

  passwordConfirmation(event) {
    let password = event["value"];
    console.log("Password: ", password , " ? ", this.passwordDefault);
    if(!this.passwordDefault) this.matchPassword = true;

    if(this.passwordDefault) {
      if(password !== this.passwordDefault) this.matchPassword = false;
      else this.matchPassword = true;
    } else this.matchPassword = true;
  }

  async addCounselor(form) {
    console.log("Academic: ", this.academic);
    let email = form["email"];
    let password = form["password"];

    console.log('%c Registering student','color: black; background: pink; font-size: 16px');
    return new Promise((resolve) => {

      this.fireAuth.auth.createUserWithEmailAndPassword(email, password).then(() => {
        console.log("Successfully signed in!");
        this.db.addCounselor(form["firstname"],form["lastname"],email,
          password, this.profilePic).then( action => {
          resolve(true);
        });
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });

    })
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  async checkEmailDuplication (email) {
    let counselors = await this.db.fetchAllNodesByTableInDatabase("counselor");
    let found = false;

    counselors.forEach(counselor => {
      if(counselor["cEmail"] === email) found = true;
    })

    return found;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsCounselorsAddPage');
  }

}
