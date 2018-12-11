import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';

/**
 * Generated class for the ModalNotificationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-notification',
  templateUrl: 'modal-notification.html'
})
export class ModalNotificationComponent {

  id: any;
  appointmentInfo = [];
  userInfo = [];

  constructor(public navParams: NavParams,
      public viewCtrl: ViewController,
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase) {
    this.initialize();
  }
  initialize() {
    try {
      this.id = this.navParams.get('id');
      console.log("ID: ", this.id);
      this.getUserInfo();
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
          await this.fetchAppointment();
        }, error => console.log(error));

    }, error => console.log(error));
    
  }

  fetchAppointment() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async appointments => this.appointmentInfo = await this.db.fetchNotificationInfo(this.id, appointments)
        , error => console.log(error))
      }, error => console.log(error));
  }
  

  close() {
    this.viewCtrl.dismiss();
  }

}
