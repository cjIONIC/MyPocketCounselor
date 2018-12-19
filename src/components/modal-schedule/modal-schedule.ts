import { Component } from '@angular/core';
import { NavParams, ViewController, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import moment from 'moment';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the ModalScheduleComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-schedule',
  templateUrl: 'modal-schedule.html'
})
export class ModalScheduleComponent {

  connected: Subscription;
  disconnected: Subscription;

  student: any;
  date: any;
  time: any;
  venue: any;

  venuesArray = [];
  appointment = [];
  
  constructor(public navParams: NavParams,
    public network: Network,
    public viewCtrl: ViewController,
    public fireDatabase: AngularFireDatabase,
    public toastCtrl: ToastController,
    public db: DatabaseProvider) {
    try {
      let appointment = this.navParams.get('appointment');
      console.log(appointment);
      this.initialize(appointment);
    } catch {

    }
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

  async initialize(appointment) {
    try{ 

      this.fireDatabase.list<Item>("appointment")
        .valueChanges().subscribe( async appointments => {

          this.appointment = await this.db.filterAppointmentDetails(appointment["id"], appointments);
          console.log("Fetched appointment: ", this.appointment);
          this.student = await this.appointment["studentName"];
          this.venue = await this.appointment["venue"];
          this.date = moment().format();
          this.time = moment().format();
    
          let schedule = await new Date(this.appointment["schedule"]);
          let timezone = await schedule.getTimezoneOffset() * 60000;
          let datetime = await  new Date(schedule.getTime() - timezone).toISOString().slice(0, -1);
          this.date =  moment(datetime).format();
          this.time =  moment(datetime).format();
      
          this.fetchVenue()
        })
    } catch {
      console.log("Error");
    }
  }

  fetchVenue() {
    this.db.fetchAppointmentVenues(this.appointment["cID"]).then( result => {
      this.venuesArray = Object.keys(result).map(function(key) {
        return result[key];
      });

      console.log("Appointment Venues: ", this.venuesArray);
    })
  }

  verifyInputs(){
    console.log("Reschedule");
    let datetime = moment(this.date).format("MMM DD YYYY") +" "+ moment(this.time).format("h:mm A");
    const schedule = new Date(datetime) ;
    if(!this.time || !this.date || !this.venue) this.presentToast("Enter all fields!");
    else this.reschedule(schedule);
  }

  async reschedule(schedule) {
    console.log('%c Rescheduling Appointment','color: white; background: red; font-size: 16px');
    let appointmentsOfCounselor, appointmentsOfStudent; //Variables used in checking
    console.log("Schedule: ", schedule);

    try {
      appointmentsOfCounselor = await this.checkDuplicateForCounselor(this.appointment["cID"], schedule);
      appointmentsOfStudent =  await this.checkDuplicateForStudent(this.appointment["sID"], schedule);

      console.log("Statusfinding: ", appointmentsOfCounselor, appointmentsOfStudent)
      if(await appointmentsOfStudent && await appointmentsOfCounselor) 
        this.presentToast("Date and time has already been occupied!");
      else {
        await this.db.rescheduleAppointment(this.appointment["id"], schedule, this.venue).then(() => {
            this.viewCtrl.dismiss();
          }).catch(err => console.log("Error: ", err));
      }
    } catch {

    }
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

  dismiss() {
    this.viewCtrl.dismiss();
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
