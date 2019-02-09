import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ModalFeedbackAddComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-feedback-add',
  templateUrl: 'modal-feedback-add.html'
})
export class ModalFeedbackAddComponent {

  appointmentInfo: any;
  rating: any = 0;

  constructor(public viewCtrl: ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public db: DatabaseProvider) {
    
      this.initialize();
  }
  
  initialize() {
    try {
      this.rating = 0;
      this.appointmentInfo = this.navParams.get('appointment');
    } catch {

    }
  }

  rate(value) {
    console.log("Value: ", value);

    if(value === this.rating) this.rating = 0;
    else this.rating = value;
  }

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  onSubmit(value) {
    console.log("Value: ", value);
    let id = this.appointmentInfo["id"];
    let rate = this.rating;
    let description = value["description"];

    this.db.addFeedback(id, rate, description)
      .then(() => {
        this.presentAlert("Success!", "Feedback has been sent.");

        this.dismiss();
      });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
