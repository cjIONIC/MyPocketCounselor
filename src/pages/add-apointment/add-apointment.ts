import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, ModalOptions } from 'ionic-angular';

import moment from 'moment';
//Firebase
import { AngularFireDatabase } from 'angularfire2/database';

//Native Plugins
import { Item } from 'klaw';
import { ModalSearchComponent } from '../../components/modal-search/modal-search';
import { DatabaseProvider } from '../../providers/database/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-add-apointment',
  templateUrl: 'add-apointment.html',
})
export class AddApointmentPage {

  connected: Subscription;
  disconnected: Subscription;

  description:any;
  date:any;
  time:any;
  venue:any;
  concern:any;
  
  userInfo = [];
  recipient:any;
  concernArray = [];
  venuesArray = [];

  passDate: any;

  appointmentArray = [];

  constructor(public fireDatabase: AngularFireDatabase,
    public navCtrl: NavController, 
    public network: Network,
    public db: DatabaseProvider,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController) {

      this.initializeSearch();
  }

  async initializeSearch() {
    let date = this.navParams.get('date');
    let recipient = this.navParams.get('recipient');

    if(recipient) this.recipient = recipient[0];
    console.log("Date passed: ", date);

    await this.fetchUserProfile();

   this.date = moment(date).format();
   this.time = moment().format();

  }

  async fetchUserProfile() {
    let userInfo = await this.db.getUserInfo();
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        this.fireDatabase.list<Item>("concern")
          .valueChanges().subscribe(concerns => {

            item.subscribe(async accounts => {
              await this.db.refreshUserInfo(accounts, userInfo);
              this.userInfo = await this.db.getUserInfo();
              console.log("User information: ", this.userInfo);
              await this.fetchConcerns(this.userInfo["type"]);
              await this.fetchVenues(this.userInfo["id"]);
            }, error => console.log(error))

        }, error => console.log(error))

    })
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

  fetchConcerns(type) {
    if(type == "Student") {
      this.db.fetchAppointmentConcerns().then( result => {
        this.concernArray =  Object.keys(result).map(function(key) {
          return result[key];
        });
      })
    } else {
      this.concern = "None";
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

  selectRecipient() {
    const modalOptions: ModalOptions = {
      enableBackdropDismiss: false
    }
    const modal = this.modalCtrl.create(ModalSearchComponent, "", modalOptions);
    modal.present();

    //Fetches the name and information from the modal
    modal.onDidDismiss( result => {
      this.recipient = result;
      if(this.userInfo["type"] === "Student") this.fetchVenues(this.recipient["id"]);
      console.log("Person: ", this.recipient)
    });
  }

  verifyInputs() {
    if (this.userInfo["type"] !== "Student")
      if(!this.recipient || !this.date || !this.time || !this.description || !this.venue)
      this.presentToast("Enter all fields!")
      else this.addAppointment();
    
    if (this.userInfo["type"] === "Student")
      if(!this.recipient || !this.date || !this.time || !this.description || !this.venue || !this.concern)
      this.presentToast("Enter all fields!")
      else this.addAppointment();
  }

  async addAppointment() {
    console.log('%c Adding Appointment','color: white; background: red; font-size: 16px');
    let appointmentsOfCounselor, appointmentsOfStudent; //Variables used in checking

    let datetime = moment(this.date).format("MMM DD YYYY") +" "+ moment(this.time).format("h:mm A");
    const schedule = new Date(datetime) ;
    console.log("Schedule: ", await schedule);
    let appointmentInputs = await this.appointmentInputs(schedule);
    console.log("Inputs: ", appointmentInputs);
    
    try {
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
      if(await appointmentsOfStudent && await appointmentsOfCounselor)
        this.presentToast("Date and time has already been occupied!");
      else {
        await this.db.addAppointment(appointmentInputs[0]).then(() => {
            //Dismiss page after successfully set the appointment
            let currentIndex = this.navCtrl.getActive().index;
            this.navCtrl.remove(currentIndex);
          }).catch(err => console.log("Error: ", err));
      }
    } catch {

    }
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

    if(this.userInfo["type"] != "Student") {
      student = this.recipient["id"];
      counselor = this.userInfo["id"];
      this.concern = "None";
    } else {
      student = this.userInfo["id"];
      counselor = this.recipient["id"];
      this.concern = parseInt(this.concern);
    }

    //Identifies which semestral period the appointment is set
    if(month.toString().match(/^(6|7|8|8|10)$/)) semester = "First";
    else if (month.toString().match(/^(1|2|3|11|12)$/)) semester = "Second";
    else semester = "Summer";

    if(this.userInfo["type"] != "Student") status = "Accepted";
    else status = "Pending";

    
    appointmentInputs.push({
      "aID": parseInt(id),
      "aDescription": this.description,
      "aSchedule": schedule.toString(),
      "aSemester": semester,
      "aStatus": status,
      "aDatetime": date.toString(),
      "sID": student,
      "cID": counselor,
      "coID": this.concern,
      "acID": parseInt(this.venue)
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
    console.log('ionViewDidLoad AddApointmentPage');
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
