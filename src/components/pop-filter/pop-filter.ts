import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { ViewController, Item, ToastController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Network} from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the PopFilterComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pop-filter',
  templateUrl: 'pop-filter.html'
})
export class PopFilterComponent {

  connected: Subscription;
  disconnected: Subscription;
  all = false;

  unit: any;
  text: string;
  academicList = [];

  constructor(public db: DatabaseProvider,
    public network: Network,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public fireDatabase: AngularFireDatabase,
    public viewCtrl: ViewController) {

      this.unit = navParams.get('unit');
      console.log("Selected: ", this.unit);
      if(this.unit === "All") this.all = true;
      else this.all = false;
      this.fetchAllAcademics();
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

  fetchAllAcademics() {
    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();

    item.subscribe(academics => {
      this.academicList = [];

      academics.forEach(academic => {
        let check = false;

        if(this.unit["id"] === academic["acID"]) check = true;
        this.academicList.push({
          id: academic["acID"],
          code: academic["acCode"],
          check: check
        })
      });


      this.academicList.sort(function(a,b) {
        console.log(a, " ? ", b);
        if(a.code < b.code) { return -1; }
        if(a.code > b.code) { return 1; }
        return 0;
      });
      console.log("Academics: ", this.academicList);
    }, error => console.log(error))
  }

  getSelect(academic) {
    try {
      console.log("Academic: ", academic);
      this.viewCtrl.dismiss(academic);
    } catch {

    }
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
