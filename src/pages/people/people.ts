import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, NavParams, Item, App, ModalController, PopoverController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { PopFilterComponent } from '../../components/pop-filter/pop-filter';
import { ModalProfileComponent } from '../../components/modal-profile/modal-profile';
import { CallNumber } from '@ionic-native/call-number';
import { Subscription } from 'rxjs/Subscription';

import { Network} from '@ionic-native/network';

/**
 * Generated class for the PeoplePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-people',
  templateUrl: 'people.html',
})
export class PeoplePage {


  connected: Subscription;
  disconnected: Subscription;

  unit: any;

  userInfo = [];
  completePeopleList = []; //Handles all people
  peopleList = []; //Modifiable List
  hotlineNumber: any;

  constructor(public navCtrl: NavController,
    private fireDatabase: AngularFireDatabase, 
    public db: DatabaseProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public network: Network,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    private callNumber: CallNumber,
    private app: App) {
      this.initialize();
  }

  async initialize() {
    await this.getUserInfo();
    this.unit = "All";
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
          await this.fetchHotline();
          await this.fetchList();
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

  async fetchList() {
    if(this.userInfo["type"] === "Student") {
      await this.fetchListOfCounselors(false, "All");
    } else {
      await this.fetchListOfStudents(false, "All");
    }
   
  }

  async fetchListOfStudents(filter: Boolean, unit) {
    let list = this.fireDatabase.list<Item>('student');
    let item = list.valueChanges();

    item.subscribe( async students => {
      console.log('%c Fetching Students...','color: white; background: green; font-size: 16px');
      let tempArray = await this.db.fetchListStudent(students, filter, unit);
      tempArray.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });
      
      if(!filter) this.completePeopleList = tempArray;
      this.peopleList = tempArray;
    }, error => console.log(error));
  }

  async fetchListOfCounselors(filter: Boolean, unit) {
    let list = this.fireDatabase.list<Item>('counselor');
    let item = list.valueChanges();

    item.subscribe( async counselors => {
      console.log('%c Fetching Students...','color: white; background: green; font-size: 16px');
      let tempArray = await this.db.fetchListCounselor(counselors, filter, unit);
      tempArray.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });
     
      if(!filter) this.completePeopleList = tempArray;
      this.peopleList = tempArray;
    }, error => console.log(error));
  }

  fetchHotline() {
    var list = this.fireDatabase.list<Item>('counselor');
    var item = list.valueChanges();

    item.subscribe( counselors => {
      counselors.forEach(counselor => {
        if(counselor["type"] === "GTD Head") this.hotlineNumber = counselor["cNUmber"];
      })
    }, error => console.log(error));
  }

  callHotline() {
    let alert = this.alertCtrl.create({
      title: 'Hotline Number',
      message: 'Press "Continue" to call hotline number.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Call',
          handler: () => {
            try {
              console.log('%c Calling Hotline Number...','color: white; background: green; font-size: 16px');
              this.callNumber.callNumber(this.hotlineNumber, true)
              .catch(err => console.log('Error launching dialer', err));
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
   
  }
  
  profile(person) {
    try {
      var id = person.id;

      if(this.userInfo["type"]== "Student") {
        var type = "Counselor";
        const modal = this.modalCtrl.create(ModalProfileComponent,  { id: id, type: type},{ cssClass: 'custom-modal-profile' });
        modal.present();
      } else {
        var type = "Student";
        const modal = this.modalCtrl.create(ModalProfileComponent,  { id: id, type: type},{ cssClass: 'custom-modal-profile' });
        modal.present();
      }
    } catch {

    }
  }

  filterButton(myEvent) {
    let popover = this.popoverCtrl.create(PopFilterComponent, {unit: this.unit},{ cssClass: 'custom-popover-filter' });
    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(result => {
      var selected = [];

      if(result !=  null && result != undefined) {
        selected = result; 
        this.unit = selected;

        console.log("Selected", selected);
        
      this.filterList(selected); 
      }
    });
  }

  //Filter the current list
  async filterList(academic) {
    console.log('%c Filtering List','color: white; background: green; font-size: 16px');
    try {
      if(academic === "all") {
        if(this.userInfo["type"] === "Student") {
          this.fetchListOfCounselors(false, "All");
         } else {
           await this.fetchListOfStudents(false, "All");
         } 
      } else {
        if(this.userInfo["type"] === "Student") {
         this.fetchListOfCounselors(true, academic["id"]);
        } else {
          await this.fetchListOfStudents(true, academic["id"]);
        } 
      }
    } catch {
      console.log("Error fetching list");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PeoplePage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

  }

  ionViewDidEnter() {
    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
      this.initialize();
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
