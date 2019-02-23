import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, ModalOptions, LoadingController } from 'ionic-angular';

import moment from 'moment';
//Firebase
import { AngularFireDatabase } from 'angularfire2/database';

//Native Plugins
import { Item } from 'klaw';
import { DatabaseProvider } from '../../providers/database/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the AppointmentAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html',
})
export class AppointmentAddPage {
  connected: Subscription;
  disconnected: Subscription;
  appointment: Subscription;
  account: Subscription;
  academic: Subscription;
  concern: Subscription;

  appointmentDetails: any;

  dateDefault:any;
  timeDefault:any;

  workTime: any = true;

  tempDate: any;
  tempTime: any;

  dateValid: any = true;
  timeValid: any = true;
  
  userInfo = [];
  recipient:any;
  concernArray = [];
  venuesArray = [];

  passDate: any;

  academicDefault = [];

  appointmentArray = [];

  added: Boolean = false;

  constructor(public fireDatabase: AngularFireDatabase,
    public navCtrl: NavController, 
    public network: Network,
    public db: DatabaseProvider,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController) {

      this.initialize();
  }

  async initialize() {
    let date = await this.navParams.get('date');
    console.log("Date passed: ", date);
    let datetime = new Date(date);
    datetime.setMinutes(datetime.getMinutes()-1);

    let hour = datetime.getHours();
 
    if(hour > 17) {
      datetime.setHours(17);
      datetime.setMinutes(59);
    } 
    if (hour < 7) {
     datetime.setHours(7);
     datetime.setMinutes(0);
    }

    console.log("Date passed: ", datetime);
   this.dateDefault = moment(datetime).format();


   this.timeDefault = moment(datetime).format();

   this.tempDate = this.dateDefault;
   this.tempTime = this.timeDefault;

    await this.fetchUserProfile();


  }

  async fetchUserProfile() {
    let userInfo = await this.db.getUserInfo();
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.academic = this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        this.concern = this.fireDatabase.list<Item>("concern")
          .valueChanges().subscribe(concerns => {

            this.account = item.subscribe(async accounts => {
              await this.db.refreshUserInfo(accounts, userInfo);
              this.userInfo = await this.db.getUserInfo();
              console.log("User information: ", this.userInfo);

              if(this.userInfo["type"] === "Student") {
                this.fetchConcerns(this.userInfo["type"]);
                this.fetchRecipient();
              } else  {
                this.recipient = this.navParams.get('recipient');
                this.fetchVenues(this.userInfo["id"]);
              }
            }, error => console.log(error))

        }, error => console.log(error))

    })
  }

  fetchRecipient() {
    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async counselors => {
          this.recipient = await this.db.fetchAppointmentRecipient(academics, counselors);
          console.log("Recipient: ", this.recipient);
          this.fetchStudentAcademic(this.userInfo["id"]);
        })
      })

  }

  async fetchStudentAcademic(id) {
    let students = await this.db.fetchAllNodesByTableInDatabase("student");
    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    students.forEach(student => {
      if(student["sID"] === id) {
        academics.forEach(academic => {
          if(academic["acID"] === student["acID"]) {
            this.academicDefault.push(academic);

            this.academicDefault = this.academicDefault[0];
            console.log("Academic: ", this.academicDefault);

          }
        })
      }
    })
  }

  onSubmit(value) {
    console.log("Value: ", value);
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
      
    } 
    
    if(type === "time"){
      let time = new Date();
      time.setHours(datetime["hour"], datetime["minute"], 0);

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

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  fetchConcerns(type) {
    if(type == "Student") {
      this.db.fetchAppointmentConcerns().then( result => {
        this.concernArray =  Object.keys(result).map(function(key) {
          return result[key];
        });
      })
    } 
  }

  fetchVenues(id) {
    console.log("Passed ID: ", id);
    this.db.fetchAppointmentVenues(id).then( result => {
      this.venuesArray = Object.keys(result).map(function(key) {
        return result[key];
      });

      console.log("Appointment Venues: ", this.venuesArray);
    })
  }

  async onAdd(details) {

    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(async () => {
      this.appointmentDetails = details;
      console.log("Values: ", this.appointmentDetails);
      
      console.log('%c Adding Appointment','color: white; background: red; font-size: 16px');
      let appointmentsOfCounselor, appointmentsOfStudent; //Variables used in checking
  
      let datetime = moment(this.appointmentDetails["date"]).format("MMM DD YYYY") +" "+ moment(this.appointmentDetails["time"]).format("h:mm A");
      const schedule = new Date(datetime) ;
      console.log("Schedule: ", await schedule);
      let appointmentInputs = await this.appointmentInputs(schedule);
      console.log("Inputs: ", appointmentInputs);
  
      let timeout = Math.floor(Math.random() * 1500) + 500;
  
      let pushed = false;
  
      this.appointment = this.fireDatabase.list<Item>("appointment")
      .valueChanges().subscribe(() => {
        setTimeout(async () => {
          try {
            this.added = true;
            if(this.userInfo["type"] != "Student") {
              console.log('%c Searching appointments for counselor','color: white; background: red; font-size: 16px');
              appointmentsOfCounselor = await this.checkDuplicateForCounselor(this.userInfo["id"], schedule);
              appointmentsOfStudent =  await this.checkDuplicateForStudent(this.recipient["id"], schedule);
            } else {
              console.log('%c Searching appointments for student','color: white; background: red; font-size: 16px');
              appointmentsOfCounselor = await this.checkDuplicateForCounselor(this.recipient["id"], schedule);
              appointmentsOfStudent =  await this.checkDuplicateForStudent(this.userInfo["id"], schedule);
            }
      
            console.log("Statusfinding: ", appointmentsOfCounselor, appointmentsOfStudent)
            if(await appointmentsOfStudent && await appointmentsOfCounselor && !pushed) {
              loading.dismiss();
              //this.presentToast("Date and time has already been occupied!");
              this.presentAlert("Appointment Conflict", "Please choose another date or time.");

            } else if(await !appointmentsOfStudent && await !appointmentsOfCounselor && !pushed){
              pushed = true;
              loading.dismiss();
              await this.db.addAppointment(appointmentInputs[0]).then(() => {
                  //Dismiss page after successfully set the appointment
                  let currentIndex = this.navCtrl.getActive().index;
                  this.navCtrl.remove(currentIndex);
                }).catch(err => console.log("Error: ", err));
            }
          } catch {
      
          }
        }, timeout);
      })
    })
  }

  appointmentInputs(schedule) {
    console.log('%c Creating Appointment','color: white; background: red; font-size: 16px');
    let appointmentInputs = [], student, counselor;

    let month = schedule.getMonth() + 1;
    let date = new Date(moment().format()); //Handles the timestamp of appointing
    let semester, status;

    let numeric = Math.random().toString().replace('0.', '').substr(0,3);
    let timestamp = new Date().getTime().toString().substring(0,4);
    const id = numeric+timestamp;

    let concern, academic;

    if(this.userInfo["type"] != "Student") {
      student = this.recipient["id"];
      counselor = this.userInfo["id"];
      concern = "None";
      academic = this.appointmentDetails["venue"];
    } else {
      student = this.userInfo["id"];
      counselor = this.recipient["id"];
      concern = parseInt(this.appointmentDetails["concern"]);
      academic = this.academicDefault["acID"];
    }

    //Identifies which semestral period the appointment is set
    if(month.toString().match(/^(6|7|8|8|10)$/)) semester = "First";
    else if (month.toString().match(/^(1|2|3|11|12)$/)) semester = "Second";
    else semester = "Summer";

    if(this.userInfo["type"] != "Student") status = "Added";
    else status = "Pending";

    
    appointmentInputs.push({
      "aID": parseInt(id),
      "aDescription": this.appointmentDetails["description"],
      "aSchedule": schedule.toString(),
      "aSemester": semester,
      "aStatus": status,
      "aNotification": "Sent",
      "aDatetime": date.toString(),
      "sID": student,
      "cID": counselor,
      "coID": concern,
      "acID": parseInt(academic)
    })


    return appointmentInputs;
  }

  async checkDuplicateForCounselor(id, datetime) {
    console.log('%c Checking for Duplicates','color: white; background: red; font-size: 16px');
    let list = this.fireDatabase.list<Item>('appointment');
    let item = list.valueChanges();

    let found = new Promise((resolve) => {
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

    let found = new Promise((resolve) => {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppointmentAddPage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    this.academic.unsubscribe();
    this.account.unsubscribe();
    this.concern.unsubscribe();

    //Firebase
    if(this.added) this.appointment.unsubscribe();
    console.log("Successfully unsubscribed");
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
