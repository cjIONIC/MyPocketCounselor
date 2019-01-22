import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, Modal, ModalController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { ModalRequestComponent } from '../../components/modal-request/modal-request';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';


/**
 * Generated class for the RegisterValidationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register-validation',
  templateUrl: 'register-validation.html',
})
export class RegisterValidationPage {

  connected: Subscription;
  disconnected: Subscription;

  requestList = [];
  userInfo = [];

  constructor(public navCtrl: NavController, 
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public network: Network,
    public navParams: NavParams) {
  
      this.initialize();
  }

  async initialize() {
    await this.getUserInfo();
  }
  
  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);
    let table;

    if(userInfo["type"] === "Student") table = "student"
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);
          await this.fetchRequests();
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

  async fetchRequests() {
    let academicList = [];

    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    academics.forEach(academic => {
      if(academic["cID"] === this.userInfo["id"]) {
        academicList.push(academic);
      }
    })

    this.fireDatabase.list<Item>("registration")
      .valueChanges().subscribe(async requests => {
        console.log("Request:", requests);
        this.requestList = await this.db.fetchRegistrations(academicList, requests);
        console.log("Request fetched: ", this.requestList);
      }, error => console.log("Error"));
  }
  
  profile(person) {
    try {
      const modal = this.modalCtrl.create(ModalRequestComponent,  { id: person.id});
      modal.present();
    } catch {

    }
  }

  async updateRegistrationStatus() {
    console.log("Updating registrations");

    let ref = this.fireDatabase.list('registration');
    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    ref.snapshotChanges()
    .subscribe(registrations => {
      let keys = Object.keys(registrations);

      for(let i = 0; i < keys.length; i++) {
        let count = keys[i];
        let registration = registrations[count].payload.val();

        let counselor;

        academics.forEach(academic => {
          if(registration.acID === academic["acID"]) counselor = academic["cID"];
        })
  
        if (this.userInfo["type"] === "Counselor") {
          if(counselor === this.userInfo["id"]
              && registration.rDeviceCounselor === "Sent")
              ref.update(registrations[count].key, { rDeviceCounselor: "Received" });
  
        }
  
        if (this.userInfo["type"] === "GTD Head") {
          if(registration.rDeviceHead === "Sent")
              ref.update(registrations[count].key, { rDeviceHead: "Received" });
  
        }
      }
    })
    return;
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();

    this.updateRegistrationStatus();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterValidationPage');
  }

  ionViewDidEnter() {
    this.initialize();
    
    this.connected = this.network.onConnect().subscribe( data => {
      this.presentToast("You are online");
      this.initialize();
    }, error => console.log(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.presentToast("You are offline");
    }, error => console.log(error));
  }

}
