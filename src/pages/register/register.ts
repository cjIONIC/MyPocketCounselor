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
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  @ViewChild(Navbar) navbar: Navbar;
  
  connected: Subscription;
  disconnected: Subscription;

  academic: any;

  emailDefault: any;
  fNameDefault: any;
  lNameDefault: any;

  googleUser: any;

  academicArray: any;
  googleInfo = [];
  profilePic: any; //Stores the image for the profile picture
  picType: any;


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

      this.initialize();

  }

  initialize() {
    try {
      this.googleInfo = this.navParams.get('user');
      this.emailDefault = this.googleInfo["email"];
      this.fNameDefault = this.googleInfo["firstname"];
      this.lNameDefault = this.googleInfo["lastname"];
      this.profilePic = this.googleInfo["picture"];
      this.picType = "fromEmail";
      this.fetchAllAcademics();
    } catch {

    }
  }

  async onSubmit(form) {
    console.log("Value: ",form);
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Registering Please Wait...'
    });

    
    let timeout = Math.floor(Math.random() * 1500) + 500;

    loading.present().then(() => {
      setTimeout(async () => {
        this.registerUser(form).then(() => {
          let currentIndex = this.navCtrl.getActive().index;
          this.navCtrl.remove(currentIndex);
          console.log("Successfully registered");
          loading.dismiss();
        }); 
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
     this.picType = "fromDevice";
     console.log("Pic: ", this.profilePic);
    }, (err) => {
      console.log("Error: ", err);
    });
  }

  removeProfilePic() {
    this.profilePic= null;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  async fetchAllAcademics() {
    console.log('%c Fetching all Academic units','color: white; background: violet; font-size: 16px');
    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();
    
    this.academicArray = await new Promise((resolve) => {
      item.subscribe( async academics =>{  
        let academicList = [];

        academics.forEach(unit => {
          if(unit["acName"] !== "Guidance Center" || unit["acID"] !== 1)
            academicList.push(unit);
        })

        resolve(await academicList);
      }, error => console.log(error) );
    });

    console.log("Academics of Student: ", this.academicArray);
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

  registerUser(form) {
    console.log("Academic: ", this.academic);
    console.log('%c Registering student','color: black; background: pink; font-size: 16px');
    return new Promise((resolve) => {
      this.db.registerStudent(form["firstname"],form["lastname"],this.googleInfo["email"],
        form["password"],form["academic"],form["status"], this.profilePic, this.picType).then( action => {
        resolve(true);
      });
    })
  }

  dismissGoogleUser(){
    this.googleUser = firebase.auth().currentUser;
    console.log("Google user: ", this.googleUser);
    this.fireAuth.auth.signOut()
    this.googleUser.delete();
  }

  ionViewWillLeave(){
    this.dismissGoogleUser();
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    
    let currentIndex = this.navCtrl.getActive().index;
    this.navCtrl.remove(currentIndex);
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
