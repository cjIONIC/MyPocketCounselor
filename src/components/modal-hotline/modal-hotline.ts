import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item, ViewController, AlertController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the ModalHotlineComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-hotline',
  templateUrl: 'modal-hotline.html'
})
export class ModalHotlineComponent {

  mask: any;

  text: string;

  hotlineNumber: any;
  spinner: any = true;

  constructor(public db: DatabaseProvider,
      public viewCtrl: ViewController,
      public alertCtrl: AlertController,
      public loadingCtrl: LoadingController,
      public fireDatabase: AngularFireDatabase) {
    this.initialize();
  }

  async initialize() {
    try {
      this.fetchHotline();
    } catch {

    }
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  async fetchHotline() {
    let counselors = await this.db.fetchAllNodesByTableInDatabase("counselor");

    counselors.forEach(counselor => {
      if(counselor["cType"] === "GTD Head") {
        this.hotlineNumber = counselor["cNumber"];
        this.spinner = false;
      }
    })

    console.log("HOTLINE NUMBER: ", this.hotlineNumber);
  
  }

  onChange(value) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Update',
      message: 'You are about to update the Hotline number. ' +
                'Do you want to proceed?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            try {
              this.update(value["hotline"]);
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  update(hotline) {
    console.log("Hotline: ", hotline);   
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(()=> {
      this.db.logoutUser().then(() => {
        loading.dismiss();
        this.db.updateHotline(hotline).then(() => {
          this.presentAlert("Success", "Hotline changed.");
          this.dismiss();
        })
      })
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
