import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Item } from 'klaw';
import { NavParams, ViewController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs/Subscription';

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

  account: Subscription;
  academic: Subscription;
  unit: Subscription;
  counselor: Subscription;
  unit2: Subscription;

  spinner: any = true;

  academicList = [];
  currentAcademic = [];
  profile = [];
  userInfo = [];

  type = [];
  currentType: any;

  check: any = true;

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
      this.type = [
        {name: "Counselor", checked: false},
        {name: "GTD Head", checked: false},
      ];

      this.getUserInfo();

    } catch {

    }
  }

  async getUserInfo() {
    let userInfo = await this.db.getProfileInStorage();
    console.log("Currently logged in: ", userInfo);

    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.academic = this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {

        this.account = item.subscribe(async accounts => {
          await this.db.refreshUserInfo(accounts, userInfo);
          this.userInfo = await this.db.getUserInfo();
          console.log("User information: ", this.userInfo);

          await this.getCurrentData();

        }, error => console.log(error));

    }, error => console.log(error));
  }

  async getCurrentData() {
  

    let list = this.fireDatabase.list<Item>("counselor");
    let item = list.valueChanges();

    this.unit = this.fireDatabase.list<Item>("academic")
      .valueChanges().subscribe(academics => {
        this.counselor = item.subscribe(async counselors => {
          this.check = true;

          counselors.forEach(counselor => {
            if(counselor["cID"] === this.id) {
              this.currentType = counselor["cType"];

              if(counselor["cID"] === this.userInfo["id"]) this.check = false;

            }
          })

          this.spinner = false;

          this.fetchAcademic();
          this.checkType(await this.currentType);
        });
      });
  }


  fetchAcademic() {
    console.log("Fetching...");
    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();

    this.unit2 = item.subscribe(academics => {
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

  checkType(type) {
    var tempArr = [];
    var array = this.type;
    var keys = Object.keys('array');

    for(var i = 0; i < keys.length; i++) {
      var count = keys[i];

      if( array[count] != undefined) {
        var name = array[count].name;
  
        if(type == name) {
          tempArr.push({
            "name": name,
            "checked": true
          })
          this.currentType= name;
        }else{
          tempArr.push({
            "name": name,
            "checked": false
          })
        }
      }
    }
    this.type = tempArr;
    console.log("Type: ", this.type);
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
       this.db.updateCounselorInfo(this.id, academicList, this.currentType).then(() => {
         loading.dismiss();
         this.dismiss();
       })
    })

  }

  dismiss() {
    this.account.unsubscribe();
    this.academic.unsubscribe();
    this.unit.unsubscribe();
    this.counselor.unsubscribe();
    this.unit2.unsubscribe();
    this.viewCtrl.dismiss();
  }

}
