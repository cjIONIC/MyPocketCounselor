import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Item, ToastController, LoadingController } from 'ionic-angular';

//Provides
import { DatabaseProvider } from '../../providers/database/database';

//Native Plugins
import { Camera, CameraOptions } from '@ionic-native/camera';

//Firebase
import { AngularFireDatabase } from 'angularfire2/database';


import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';

/**
 * Generated class for the AddPostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-post',
  templateUrl: 'add-post.html',
})
export class AddPostPage {

  connected: Subscription;
  disconnected: Subscription;

  userInfo = [];
  academicList = [];
  type:any;
  name: any;
  date: any;

  title: any;
  location: any;
  description: any;
  startDatetime: any;
  endDatetime: any;
  startDate: any;
  endDate: any;
  startTime: any;
  endTime: any;
  academic: any;


  image: any;

  constructor(public db: DatabaseProvider,
    public fireDatabase: AngularFireDatabase,
    public navCtrl: NavController,
    public network: Network,
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private camera: Camera) {
      this.initialize();
  }

  async initialize() {
    this.type = this.navParams.get('type');

    await this.getUserInfo();
    await this.getCurrentDate();
    await this.fetchAcademic();
  }

  async getUserInfo() {
    let userInfo = await this.db.getUserInfo();

    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        item.subscribe(async counselors => {
          await this.db.refreshUserInfo(counselors, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          await this.fetchAcademic();
        }, error => console.log(error))

    }, error => console.log(error))
  }

  fetchAcademic() {
    let list = this.fireDatabase.list<Item>("academic");
    let item = list.valueChanges();

    try {
      item.subscribe(async academics => {
        let academicList = [];
        academics.forEach(academic => {
          if(academic["cID"] === this.userInfo["id"])
            academicList.push(academic)
        }, error => console.log(error))
    
        await academicList.sort(function(a,b) {
          if(a.acName < b.acName) { return -1; }
          if(a.acName > b.acName) { return 1; }
          return 0;
        });
  
        this.academicList = await academicList;
      })
    } catch {

    }
    
  }

  //Get current date to display
  getCurrentDate() {
    var complete = true; // Complete month date year hours minutes

    this.db.fetchCurrentDate(complete).then((result) => {
      this.date = result;
      console.log("Fetched Date: ", this.date);

      this.startDate = moment().format();
      this.endDate = moment().format();
      this.startTime = moment().format();
      this.endTime = moment().format();

      console.log("Fetch Date: ", this.startDate);
    });
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

  //Get Image from the phone's gallery or library
  getImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false
    }
    
      this.camera.getPicture(options).then((imageData) => {
       // imageData is either a base64 encoded string or a file URI
       // If it's base64 (DATA_URL):
       
       this.image='data:image/jpeg;base64,' + imageData;
      }, (err) => {
        console.log("Error: ", err);
      });
  }

  //Verification of inputs
  verifyPost() {
    if(this.type === "Event") {
      //Creates date type using inputs
      let startDate = moment(this.startDate).format("MMM DD YYYY") +" "+ moment(this.startTime).format("h:mm A");
      let endDate = moment(this.endDate).format("MMM DD YYYY") +" "+ moment(this.endTime).format("h:mm A");
      this.startDatetime = new Date(startDate);
      this.endDatetime = new Date(endDate);
  
      //Checks for inputs
      if (this.title == null || this.location == null || this.description == null || this.academic == null) {
        this.presentToast("Enter all fields!");
      } else if(this.startDatetime < this.endDatetime && this.startDatetime != this.endDatetime) {
        this.inputEvent();
      } else {
        this.presentToast("Ending must be greater that starting date!");
      }
    } else { //Type is quotes
      //Checks for inputs
      if (this.title == null || this.description == null) {
        this.presentToast("Enter all fields!");
      } else {
       this.inputQuotes();
      }
    }
    
  }

  inputEvent() {
    console.log('%c Creating Event','color: black; background: yellow; font-size: 16px');
    

    console.log("Start: ", this.startDatetime);
    console.log("End: ", this.endDatetime);

    //Checks if start date has lesser value than end date
    if (this.startDatetime < this.endDatetime) {
      console.log("Adding event");
      this.addPost();
    } else {
      this.presentToast("Ending Date must be greater!");
    }
  }

  inputQuotes(){
    console.log('%c Creating Quotes','color: black; background: yellow; font-size: 16px');
    console.log("Adding quotes");
    this.location = "None";
    this.startDatetime = "None";
    this.endDatetime = "None";

    let tempArr = [];
    let keysAcademic = Object.keys(this.academicList);
    for(let i=0; i< keysAcademic.length; i++) {
      let countAcademic = keysAcademic[i];
      let idAcademic  = this.academicList[countAcademic].acID;
      console.log("Acad ID: ", idAcademic);
      if(idAcademic != undefined) tempArr.push(idAcademic);
    }   

    this.academic = tempArr;

    this.addPost();
  }

  //Add post in database
  addPost() {
    console.log('%c Adding Post','color: black; background: yellow; font-size: 16px');
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Adding Post Please Wait...'
    });
    
    loading.present().then(() => {
          this.db.addPost(this.title, this.location, this.description,this.startDatetime, this.endDatetime, this.academic, this.image, this.type)
          .then((action) => {
              //Dismiss loading box and page after adding event
              let currentIndex = this.navCtrl.getActive().index;
              this.navCtrl.remove(currentIndex);
              loading.dismiss();
          });
    });
  }

  removePic() {
    this.image = null;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddEventPage');
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
