import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, App } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { ModalCounselorsProfileComponent } from '../../components/modal-counselors-profile/modal-counselors-profile';
import { HeadControlsCounselorsAddPage } from '../head-controls-counselors-add/head-controls-counselors-add';

/**
 * Generated class for the HeadControlsCounselorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls-counselors',
  templateUrl: 'head-controls-counselors.html',
})
export class HeadControlsCounselorsPage {

  spinner: any = true;
  counselorList = [];

  constructor(public navCtrl: NavController,
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase, 
      public modalCtrl: ModalController,
      public app: App,
      public navParams: NavParams) {
        this.initialize();
  }

  initialize() {
    try {
      this.spinner = true;
      this.fetchAllCounselors();
    } catch {

    }
  }

  async fetchAllCounselors() {
    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(() => {

        item.subscribe(async counselors=> {
          let tempArray = await this.db.fetchAllListCounselor(counselors);
          tempArray.sort(function(a,b) {
            console.log(a, " ? ", b);
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
          });
    
          this.counselorList = tempArray;
          this.spinner = false;
        }, error => console.log("Error"));
        
      }, error => console.log("Error"))
  }
  
  profile(person) {
    try {
      var id = person.id;
      const modal = this.modalCtrl.create(ModalCounselorsProfileComponent,  { id: id},{ cssClass: 'custom-modal-counselor-profile' });
      modal.present();
    } catch {

    }
  }

  addCounselor() {
    console.log("Add new Counselor");
    this.app.getRootNav().push(HeadControlsCounselorsAddPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsCounselorsPage');
  }

}
