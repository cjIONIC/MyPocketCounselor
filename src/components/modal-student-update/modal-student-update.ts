import { Component } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { ViewController, NavParams, Item } from 'ionic-angular';
import { unescapeIdentifier } from '@angular/compiler';
import { AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the ModalStudentUpdateComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-student-update',
  templateUrl: 'modal-student-update.html'
})
export class ModalStudentUpdateComponent {

  text: string;
  academicList = [];
  profile = [];
  status = [];
  type:any;

  id:any;
  currentUnit: any;
  currentStatus: any;
  academicID: any;
  

  constructor(public db: DatabaseProvider,
      public viewCtrl: ViewController,
      public fireDatabase: AngularFireDatabase,
      public navParams: NavParams) {
        this.initialize();
  }

  async initialize() {
    this.status = [
      {name: "Enrolled", checked: false},
      {name: "Not Enrolled", checked: false},
    ];
    this.type = this.navParams.get('type');
    await this.getCurrentData();
  }

  async getCurrentData() {
    let profile = this.navParams.get('profile');
    console.log("Fetched Profile: ", profile);
    
    let table;
    if(this.type === "Student") table = "student";
    else table = "counselor";

    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        item.subscribe(async accounts => {
          this.profile = await this.db.fetchPersonProfile(profile["id"], accounts, this.type);
          console.log("Profile: ", this.profile);

          this.currentStatus = await this.profile["status"];
          this.id = await this.profile["id"];
          let academic = await this.profile["academic"];
          academic = academic[0];
          this.currentUnit = await academic["id"];

          await this.fetchAcademic();
          await this.checkStatus(await this.currentStatus);
        });
      });
  }

  fetchAcademic() {
    console.log("Fetching...");
    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();

    item.subscribe(academics => {
      academics.forEach(academic => {
        if(academic["acCode"] !== "Guidance Center") {
          if(academic["acID"] === this.currentUnit) {
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

  checkStatus(status) {
    var tempArr = [];
    var array = this.status;
    var keys = Object.keys('array');
    for(var i = 0; i < keys.length; i++) {
      var count = keys[i];

      if( array[count] != undefined) {
        var name = array[count].name;
  
        if(status == name) {
          tempArr.push({
            "name": name,
            "checked": true
          })
          this.currentStatus= name;
        }else{
          tempArr.push({
            "name": name,
            "checked": false
          })
        }
      }
    }
    this.status = tempArr;
    console.log("Status: ", this.status);
  }

  checkedUnit(unit) {
    console.log("Unit: ", unit);
    this.currentUnit = unit["id"];
    let academicList = [];

    this.academicList.forEach(academic => {
      if(academic["id"] === unit["id"]) {
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
    })

    console.log("New acads: ", academicList);

    this.academicList = academicList;
  }

  update() {
    console.log("Status", this.currentStatus);
    console.log("Academic unit", this.currentUnit);

    this.db.updateStudentInfo(this.id, this.currentUnit, this.currentStatus).then(() => {
      this.viewCtrl.dismiss();
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
