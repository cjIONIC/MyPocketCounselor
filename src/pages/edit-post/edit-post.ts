import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';

//Native Plugins
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the EditPostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-post',
  templateUrl: 'edit-post.html',
})
export class EditPostPage {

  connected: Subscription;
  disconnected: Subscription;

  post = [];

  title:any;
  location:any;
  startDate:any;
  endDate:any;
  startTime:any;
  endTime:any;
  startDatetime:any;
  endDatetime:any;
  description:any;
  image:any;
  changedPhoto:Boolean = false;
  type:any;

  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public navParams: NavParams,
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
    this.startDate = moment().format();
    this.endDate = moment().format();

    this.type = post["type"];
    console.log("Post type: ", this.type );
    this.title = post["title"];
    this.location = post["location"];
    this.description = post["description"];
    this.image=post["picture"];

    let startDate = new Date(post["startDate"]);
    let startDateTimezone = startDate.getTimezoneOffset() * 60000;
    let startDatetime =  new Date(startDate.getTime() - startDateTimezone).toISOString().slice(0, -1);

    let endDate = new Date(post["endDate"]);
    let endDateTimezone = endDate.getTimezoneOffset() * 60000;
    let endDatetime =  new Date(endDate.getTime() - endDateTimezone).toISOString().slice(0, -1);

    this.startDate = moment(startDatetime).format();
    this.endDate = moment(endDatetime).format();
    this.startTime = moment(startDatetime).format();
    this.endTime = moment(endDatetime).format();
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
     this.changedPhoto = true;
    }, (err) => {
      console.log("Error: ", err);
    });
  }
  
  //Verification of inputs
  async verifyPost() {

    if(this.type === "Event") {
      console.log("Event");
      //Creates date type using inputs
      let startDate = moment(this.startDate).format("MMM DD YYYY") +" "+ moment(this.startTime).format("h:mm A");
      let endDate = moment(this.endDate).format("MMM DD YYYY") +" "+ moment(this.endTime).format("h:mm A");
      this.startDatetime =await  new Date(startDate);
      this.endDatetime = await new Date(endDate);
      console.log(this.startDatetime.toISOString()," ? ",this.endDatetime.toISOString())
  
      console.log("Title: ", this.title);
      //Checks for inputs
      if (!this.title || !this.location  || !this.description) {
        this.presentToast("Enter all fields!");
      } else if(this.startDatetime < this.endDatetime && this.startDatetime != this.endDatetime) {
        this.updatePost();
      } else {
        this.presentToast("Ending must be greater that starting date!");
      }
    } else { //Type is quotes
      //Checks for inputs
      if (this.title == null || this.description == null) {
        this.presentToast("Enter all fields!");
      } else {
       this.updatePost();
      }
    }
    
  }

  updatePost() {
    console.log('%c Updating Post','color: black; background: yellow; font-size: 16px');
    

    let id = this.post["id"];
    console.log("Post ID: ", id);
      this.db.updatePost(id, this.title, this.location,this.startDatetime,
                  this.endDatetime, this.description, this.image, this.changedPhoto).then(() => {   
                  let currentIndex = this.navCtrl.getActive().index;
                  this.navCtrl.remove(currentIndex);
      });
  }
  
  removePic() {
    this.image = null;
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
