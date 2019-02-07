import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Item } from 'klaw';
import { ViewController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the ModalProfileEditComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-profile-edit',
  templateUrl: 'modal-profile-edit.html'
})
export class ModalProfileEditComponent {

  userInfo = [];
  
  profilePicture: any;
  temporaryPicture: any;

  spinner: any = true;

  changed:Boolean = false

  constructor(public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase,
      public viewCtrl: ViewController,
      public loadingCtrl: LoadingController,
      public camera: Camera) {
        
        this.initialize();
  }

  initialize() {
    try {
      this.spinner = true;
      this.getUserInfo();
    } catch {

    }
  }
  
  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
    .valueChanges().subscribe(() => {
      item.subscribe(async accounts => {
        await this.db.refreshUserInfo(accounts, userInfo);
        this.userInfo = await this.db.getUserInfo();
        console.log("User information: ", this.userInfo);
  
        this.profilePicture = await this.fetchProfilePicture(accounts, table);
        this.temporaryPicture = this.profilePicture;

      }, error => console.log(error));
      
    }, error => console.log(error));

  }

  async fetchProfilePicture(accounts, type) {
    let photo;

    if(type === "student") {
      accounts.forEach(account => {
        if(account["sID"] === this.userInfo["id"])
          photo = account["sPicture"];
      })
    } else {
      accounts.forEach(account => {
        if(account["cID"] === this.userInfo["id"])
          photo = account["cPicture"];
      })
    }

    console.log("Fetched Picture: ", photo);
    return photo;
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
     this.profilePicture='data:image/jpeg;base64,' + imageData;
     console.log("Pic: ", this.profilePicture);
     this.changed = true;
    }, (err) => {
      console.log("Error: ", err);
    });
  }

  uploadPicture() {
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      this.db.updatePicture(this.profilePicture).then(() => {
        loading.dismiss();
        this.dismiss();
      })
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
