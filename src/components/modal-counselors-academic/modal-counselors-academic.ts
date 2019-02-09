import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { NavParams, ViewController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ModalCounselorsAcademicComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-counselors-academic',
  templateUrl: 'modal-counselors-academic.html'
})
export class ModalCounselorsAcademicComponent {

  academicList = [];
  currentAcademic = [];

  text: string;

  id: any;

  constructor(public fireDatabase: AngularFireDatabase,
      public db: DatabaseProvider,
      public viewCtrl: ViewController,
      public loadingCtrl: LoadingController,
      public navParams: NavParams) {
        this.intialize();
  }

  intialize() {
    try {
      this.id = this.navParams.get("id");
      this.fetchAcademic();
    } catch {

    }
  }

  fetchAcademic() {
    console.log("Fetching...");
    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();

    item.subscribe(academics => {
      academics.forEach(academic => {
        if(academic["acID"] !== 1) {
          if(academic["cID"] === this.id) {
            this.academicList.push({
              id: academic["acID"],
              name: academic["acName"],
              checked: true
            });
          } else {
            this.academicList.push({
              id: academic["acID"],
              name: academic["acName"],
              checked: false
            });
          }
        }

      })
    })
  }

  checkedUnit(unit) {
    console.log("Unit: ", unit);
    let academicList = [];

    this.academicList.forEach(academic => {
      if(academic["id"] === unit["id"]) {
        if(academic["checked"] === false) {
          academicList.push({
           id: academic["id"],
           name: academic["name"],
           checked: true
         });
        } else {
          academicList.push({
           id: academic["id"],
           name: academic["name"],
           checked: false
         });
        }
      } else {
        academicList.push({
          id: academic["id"],
          name: academic["name"],
          checked: academic["checked"]
        });
      }
    })

    console.log("New acads: ", academicList);

    this.academicList = academicList;
  }

  changeAcademic() {
    let academicList = [];

    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      this.academicList.forEach(academic => {
        if(academic["checked"] === true) {
          academicList.push(academic["id"])
        }
       })
  
       console.log("New academic: ", academicList);
       this.db.updateAcademicCounselor(this.id, academicList).then(() => {
         loading.dismiss();
         this.dismiss();
       })
    })

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
