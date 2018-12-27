import { Component } from '@angular/core';
import { AlertController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { ModalScheduleComponent } from '../modal-schedule/modal-schedule';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the PopScheduleComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pop-schedule',
  templateUrl: 'pop-schedule.html'
})
export class PopScheduleComponent {

  appointment = [];

  constructor(public alertCtrl: AlertController,
    public navParams: NavParams,
    public db: DatabaseProvider,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController) {
      try {
        this.appointment = this.navParams.get('appointment');
        console.log("Fetched Appointment: ", this.appointment);
      } catch {

      }
  }
  
  finish() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Finish',
      message: 'Finishing the appointment means the appoinment has already been done. Clicking "Continue" cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            try {
              this.db.finishAppointment(this.appointment)
                .then(() => this.viewCtrl.dismiss());
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  reschedule() {
    console.log("Reschedule: ", this.appointment);
    const modal = this.modalCtrl.create(ModalScheduleComponent,  { appointment: this.appointment},{ cssClass: 'custom-modal-schedule' });
    modal.present().then(() => this.viewCtrl.dismiss());
  }

}
