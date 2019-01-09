import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, Modal, ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { ModalRequestComponent } from '../../components/modal-request/modal-request';


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

  requestList = [];
  userInfo = [];

  constructor(public navCtrl: NavController, 
    public fireDatabase: AngularFireDatabase,
    public db: DatabaseProvider,
    public modalCtrl: ModalController,
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

  async fetchRequests() {
    let academicList = [];

    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    academics.forEach(academic => {
      if(academic["acID"] === this.userInfo["id"]) {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterValidationPage');
  }

}
