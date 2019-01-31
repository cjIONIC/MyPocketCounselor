import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';

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

  counselorList = [];

  constructor(public navCtrl: NavController,
      public db: DatabaseProvider,
      public fireDatabase: AngularFireDatabase, 
      public navParams: NavParams) {

        this.fetchAllCounselors();
  }

  async fetchAllCounselors() {
    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    item.subscribe(async counselors=> {
      let tempArray = await this.db.fetchAllListCounselor(counselors);
      tempArray.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });

      this.counselorList = tempArray;
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsCounselorsPage');
  }

}
