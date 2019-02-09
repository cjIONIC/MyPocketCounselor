import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';

//Native Plugins
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the PostEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-post-edit',
  templateUrl: 'post-edit.html',
})
export class PostEditPage {

  connected: Subscription;
  disconnected: Subscription;

  post = [];

  fetchedDate = true;
  fetchedTime = true;

  checkDate = true;
  checkTime = true;
  

  titleDefault:any;
  locationDefault:any;
  startDateDefault:any;
  endDateDefault:any;
  startTimeDefault:any;
  endTimeDefault:any;
  startDatetime:any;
  endDatetime:any;
  descriptionDefault:any;
  imageFile:any;
  changedPhoto:Boolean = false;
  type:any;

  tempStartTime: any;
  tempStartDate: any;

  dateValid = true;
  timeValid = true;

  timeBalance = true;
  dateBalance = true;

  includeEndDate = false;
  includeEndTime = false;


  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public navParams: NavParams,
      public loadingCtrl: LoadingController,
      public network: Network,
      public toastCtrl: ToastController,
      private camera: Camera) {
        this.initialize();
  }

  async initialize() {
    try {
      this.post = await this.navParams.get('post');
      console.log("Post Passed: ", await this.post);
      await this.setValue(await this.post);
    } catch {

    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditPostPage');
  }

  setValue(post) {
    this.startDateDefault = moment().format();
    this.endDateDefault = moment().format();

    this.type = post["type"];
    console.log("Post type: ", this.type );
    this.titleDefault = post["title"];
    this.locationDefault = post["location"];
    this.descriptionDefault = post["description"];
    console.log("Image: ", post["picture"]);

    if(post["picture"] !== "No image") this.imageFile=post["picture"];
    else this.imageFile = "No image";

    this.startDateDefault = moment(new Date(post["startDate"])).format();
    this.endDateDefault = moment(new Date(post["endDate"])).format();
    this.startTimeDefault = moment(new Date(post["startDate"])).format();

    this.tempStartDate = this.startDateDefault;
    this.tempStartTime =  this.startTimeDefault;

    let year =  (new Date(post["endDate"])).getFullYear();
    if(year < 2000) {
      this.includeEndDate = false;
      this.fetchedDate = false;
      this.checkDate = false;
    } else {
        this.includeEndDate = true;
        this.fetchedDate = false;
    }

    let time = (new Date(post["endDate"])).getHours() + (new Date(post["endDate"])).getMinutes();
    if(time === 0) {
      this.includeEndTime = false;
      this.fetchedTime = false;
      this.checkTime = false;
    } else this.includeEndTime = true; 

    if(this.includeEndTime) this.endTimeDefault = moment(new Date(post["endDate"])).format();
    else {
      let endTime = new Date(this.startDateDefault);
      this.endTimeDefault = moment(new Date(endTime.setHours(endTime.getHours()+1))).format();
    }
  }

  compareDate(value, type) {
    let date = new Date();
    let newEndDate = new Date();
    console.log("Value: ", value);

    date.setFullYear(value["year"], value["month"]-1, value["day"]);
    let startDate = new Date(this.tempStartDate);

    if(type === 'start') {
      newEndDate.setFullYear(value["year"], value["month"]-1, value["day"]+1);
  
      if(date < startDate || date < (new Date(this.endDateDefault))) {
        this.tempStartDate = moment(date).format();
        console.log("Lesser");
      } else if (date > startDate || date === (new Date(this.endDateDefault))) {
        this.tempStartDate = moment(date).format();
        this.endDateDefault = moment(newEndDate).format()
      }
  
      let currentDate = new Date((new Date(moment().format())).setHours(0,0,0));
      if (currentDate > new Date((new Date(this.startDateDefault)).setHours(0,0,0))) 
        this.dateValid = false;
      else this.dateValid = true;


      //Time
      let currentTime = new Date((new Date(moment().format())));
      currentTime.setSeconds(0);

      let startTime = new Date((new Date(this.startDateDefault))
                          .setHours(new Date(this.startTimeDefault).getHours(),
                                    new Date(this.startTimeDefault).getMinutes(),0))
                
      let endTime =  new Date();
      this.startTimeDefault = new Date(startTime);
      
      console.log("Date not end included!!!");
        endTime = new Date((new Date(this.startDateDefault))
        .setHours(new Date(this.endTimeDefault).getHours(),
                  new Date(this.endTimeDefault).getMinutes(),0));

      
      this.endTimeDefault = new Date(endTime);

      console.log("Compare time: ", currentTime.toString(), " ? ", startTime.toString());

      if(currentTime > startTime) 
        this.timeValid = false;
      else if (currentTime === startTime || currentTime < startTime)
        this.timeValid = true;
      

    } else {
      let endTime;
      console.log("Date not end included!!!");
        endTime = new Date((new Date(this.startDateDefault))
        .setHours(new Date(this.endTimeDefault).getHours(),
                  new Date(this.endTimeDefault).getMinutes(),0));
      
      this.endTimeDefault = new Date(endTime);

      if(date > startDate) this.dateBalance = true;
      else this.dateBalance = false;
    }

  }

  compareTime(value, type) {
    let timeSelected, newEndTime = new Date();
    if(type === "start") {
      timeSelected = new Date((new Date(this.startDateDefault))
      .setHours(new Date(this.startTimeDefault).getHours(),
                new Date(this.startTimeDefault).getMinutes(),0));
    } else {
      timeSelected = new Date((new Date(this.startDateDefault))
        .setHours(new Date(this.endTimeDefault).getHours(),
                  new Date(this.endTimeDefault).getMinutes(),0));
    }

    console.log("Value: ", value);

    let startTime = new Date(this.tempStartTime);

    if(type === 'start') {
      newEndTime.setHours(value["hour"]+1, value["minute"], 0);

      console.log("Date: ", timeSelected, " ? ", this.startTimeDefault);
      let endTime = new Date(new Date(this.endTimeDefault));
      endTime.setSeconds(0);

      console.log("Start vs End: ", timeSelected ," ? ", endTime)

      if(timeSelected < startTime || timeSelected < endTime) {
        this.tempStartTime = moment(timeSelected).format();
      } else if (timeSelected > startTime || timeSelected == endTime) {
        this.tempStartTime = moment(timeSelected).format();
        this.endTimeDefault = moment(newEndTime).format()
      }

      let currentTime = new Date((new Date(moment().format())));
      currentTime.setSeconds(0);
      //currentTime.setDate(currentTime.getDate()-1);
                                    
      console.log("Compare time: ", currentTime.toString(), " ? ", timeSelected.toString());

      console.log(currentTime.toDateString(), " ? ", timeSelected.toDateString());

      if(currentTime > timeSelected) 
        this.timeValid = false;
        else if (currentTime === timeSelected || currentTime < timeSelected)
        this.timeValid = true;
        else this.timeValid = true;


    } else {
      console.log("Ending time: ", timeSelected ," ? ", startTime)
      if(timeSelected >  startTime)this.timeBalance = true;
      else this.timeBalance = false;
    }

  }

  endDateInclude(event) {
    console.log("Event: ", event)
    this.includeEndDate = event;
    let endTime;

    let startTime = new Date((new Date(this.startDateDefault))
                        .setHours(new Date(this.startTimeDefault).getHours(),
                                  new Date(this.startTimeDefault).getMinutes(),0))
     

  endTime = new Date((new Date(this.startDateDefault))
      .setHours(new Date(this.endTimeDefault).getHours(),
                new Date(this.endTimeDefault).getMinutes(),0));
                
    console.log("Ending time: ", endTime ," ? ", startTime)
    if(endTime >  startTime)this.timeBalance = true;
    else this.timeBalance = false;
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
     this.changedPhoto = true;
    }, (err) => {
      console.log("Error: ", err);
    });
  }
  
  removePic() {
    this.imageFile = null;
  }

  onEdit(post) { 
    console.log('%c Updating Post','color: black; background: yellow; font-size: 16px');
    console.log("Value: ", post);

    let startDate, endDate, location;

    if(this.type === "Event") {
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
    }

    let id = this.post["id"];
    console.log("Post ID: ", id);

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Adding Post Please Wait...'
    });
    
    loading.present().then(() => {
          this.db.updatePost(id, post["title"], location, startDate, endDate, post["description"], 
             post["image"], this.changedPhoto)
          .then((action) => {
              //Dismiss loading box and page after adding event
              let currentIndex = this.navCtrl.getActive().index;
              this.navCtrl.remove(currentIndex);
              loading.dismiss();
          });
    });
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
