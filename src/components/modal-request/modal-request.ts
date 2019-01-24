import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController, ViewController, Item, Toast, AlertController, LoadingController } from 'ionic-angular';
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
      public loadingCtrl: LoadingController,
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

  presentAlert(title, description) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: description,
      buttons: ['OK']
    });
    alert.present();
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
              this.db.rejectStudentRequest(this.profileInfo).then(() => this.close());
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  confirmAccpet() {
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
          handler:  () => {
            try {
             this.accept();
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  async accept() {
    let request = await this.inputs();

    let list = this.fireDatabase.list<Item>("student");
    let item = list.valueChanges();

    let timeout = Math.floor(Math.random() * 1500) + 500;
    
    let profile = this.profileInfo;
    let email = profile["email"];
    console.log("Email: ", email);
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      setTimeout(async () => {
        let found = await new Promise <any> ( resolve => {
          item.subscribe(async students => {
      
            students.forEach(student => {
              if(student["sEmail"] === email) {
                  console.log(student["sEmail"] , " ? ", email);
                  resolve(true);
              }
            });
    
            resolve(false)
    
          });
        })
  
        if(!found) {
          let id = profile["id"];
          console.log("To be added: ", request);
          this.db.acceptStudentRequest(request, id).then(() => {
            loading.dismiss();
            this.close();
          });
        } else {
          loading.dismiss();
          this.viewCtrl.dismiss().then(() => {
            this.presentAlert("Info","Account was already verified");
          });
        }
  
      }, timeout);
    })

   

  }

  async inputs() {
    let requestInput = [];
    let requestID = this.profileInfo["id"];

    let registrations = await this.db.fetchAllNodesByTableInDatabase("registration");

    registrations.forEach( request => {
      if(request["rID"] === requestID) {
        requestInput.push({
          sID: request["rID"],
          sFirstName: request["rFirstName"],
          sLastName: request["rLastName"],
          sEmail: request["rEmail"],
          sPicture: request["rPicture"],
          sPassword: request["rPassword"],
          sStatus: request["rStatus"],
          acID: parseInt(request["acID"])
        })
      }
    })

    return requestInput[0];
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
