import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, AlertController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalConcernsAddComponent } from '../../components/modal-concerns-add/modal-concerns-add';

/**
 * Generated class for the HeadControlsConcernsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls-concerns',
  templateUrl: 'head-controls-concerns.html',
})
export class HeadControlsConcernsPage {

  concernList: any;

  constructor(public navCtrl: NavController, 
      public alertCtrl: AlertController,
      public db: DatabaseProvider,
      public modalCtrl: ModalController,
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams) {
        this.initialize();
  }

  initialize() {
    try {
      this.fetchAllConcerns();
    } catch {

    }
  }

  fetchAllConcerns() {
    let list = this.fireDatabase.list<Item>("concern");
    let item = list.valueChanges();

    item.subscribe(async concerns => {
      this.concernList = await this.db.fetchAllConcerns(concerns);
      console.log("Concerns: ", this.concernList);
    })
  }

  addConcern() {
    console.log("Add Concern");

    const modal = this.modalCtrl.create(ModalConcernsAddComponent,  "",{ cssClass: 'custom-modal-concern' });
    modal.present();
  }

  removeConcern(id) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Do you want to delete this concern?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            try {
              this.db.removeConcern(id);
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsConcernsPage');
  }

}
