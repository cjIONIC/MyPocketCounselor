import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { ModalAcademicsAddComponent } from '../../components/modal-academics-add/modal-academics-add';

/**
 * Generated class for the HeadControlsAcademicsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls-academics',
  templateUrl: 'head-controls-academics.html',
})
export class HeadControlsAcademicsPage {

  academicList: any;

  constructor(public navCtrl: NavController, 
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase,
      public modalCtrl: ModalController,
      public navParams: NavParams) {
        this.intialize();
  }

  intialize() {
    try {
      this.fetchAllAcademics();
    } catch {

    }
  }

  fetchAllAcademics() {
    let list = this.fireDatabase.list<Item>("academic");
    let item = list.valueChanges();

    item.subscribe(async academics => {
      this.academicList = await this.db.fetchAllAcademics(academics);
      console.log("Academics: ", this.academicList);
    })
  }

  addAcademic() {
    console.log("Adding academic unit...");

    const modal = this.modalCtrl.create(ModalAcademicsAddComponent,  "",{ cssClass: 'custom-modal-concern' });
    modal.present();
  }

  removeAcademic() {
    console.log("Adding academic unit...")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsAcademicsPage');
  }

}
