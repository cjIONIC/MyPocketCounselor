import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import moment from 'moment';
import { ModalScheduleComponent } from '../modal-schedule/modal-schedule';
import { ModalFeedbackAddComponent } from '../modal-feedback-add/modal-feedback-add';

/**
 * Generated class for the ModalNotificationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-notification',
  templateUrl: 'modal-notification.html'
})
export class ModalNotificationComponent {

  id: any;
  notificationInfo = [];
  userInfo = [];

  proceedFeedback: any;

  spinner: any = true;

  constructor(public navParams: NavParams,
      public viewCtrl: ViewController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public alertCtrl: AlertController,
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase) {
    this.initialize();
  }

  initialize() {
    try {
      this.spinner = true;
      this.id = this.navParams.get('id');
      console.log("ID: ", this.id);
      this.getUserInfo();
    } catch {

    }
  }
  
  async getUserInfo() {
    let userInfo = await this.db.getUserInfo();
    let table;

    if(await userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          await this.fetchAppointment();
        }, error => console.log(error));

    }, error => console.log(error));
    
  }

  fetchAppointment() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    item.subscribe(async appointments => {
      console.log("Fetching appointment...");
      this.notificationInfo = await this.db.fetchAppointmentForNotificationInfo(this.id, appointments);
      console.log("Notification Info: ",await this.notificationInfo);

      if(this.userInfo["type"] === "Student") this.appointmentFeedback();
      else this.spinner = false;
    }, error => console.log(error))
  }

  verifyDate() {
    let today = new Date(moment().format());
    let schedule = new Date(this.notificationInfo["schedule"]);

    if(schedule < today) {
      let alert = this.alertCtrl.create({
        title: 'Occupied',
        message: 'Schedule has already passed! Do you want to reschedule?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Reschedule',
            handler: () => {
              try {
                this.reschedule();
              } catch {
                
              }
            }
          }
        ]
      });
      alert.present();
    } else {
      this.accept();
    }
  }

  async accept() {

    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      let schedule = new Date(moment(this.notificationInfo["schedule"]).format());
      console.log("Schedule: ", schedule);
      const appointmentsOfCounselor = await this.checkDuplicateForCounselor(this.notificationInfo["cID"], schedule);
      const appointmentsOfStudent =  await this.checkDuplicateForStudent(this.notificationInfo["sID"], schedule);
  
      if (appointmentsOfCounselor &&  appointmentsOfStudent) {
        loading.dismiss();
        this.rescheduleVerify();
      } else {
        loading.dismiss();
        this.addAppointment();
      }
    })
  }

  async checkDuplicateForCounselor(id, datetime) {
    console.log('%c Checking for Duplicates','color: white; background: red; font-size: 16px');
    let list = this.fireDatabase.list<Item>('appointment');
    let item = list.valueChanges();

    const found = new Promise((resolve) => {
      item.subscribe( appointments => {
        let keys = Object.keys(appointments);
  
        for( let i = 0; i < keys.length; i++) {
          let count = keys[i];
          let counselor = appointments[count].cID;
  
          if(counselor == id) {
            let appointmentDatetime = new Date(appointments[count].aSchedule);
            console.log("Comparing dates: ", datetime.toLocaleString() ," ? ", appointmentDatetime.toLocaleString());
            if(datetime.toLocaleString() == appointmentDatetime.toLocaleString()) {
              let appointmentStatus = appointments[count].aStatus;
              if(appointmentStatus === "Pending" || appointmentStatus === "Finish")
                resolve(false);
              else resolve(true); //Returns true if date is found and is either accepted or active
            }
          }
        }
        resolve(false);
      }, error => console.log(error));
    }) //End of Promise

    return await found;
  }

  async checkDuplicateForStudent(id, datetime) {
    console.log('%c Checking for Duplicates','color: white; background: red; font-size: 16px');
    let list = this.fireDatabase.list<Item>('appointment');
    let item = list.valueChanges();

    const found = new Promise((resolve) => {
      item.subscribe( appointments => {
        let keys = Object.keys(appointments);
  
        for( let i = 0; i < keys.length; i++) {
          let count = keys[i];
          let student = appointments[count].sID;
          
          if(student === id) {
            let appointmentDatetime = new Date(appointments[count].aSchedule);

            console.log("Comparing dates: ", datetime.toLocaleString() ," ? ", appointmentDatetime.toLocaleString());
            if(datetime.toLocaleString() == appointmentDatetime.toLocaleString()) {
              let appointmentStatus = appointments[count].aStatus;
              if(appointmentStatus != "Pending" || appointmentStatus != "Finish")
                resolve(true); //Returns true if date is found and is either accepted or active
            }
          }
        }
        resolve(false);
      }, error => console.log(error));
    }) //End of Promise

    return await found;
  }

  addAppointment(){
    console.log("Adding appointments...");
    this.db.appointmentConfirmation(this.notificationInfo["id"])
      .then(() => this.close());
  }

  rescheduleVerify() {
    let alert = this.alertCtrl.create({
      title: 'Occupied',
      message: 'Date and time has already been occupied! Do you want to reschedule?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Reschedule',
          handler: () => {
            try {
              this.reschedule();
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  reschedule(){
    let notification = this.notificationInfo;
    console.log("Reschedule: ", notification);
    const modal = this.modalCtrl.create(ModalScheduleComponent,  { appointment: notification},{ cssClass: 'custom-modal-schedule' });
    modal.present().then(() => {
      this.viewCtrl.dismiss();
    });
  }
  
  appointmentFeedback() {
    let list = this.fireDatabase.list<Item>('feedback');
    let item = list.valueChanges();
    let appointmentSubscription = this.fireDatabase.list<Item>('appointment').valueChanges();

      appointmentSubscription.subscribe(appointments => {
        item.subscribe(async feedbacks => {
          this.proceedFeedback = await this.db.searchFeedback(feedbacks, appointments, this.notificationInfo["id"]);
          this.spinner = false;
          console.log("Result: ", this.proceedFeedback);
        })
      })
  }

  addFeedback() {
    console.log("Adding feedback...");

    const modal = this.modalCtrl.create(ModalFeedbackAddComponent, {appointment: this.notificationInfo},{ cssClass: 'custom-modal-feedback' });
    modal.present();
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
