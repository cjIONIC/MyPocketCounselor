import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Item } from 'klaw';
import { ViewController, LoadingController, NavParams } from 'ionic-angular';


/**
 * Generated class for the ModalCounselorEditComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-counselor-edit',
  templateUrl: 'modal-counselor-edit.html'
})
export class ModalCounselorEditComponent {
  id: any;
  
  profilePicture: any;
  temporaryPicture: any;

  spinner: any = true;

  changed:Boolean = false

  constructor(public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase,
      public viewCtrl: ViewController,
      public loadingCtrl: LoadingController,
      public navParams: NavParams,
      public camera: Camera) {
        
        this.initialize();
  }

  async initialize() {
    try {
      this.spinner = true;

      this.profilePicture = await this.navParams.get('picture');
      this.id = await this.navParams.get('id');
      this.temporaryPicture = this.profilePicture;
    } catch {

    }
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
      this.db.updateCounselorPicture(this.profilePicture, this.id).then(() => {
        loading.dismiss();
        this.dismiss();
      })
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
