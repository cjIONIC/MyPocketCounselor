import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ModalConcernsAddComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-concerns-add',
  templateUrl: 'modal-concerns-add.html'
})
export class ModalConcernsAddComponent {

  text: string;

  constructor(public viewCtrl: ViewController,
      public db: DatabaseProvider) {
    console.log('Hello ModalConcernsAddComponent Component');
    this.text = 'Hello World';
  }

  onAdd(concern) {
    console.log("Concern: ", concern["name"]);

    this.db.addConcern(concern["name"]).then(() => {
      this.close();
    })
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
