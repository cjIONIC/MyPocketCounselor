import { Component, ViewChild } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { IonicPage, NavController, NavParams, AlertController, Item, ViewController, ToastController, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';

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

  @ViewChild('fname') fname;
  @ViewChild('fname') lname;
  @ViewChild('username') username;
  @ViewChild('password') password;
  @ViewChild('academic') academic;
  @ViewChild('status') status;

  connected: Subscription;
  disconnected: Subscription;

  academicArray: any;
  googleInfo = [];
  profilePic: any; //Stores the image for the profile picture


  constructor(private fireDatabase: AngularFireDatabase, 
    public db: DatabaseProvider,
    public viewCtrl: ViewController,
    public network: Network,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private camera: Camera) {

  }

  initialize() {
    try {
      this.googleInfo = this.navParams.get('user');
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

    loading.present().then(async () => {
      let student = await this.checkUsernameInStudent(this.username);
      let counselor = await this.checkUsernameInCounselor(this.username);
      let register = await this.checkUsernameInRegister(this.username);
  
      if( !student && !counselor && !register) {
        this.registerUser().then(() => {
          let currentIndex = this.navCtrl.getActive().index;
          this.navCtrl.remove(currentIndex);
          console.log("Successfully registered");
          loading.dismiss();
        }); 
      } else {
        this.presentToast("Username already exist!");
        loading.dismiss();
      }
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

   verifyStudentInfo() {
    console.log('%c Verifying Inputs','color: white; background: violet; font-size: 16px');
    let username = false;
    let password = false;

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Registering Please Wait...'
    });

    loading.present().then(async () => {
      if (this.fname == null ||
        this.lname == null ||
        this.username == null ||
        this.password == null ||
        this.academic == null ||
        this.status == null) {
          this.presentToast("Enter all fields!");
      } else {
        //Check Username input
        let username = false;
        if ( /[^a-zA-Z0-9]/.test(this.username)) {
          this.presentToast("Username must contain letters or numbers only!");
          loading.dismiss();
        } else {
          if(this.username.length > 5) {
            username = true;
          } else {
            this.presentToast("Username must contain atleast 6 characters!");
            loading.dismiss();
          }
        }
  
        //Check password input
        if (/[^a-zA-Z0-9]/.test(this.password)) {
          this.presentToast("Password must contain letters or numbers only!");
          loading.dismiss();
        } else {
          if(this.password.length > 5) {
            password = true;
          } else {
            this.presentToast("Password must contain atleast 6 characters!");
            loading.dismiss();
          }
        }
  
        //Registering student
        if(username == true && password == true) {
          const student = await this.checkUsernameInStudent(this.username);
          const counselor = await this.checkUsernameInCounselor(this.username);
          const register = await this.checkUsernameInRegister(this.username);

          if( !student && !counselor) {
            this.registerUser().then(() => {
              let currentIndex = this.navCtrl.getActive().index;
              this.navCtrl.remove(currentIndex);
              console.log("Successfully registered");
              loading.dismiss();
            }); 
          } else {
            this.presentToast("Username already exist!");
            loading.dismiss();
          }
        }
      }
    });
  }

  async checkUsernameInStudent(username) {
    console.log('%c Checking student usernames...','color: black; background: pink; font-size: 16px');
    let list = this.fireDatabase.list<Item>('student');
    let item = list.valueChanges();

    const foundUsername = await new Promise<boolean>((resolve) => {
      item.subscribe(async students => {
        resolve(await this.db.registerCheckUsernameDuplicates(students, username, "Student"));
      }, error => console.log(error))
    })

    return foundUsername;
  }

  async checkUsernameInCounselor(username) {
    console.log('%c Checking counselor usernames...','color: black; background: pink; font-size: 16px');
    let list = this.fireDatabase.list<Item>('counselor');
    let item = list.valueChanges();

    const foundUsername = await new Promise<boolean>((resolve) => {
      item.subscribe(async counselors => {
        resolve(await this.db.registerCheckUsernameDuplicates(counselors, username, "Counselor"));
      }, error => console.log(error))
    })

    return foundUsername;
  }

  async checkUsernameInRegister(username) {
    console.log('%c Checking registration usernames...','color: black; background: pink; font-size: 16px');
    let list = this.fireDatabase.list<Item>('counselor');
    let item = list.valueChanges();

    const foundUsername = await new Promise<boolean>((resolve) => {
      item.subscribe(async registrations => {
        resolve(await this.db.registerCheckUsernameDuplicates(registrations, username, "Register"));
      }, error => console.log(error))
    })

    return foundUsername;
  }

  registerUser() {
    console.log("Academic: ", this.academic);
    console.log('%c Registering student','color: black; background: pink; font-size: 16px');
    return new Promise((resolve) => {
      this.db.registerStudent(this.fname, this.lname, 
      this.googleInfo["email"],this.username, this.password,this.academic, 
      this.status, this.profilePic).then( action => {
        resolve(true);
      });
    })
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
