import { Component } from '@angular/core';
import { NavParams, ViewController, ToastController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import moment from 'moment';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { async } from '@firebase/util';

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

  studentDefault: any;
  dateDefault: any;
  timeDefault: any;
  venue: any = "Sample";

  tempDate: any;
  tempTime: any;

  dateValid: any = true;
  timeValid: any = true;

  venuesArray = [];
  appointment = [];
  
  constructor(public navParams: NavParams,
    public network: Network,
    public viewCtrl: ViewController,
    public fireDatabase: AngularFireDatabase,
    public loadingCtrl: LoadingController,
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
      this.dateDefault = moment().format();
      this.timeDefault = moment().format();

      this.fireDatabase.list<Item>("appointment")
        .valueChanges().subscribe( async appointments => {

          this.appointment = await this.db.fetchAppointmentRescheduleDetails(appointment["id"], appointments);
          console.log("Fetched appointment: ", this.appointment);
          this.studentDefault = this.appointment["studentName"];
          this.venue =  await this.appointment["venue"];

          this.dateDefault =  moment(new Date(this.appointment["schedule"])).format();
          this.timeDefault =  moment(new Date(this.appointment["schedule"])).format();
          
          this.tempDate = this.dateDefault;
          this.tempTime = this.timeDefault;

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

  onReschedule(appointment) {
    let datetime = moment(appointment["date"]).format("MMM DD YYYY") +" "+ moment(appointment["time"]).format("h:mm A");
    const schedule = new Date(datetime) ;
    this.reschedule(schedule, appointment["unit"]);
  }

  async reschedule(schedule, venue) {
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
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
          await this.db.rescheduleAppointment(this.appointment["id"], schedule, venue).then(() => {
              this.viewCtrl.dismiss();
              loading.dismiss();
            }).catch(err => console.log("Error: ", err));
        }
      } catch {
  
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

  compareDatetime(datetime, type) {

    console.log("Fetched datetime", datetime);
    console.log("Type: ", type);

    if(type === "date") {
      let date = new Date();
      date.setFullYear(datetime["year"], datetime["month"]-1, datetime["day"]);

      let currentDate = new Date((new Date(moment().format())).setHours(0,0,0));

      if(currentDate > new Date((new Date(this.dateDefault)).setHours(0,0,0)))
        this.dateValid = false;
      else
        this.dateValid = true;

      //Check time
      let time = new Date();
      time.setHours(datetime["hour"], datetime["minute"], 0);

      let currentTime = new Date((new Date(moment().format())));

      let timeSelected =  new Date((new Date(this.dateDefault)).setHours(datetime["hour"], datetime["minute"],0));

      console.log(currentTime.toDateString(), " ? ", timeSelected.toDateString());
      if(currentTime > timeSelected) 
        this.timeValid = false;
      else
        this.timeValid = true;
        
    } else {
      let time = new Date();
      time.setHours(datetime["hour"], datetime["minute"], 0);
      console.log("Time: ", time);

      let currentTime = new Date((new Date(moment().format())));
      currentTime.setMinutes(0);

      let timeSelected =  new Date((new Date(this.dateDefault)).setHours(datetime["hour"], datetime["minute"],0));
      
      console.log(currentTime.toDateString(), " ? ", timeSelected.toDateString());

      if(currentTime > timeSelected) 
        this.timeValid = false;
      else
        this.timeValid = true;

    }
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
