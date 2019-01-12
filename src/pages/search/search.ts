import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, Item, App, Searchbar, Navbar } from 'ionic-angular';
import { ModalProfileComponent } from '../../components/modal-profile/modal-profile';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';


/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  @ViewChild(Navbar) navbar: Navbar;
  @ViewChild('searchbar') searchbar: Searchbar;

  connected: Subscription;
  disconnected: Subscription;

  userInfo = [];
  completePeopleList = []; //Handles all people
  peopleList = []; //Modifiable List


  constructor(public navCtrl: NavController, 
    private fireDatabase: AngularFireDatabase,
    public network: Network,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private db: DatabaseProvider,
    public app: App) {
      this.initialize();
  }

  async initialize() {
    try {
      await this.getUserInfo();
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
      let tempArray = await this.db.fetchAllListCounselor(counselors);
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
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  ionViewDidEnter() {
    this.navbar.backButtonClick = () => this.navCtrl.pop({animate: false});
    
    setTimeout(() => {
      this.searchbar.setFocus();
    });

    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }
}
