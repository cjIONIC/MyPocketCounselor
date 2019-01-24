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
 * Generated class for the PostAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-post-add',
  templateUrl: 'post-add.html',
})
export class PostAddPage {

  connected: Subscription;
  disconnected: Subscription;

  postDetails: any;

  userInfo = [];
  academicList = [];
  type:any;
  name: any;
  date: any;

  title: any;
  location: any;
  description: any;
  startDate: any;
  endDate: any;
  startTime: any;
  endTime: any;
  academic: any;
  
  startDateDefault: any;
  endDateDefault: any;
  startTimeDefault: any;
  endTimeDefault: any;

  tempStartTime: any;
  tempStartDate: any;

  dateValid = true;
  timeValid = true;

  timeBalance = true;
  dateBalance = true;

  includeEndDate: false;
  includeEndTime: false;

  imageFile: any;

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

      this.startDateDefault = moment(new Date()).format();
      this.endDateDefault = moment(new Date()).format();
      this.startTimeDefault = moment(new Date()).format();
      this.endTimeDefault = moment(new Date()).format();

      this.tempStartDate = this.startDateDefault;
      this.tempStartTime =  this.startTimeDefault;

      console.log("Fetch Date: ", this.startDate);
    });
  }

  compareDate(value, type) {
    let date = new Date();
    let newEndDate = new Date();
    console.log("Value: ", value);

    date.setFullYear(value["year"], value["month"]-1, value["day"]);
    let startDate = new Date(this.tempStartDate);

    if(type === 'start') {
      newEndDate.setFullYear(value["year"], value["month"]-1, value["day"]+1);
  
      if(date < startDate) {
        this.tempStartDate = moment(date).format();
        console.log("Lesser");
      }
      else if (date > startDate || date === (new Date(this.endDateDefault))) {
        this.tempStartDate = moment(date).format();
        this.endDateDefault = moment(newEndDate).format()
      }
  
      let currentDate = new Date((new Date(moment().format())).setHours(0,0,0));
      if (currentDate > new Date((new Date(this.startDateDefault)).setHours(0,0,0))) 
        this.dateValid = false;
      else this.dateValid = true;

    } else {
      if(date < startDate) this.dateBalance = false;
      else this.dateBalance = true;
    }

  }

  compareTime(value, type) {
    let time = new Date();
    let newEndTime = new Date();
    console.log("Value: ", value);

    time.setHours(value["hour"], value["minute"]);
    let startTime = new Date(this.tempStartTime);

    if(type === 'start') {
      newEndTime.setHours(value["hour"]+1, value["minute"]);

      console.log("Date: ", time, " ? ", this.startTimeDefault);
  
      if(time < startTime) {
        this.tempStartTime = moment(time).format();
      }
      else if (time > startTime) {
        this.tempStartTime = moment(time).format();
        this.endTimeDefault = moment(newEndTime).format()
      }
      let currentTime = new Date((new Date(moment().format())));


      if(currentTime > new Date((new Date(this.startTimeDefault)))) 
        this.timeValid = false;
      else
        this.timeValid = true;


    } else {
      if(time < startTime) this.timeBalance = false;
      else this.timeBalance = true;
    }

  }

  endDateInclude(event) {
    console.log("Event: ", event)
    this.includeEndDate = event;
  }

  endTimeInclude(event) {
    console.log("Event: ", event)
    this.includeEndTime = event;
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
       
       this.imageFile='data:image/jpeg;base64,' + imageData;
      }, (err) => {
        console.log("Error: ", err);
      });
  }

  removePic() {
    this.imageFile = null;
  }

  onAdd(post) { 
    console.log('%c Adding Post','color: black; background: yellow; font-size: 16px');
    console.log("Value: ", post);

    let startDate, endDate, location, academic;

    if(this.type === "Event") {
      academic = post["academic"];  
      location = post["location"]  
      let tempEndDate, tempEndTime;

      if(!this.includeEndDate) tempEndDate = new Date(0,0,0);
      else tempEndDate = post["endDate"];

      if(!this.includeEndTime) tempEndTime = new Date(0,0,0);
      else tempEndTime = post["endTime"];

      startDate = new Date(moment(post["startDate"]).format("MMM DD YYYY") +" "+ moment(post["startTime"]).format("h:mm A"));
      endDate = new Date(moment(tempEndDate).format("MMM DD YYYY") +" "+ moment(tempEndTime).format("h:mm A"));

      console.log("End Datetime: ", endDate);
    } else {
      location = "None";
      startDate = "None";
      endDate = "None";

      let tempArr = [];
      let keysAcademic = Object.keys(this.academicList);
      for(let i=0; i< keysAcademic.length; i++) {
        let countAcademic = keysAcademic[i];
        let idAcademic  = this.academicList[countAcademic].acID;
        console.log("Acad ID: ", idAcademic);
        if(idAcademic != undefined) tempArr.push(idAcademic);
      }   
      academic = tempArr;
    }

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Adding Post Please Wait...'
    });
    
    loading.present().then(() => {
          this.db.addPost(post["title"], location, post["description"], startDate, 
            endDate, academic, post["image"], this.type)
          .then((action) => {
              //Dismiss loading box and page after adding event
              let currentIndex = this.navCtrl.getActive().index;
              this.navCtrl.remove(currentIndex);
              loading.dismiss();
          });
    });
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
