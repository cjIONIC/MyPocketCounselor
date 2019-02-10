import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item, ViewController, AlertController } from 'ionic-angular';

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
    console.log("Hotline: ", value["hotline"]);    

    this.db.updateHotline(value["hotline"]).then(() => {
      this.presentAlert("Success", "Hotline changed.");
      this.dismiss();
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
