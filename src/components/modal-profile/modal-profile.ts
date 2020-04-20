import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController, ViewController, App, Item, Toast } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalStudentUpdateComponent } from '../../components/modal-student-update/modal-student-update';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { AppointmentAddPage } from '../../pages/appointment-add/appointment-add';
import moment from 'moment';
import { ChatMessagePage } from '../../pages/chat-message/chat-message';

/**
 * Generated class for the ModalProfileComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-profile',
  templateUrl: 'modal-profile.html' 
})
export class ModalProfileComponent {

  connected: Subscription;
  disconnected: Subscription;

  userInfo = [];

  id: any;
  type: any;

  spinner: any = true;

  academicList = [];

  profileInfo = [];
  academic = [];

  update: Boolean = false;

  constructor(public navCtrl: NavController, 
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams,
      private db: DatabaseProvider,
      public toastCtrl: ToastController,
      public network: Network,
      public viewCtrl: ViewController,
      public modalCtrl: ModalController,
      private app: App) {
        this.initialize();
  }

  initialize() {
    try {
      this.spinner = true;
      this.id = this.navParams.get('id');
      this.type = this.navParams.get('type');
      this.getUserInfo();
    } catch {

    }
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
          this.fetchProfile();
          await this.fetchAcademic();
          
          //Loading icon
          this.spinner = false;

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
  
  async fetchProfile() {
    let table;
    if(this.type === "Student") table = "student";
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async accounts => {
          this.profileInfo = await this.db.fetchPersonProfile(this.id, accounts, this.type);
          this.verifyAcademic();
          console.log("Profile: ", this.profileInfo);
        }, error => console.log(error))
      }, error => console.log(error));
  }

  fetchAcademic() {
    let list = this.fireDatabase.list<Item>("academic");
    let item = list.valueChanges();
    item.subscribe(academics => {
      academics.forEach(academic => {
        if(academic["cID"] === this.userInfo["id"]) {
          this.academicList.push({
            id: academic["acID"],
            name: academic["acName"],
            code: academic["acCode"]
          })

          console.log("Academics: ", this.academicList);
        }
      })
    })
  }

  verifyAcademic() {
    let found = false;
    let profileUnit = this.profileInfo["academic"];
      console.log("Unit: ", profileUnit);
      let studentUnit = profileUnit[0];

      this.academicList.forEach(academic => {
        if(studentUnit["name"] === academic["name"]) found = true;
       })

       this.update = found;

  }

  message() {
    this.app.getRootNav().push(ChatMessagePage, {person: this.id});
    this.viewCtrl.dismiss();
  }

  presentModal() {
    const modal = this.modalCtrl.create(ModalStudentUpdateComponent, {profile: this.profileInfo, type: this.type}, {cssClass: 'custom-modal-student-update'});
    modal.present();
  }

  close() {
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
