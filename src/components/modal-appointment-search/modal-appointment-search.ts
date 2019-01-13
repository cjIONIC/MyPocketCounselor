import { Component } from '@angular/core';
import { NavParams, NavController, App, Item, ToastController, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { AppointmentAddPage } from '../../pages/appointment-add/appointment-add';
/**
 * Generated class for the ModalAppointmentSearchComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-appointment-search',
  templateUrl: 'modal-appointment-search.html'
})
export class ModalAppointmentSearchComponent {
  connected: Subscription;
  disconnected: Subscription;

  userInfo = [];
  completePeopleList = []; //Handles all people
  peopleList = []; //Modifiable List

  date: any;

  constructor(public navCtrl: NavController, 
    public fireDatabase: AngularFireDatabase,
    public navParams: NavParams,
    public network: Network,
    public toastCtrl: ToastController,
    public db: DatabaseProvider,
    public app: App,
    public viewCtrl: ViewController) {

      this.initialize();
  }

  async initialize() {
    try {
      this.date = this.navParams.get('date');
      await this.getUserInfo();
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
          await this.fetchList();
        }, error => console.log(error))

    }, error => console.log(error))
  }

  async fetchList() {
    await this.fetchListOfStudents();
   
  }

  async fetchListOfStudents() {
    let list = this.fireDatabase.list<Item>('student');
    let item = list.valueChanges();

    item.subscribe( async students => {
      console.log('%c Fetching Students...','color: white; background: green; font-size: 16px');
      let tempArray = await this.db.fetchAppointmentListStudent(students);
      tempArray.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });
      
      this.peopleList = tempArray;
    }, error => console.log(error));
  }

  getSearchPerson(ev: any) {
    try {
        //Displays back all person in list
        this.peopleList = this.completePeopleList;

        // set val to the value of the searchbar
        const val = ev.target.value;

        // if the value is an empty string don't filter the list
        if (val && val.trim() != '') {
          this.peopleList = this.peopleList.filter((person) => {
            console.log('%c Searching...','color: yellow; background: green; font-size: 24px');
            return ( person["name"].toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
        }
    } catch {

    }
    
  }
  
  dismiss(recipient) {
    try {
      this.close();
      this.app.getRootNav().push(AppointmentAddPage, {date: this.date, recipient: recipient});
    } catch {

    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
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