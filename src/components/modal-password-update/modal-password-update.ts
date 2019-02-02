import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';
import { Item, AlertController, LoadingController, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalPasswordUpdateComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-password-update',
  templateUrl: 'modal-password-update.html'
})
export class ModalPasswordUpdateComponent {

  connected: Subscription;
  disconnected: Subscription;
  account: Subscription;
  userInfo = [];

  registrationBadge: any;
  popBadge: any;

  spinner: any = true;

  currentPassword: any;

  passwordDefault: any;
  matchPassword: any;

  text: string;

  constructor(public db: DatabaseProvider,
      public alertCtrl: AlertController,
      public loadingCtrl: LoadingController,
      public viewCtrl: ViewController,
      public fireDatabase: AngularFireDatabase) {
        this.initialize();

  }

  initialize() {
    try {
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

    this.account = item.subscribe(async accounts => {
      await this.db.refreshUserInfo(accounts, userInfo);
      this.userInfo = await this.db.getUserInfo();
      console.log("User information: ", this.userInfo);
      this.currentPassword = this.userInfo["password"];

    }, error => console.log(error));
  }
  
  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
  }

  passwordConfirmation(event) {
    let password = event["value"];
    console.log("Password: ", password , " ? ", this.passwordDefault);
    if(!this.passwordDefault) this.matchPassword = true;

    if(this.passwordDefault) {
      if(password !== this.passwordDefault) this.matchPassword = false;
      else this.matchPassword = true;
    } else this.matchPassword = true;
  }

  onSubmit(form) {
    console.log("Values: ", form);
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      if(form["current"] !== this.currentPassword) {
        this.presentAlert("Error Password", "Your current password was entered incorrectly. " +
        "Please enter it again.");
        loading.dismiss();
      } else {
        this.db.updatePassword(form["password"]).then(() => {
          loading.dismiss();
          this.dismiss()
        });
      }
    })

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
