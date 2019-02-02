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
import { ModalCounselorsAcademicComponent } from '../modal-counselors-academic/modal-counselors-academic';

/**
 * Generated class for the ModalCounselorsProfileComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-counselors-profile',
  templateUrl: 'modal-counselors-profile.html'
})
export class ModalCounselorsProfileComponent {

  connected: Subscription;
  disconnected: Subscription;

  userInfo = [];

  id: any;
  type: any;

  spinner: any = true;

  academicList = [];

  rating: any;

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
      this.fetchProfile();
      
      //Loading icon
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
    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async counselors => {
          this.profileInfo = await this.db.fetchCounselorProfile(this.id, counselors);
          console.log("Profile: ", this.profileInfo);
          this.spinner = false;
        }, error => console.log(error))
      }, error => console.log(error));
  }

  fetchRatings() {
    let list = this.fireDatabase.list<Item>("feedback");
    let item = list.valueChanges();

    item.subscribe(async feedbacks => {
      this.rating = await this.db.fetchFeedbackRating(this.id, feedbacks);

      if(!this.rating) console.log("No rating available");
    })
  }

  presentModal() {
    const modal = this.modalCtrl.create(ModalStudentUpdateComponent, {profile: this.profileInfo, type: this.type});
    modal.present();
  }

  changeAcademic() {
    const modal = this.modalCtrl.create(ModalCounselorsAcademicComponent, {id: this.id});
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
