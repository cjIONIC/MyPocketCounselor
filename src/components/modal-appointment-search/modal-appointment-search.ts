import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, App, Item, ToastController, ViewController, Navbar, Searchbar } from 'ionic-angular';
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

  @ViewChild(Navbar) navbar: Navbar;
  @ViewChild('searchbar') searchbar: Searchbar;

  userInfo = [];
  completePeopleList = []; //Handles all people
  peopleList = []; //Modifiable List

  date: any;

  spinner: any = true;

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
      await this.getUserInfo();
    } catch {

    }
  }
  
  async getUserInfo() {
    let date = this.navParams.get('date');
    this.date = new Date(date);
    
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

  async fetchList() {
    await this.fetchListOfStudents(false, "All");
  }

  async fetchListOfStudents(filter: Boolean, unit) {
    let list = this.fireDatabase.list<Item>('student');
    let item = list.valueChanges();

    item.subscribe( async students => {
      console.log('%c Fetching Students...','color: white; background: green; font-size: 16px');
      let tempArray = await this.db.fetchListStudent(students, filter, unit);

      await tempArray.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });

      this.spinner = false;
      
      this.peopleList = tempArray;
      if(!filter) this.completePeopleList = tempArray;
      console.log("People list: ", this.peopleList);
    }, error => console.log(error));
  }

  getSearchPerson(ev: any) {
    console.log("Input detected!");
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
    console.log('ionViewDidLoad ModalAppointmentSearch');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  ionViewDidEnter() {
    /*
    setTimeout(() => {
      this.searchbar.setFocus();
    });
    */

    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }

}
