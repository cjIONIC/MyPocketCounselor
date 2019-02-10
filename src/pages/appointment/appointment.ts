import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Item, App, ModalOptions, ModalController , PopoverController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase, listChanges } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { Network} from '@ionic-native/network';
import { PopScheduleComponent } from '../../components/pop-schedule/pop-schedule';
import moment from 'moment';

import { AppointmentAddPage } from '../../pages/appointment-add/appointment-add'
import { ModalAppointmentSearchComponent } from '../../components/modal-appointment-search/modal-appointment-search';
/**
 * Generated class for the AppointmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment.html',
})
export class AppointmentPage {


  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  academic: Subscription;
  appointment: Subscription;
  selected: Subscription;

  userInfo:any;
  fired:Boolean = false ;

  date = new Date(moment().format()); //Handles the Date() attributes
  monthName:string[];

  appointmentsOfCurrentMonth = [];
  appointmentsOfSelectedDate = [];

  currentMonth:any; //Month in numbers
  currentMonthName:any; //Month in words
  currentYear:any;
  currentDate:any;

  daysOfCurrentMonth:any;
  daysLastMonth:any;
  daysNextMonth:any;

  selectedDay:any;
  daySelected: any;

  spinner:any = true;
  hasRun:Boolean = false;

  constructor(public alertCtrl: AlertController,
    public navCtrl: NavController,
    public fireDatabase: AngularFireDatabase,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
    public loadingCtrl: LoadingController,
    public network: Network,
    public modalCtrl: ModalController,
    public db: DatabaseProvider,
    public navParams: NavParams,
    private app: App) {

  }

  async initialize() {
    this.spinner = true;
    this.hasRun = false;
    await this.getUserInfo();
  }

  async getUserInfo() {
    console.log("Fetching profile...");
    let userInfo = await this.db.getProfileInStorage();
    let table;

    if(await userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.academic = this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        this.account = item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          await this.fetchAppointmentsOfCurrentMonth();
        }, error => console.log(error));

    }, error => console.log(error));
    
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


  async fetchAppointmentsOfCurrentMonth() {
    let today = false;
    console.log('%c Fetching Appointments of Current Month','color: white; background: red; font-size: 16px');
    if(this.date.getMonth() == new Date().getMonth()) {
      this.currentDate = new Date().getDate();
      this.daySelected = this.currentDate;
      today = true;
    } else {
      this.currentDate = 999;
      this.daySelected = null;
    }
    this.currentYear = this.date.getFullYear();
    this.currentMonth = this.date.getMonth();

    let list = this.fireDatabase.list<Item>('appointment');
    let item = list.valueChanges();

    try {
      this.appointment = item.subscribe( async appointments => {
        this.appointmentsOfCurrentMonth = await this.db.fetchAppointmentsOfCurrentMonth(this.userInfo["type"], 
                                                this.userInfo["id"], appointments, this.currentMonth, this.currentYear);
        console.log("Current Appointments: ", this.appointmentsOfCurrentMonth);
  
        await this.loadCalendarOfCurrentMonth();
        if(!this.fired && today) {
          this.fired = true;
          await this.selectedDate(this.currentDate, this.currentMonth, this.currentYear);
        }
      }, error => console.log(error));
    } catch {

    }
  }
  
  //Displays the dates of the current Month
  loadCalendarOfCurrentMonth() {
    console.log('%c Loading Calendar','color: white; background: red; font-size: 16px');
    this.monthName = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
    this.currentMonthName = this.monthName[this.date.getMonth()]; //Gets the month's name
    this.currentMonth = this.date.getMonth();
    console.log("Loaded Month: ", this.currentMonth);
    
    this.daysOfCurrentMonth = [];
    this.daysLastMonth = [];
    this.daysNextMonth = [];

    this.currentMonth = this.date.getMonth();

    //Identifies which day the current month started
    var firstDayMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();

    //Identifies last remaining days before the current month
    var lastDaysPrevMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    for(var a = lastDaysPrevMonth-(firstDayMonth-1); a <= lastDaysPrevMonth; a++) {
      this.daysLastMonth.push(a);
    }
  
    //Identifies all dates in a month
    var totalDaysOfCurrentMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
    for (var b = 0; b < totalDaysOfCurrentMonth; b++) {
      if(this.checkDateForAppointments(b+1)) this.daysOfCurrentMonth.push({"date": b+1, "occupied":true});
      else this.daysOfCurrentMonth.push({"date": b+1, "occupied":false});
    }

    //Identifies last day of month
    var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
    for (var c = 0; c < (6-lastDayThisMonth); c++) {
      this.daysNextMonth.push(c+1);
    }

    //Adds all days
    var totalDays = (this.daysLastMonth.length) + (this.daysOfCurrentMonth.length) + (this.daysNextMonth.length);
    if(totalDays<36) {
      for(var d = (7-lastDayThisMonth); d < ((7-lastDayThisMonth)+7); d++) {
        this.daysNextMonth.push(d);
      }
    }

      //Loading icon 
      this.spinner = false;
      this.hasRun = true;

    console.log("Finish loading calendar");
    
  }

  //Loads the last month of the currently displayed month
  loadLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    this.selectedDay = null;
    this.fired = false;
    this.appointmentsOfSelectedDate = [];
    this.fetchAppointmentsOfCurrentMonth();
  }

  //Loads the next month of the currently displayed month
  loadNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0);
    this.selectedDay = null;
    this.fired = false;
    this.appointmentsOfSelectedDate = [];
    this.fetchAppointmentsOfCurrentMonth();
  }

  //Gets the selected date from the calendar
  async selectedDate(day, month, year) {
    console.log('%c Date Selected','color: white; background: red; font-size: 16px');

    let week = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    console.log("Info: ", month, day, year);
    this.selectedDay = new Date(year, month, day);

    var list = this.fireDatabase.list<Item>('appointment');
    var item = list.valueChanges();
    this.daySelected = day;

    this.selected = item.subscribe(async appointments => {
      let appointmentsOfSelectedDate = await this.db.fetchAppointmentsOfDate(this.userInfo["id"], this.userInfo["type"], 
                                            this.selectedDay, appointments);
      this.appointmentsOfSelectedDate = await this.db.filterAppointmentsOfDate(await appointmentsOfSelectedDate);
       this.loadCalendarOfCurrentMonth();
    }, error => console.log(error));
  }

  checkDateForAppointments(date) {
    console.log('%c Checking Date for Appointments','color: white; background: red; font-size: 16px');
    try {
      let appointment = this.appointmentsOfCurrentMonth;
      let keys = Object.keys(appointment);
      let schedule = new Date(this.date.getFullYear(), this.date.getMonth(), date);
  
      for (let i = 0; i < keys.length; i++) {
        let count = keys[i];
        let appointmentSchedule = new Date(appointment[count].aSchedule);
  
        if(schedule.toDateString() == appointmentSchedule.toDateString())
          return true;
      }
    } catch {

    }
    return false;
  }

  async addAppointment() {
    let datetime;

    if(this.daySelected !== null) {
      datetime = moment(this.selectedDay).format("MMM DD YYYY") +" "+ moment().format("h:mm A");
      console.log("Date to be passed: ", datetime);
    } else {
      datetime = moment(new Date()).format("MMM DD YYYY") +" "+ moment().format("h:mm A");
      console.log("Date to be passed: ", datetime);
    }
    
    if(this.userInfo["type"] === "Student") {
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        content: 'Please Wait...'
      });

      loading.present().then(async () => {
        let found = await this.verifyAppointment();
        
        if(found) {
          loading.dismiss();
          //this.presentToast("")
          this.app.getRootNav().push(AppointmentAddPage, {date: datetime});
        } else {
          loading.dismiss();
          this.presentAlert("Feedback Required", "Some of your appointments doesn't have a feedback. " +
                            "Please submit a feedback to be able to request an appointment.");
        }
      })
    } else {
      
      const modal = this.modalCtrl.create(ModalAppointmentSearchComponent, { date: datetime},{ cssClass: 'custom-modal-appointment-search' });
      modal.present();
    }
   
  }

  //Verifies for feedbacks
  async verifyAppointment() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    let found = await new Promise((resolve) => {
      item.subscribe(async appointments => {
        let exist = await this.db.scanAppointmentFeedbacks(appointments);
        console.log("Found: ", exist);
        
        resolve(exist);
      })
    })


    return found;
  }

  popOptions(myEvent, appointment) {
    let popover = this.popoverCtrl.create(PopScheduleComponent, {appointment:appointment},{ cssClass: 'custom-popover-schedule' });
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    this.initialize();
    console.log('ionViewDidLoad AppointmentPage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

    this.account.unsubscribe();
    this.academic.unsubscribe();
    this.appointment.unsubscribe();
    this.selected.unsubscribe();

  }

  ionViewDidEnter() {
    if(!this.hasRun) this.initialize();
    
    this.connected = this.network.onConnect().subscribe( data => {
      this.initialize();
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }

}
