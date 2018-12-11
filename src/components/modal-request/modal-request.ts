import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController, ViewController, Item, Toast, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the ModalRequestComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-request',
  templateUrl: 'modal-request.html'
})
export class ModalRequestComponent {

  connected: Subscription;
  disconnected: Subscription;

  id: any;

  profileInfo = [];
  academic = [];

  constructor(public navCtrl: NavController, 
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams,
      private db: DatabaseProvider,
      public toastCtrl: ToastController,
      public network: Network,
      public viewCtrl: ViewController,
      public alertCtrl: AlertController,
      public modalCtrl: ModalController) {
        this.initialize();
  }
  initialize() {
    try {
      this.id = this.navParams.get('id');
      console.log("ID: ", this.id);
      this.fetchProfile();
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
  
  async fetchProfile() {
    let list = this.fireDatabase.list<Item>("registration");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async accounts => this.profileInfo = await this.db.fetchRequestProfile(this.id, accounts)
        , error => console.log(error))
      }, error => console.log(error));
  }

  reject() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Reject',
      message: 'You are about to reject this request',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            try {
              this.db.rejectRequestStudent(this.profileInfo[0]).then(() => this.close());
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  accept() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Accept',
      message: 'You are about to accept this request. This account will be added to the Student List.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            try {
              this.db.acceptRequestStudent(this.profileInfo[0]).then(() => this.close());
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
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
