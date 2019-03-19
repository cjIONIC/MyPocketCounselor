import { Component } from '@angular/core';
import { ViewController, LoadingController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ModalConcernsAddComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-concerns-add',
  templateUrl: 'modal-concerns-add.html'
})
export class ModalConcernsAddComponent {

  text: string;

  constructor(public viewCtrl: ViewController,
      public alertCtrl: AlertController,
      public loadingCtrl: LoadingController,
      public db: DatabaseProvider) {
    console.log('Hello ModalConcernsAddComponent Component');
    this.text = 'Hello World';
  }

  onAdd(concern) {
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      console.log("Concern: ", concern["name"]);
      let found = await this.checkConcernDuplicate(concern["name"]);

      if(found) {
        this.presentAlert("Duplicate", "Concern already exist!");
        console.log("Duplicate concern");
        loading.dismiss();
      } else {
        this.db.addConcern(concern["name"]).then(() => {
          loading.dismiss();
          this.dismiss();
        })
      }
  
    })
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  async checkConcernDuplicate(value) {
    console.log("Concern: ", value);
    let concerns = await this.db.fetchAllNodesByTableInDatabase("concern");
    let found = false;

    concerns.forEach(concern => {
      if(concern["coName"] === value) found = true;
    })
    
    console.log("Found? ", found);

    return await found;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
