import { Component } from '@angular/core';
import { ViewController, LoadingController } from 'ionic-angular';
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
      public loadingCtrl: LoadingController,
      public db: DatabaseProvider) {
    console.log('Hello ModalConcernsAddComponent Component');
    this.text = 'Hello World';
  }

  onAdd(concern) {
    
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      content: 'Please Wait...'
    });

    loading.present().then(() => {
      console.log("Concern: ", concern["name"]);
  
      this.db.addConcern(concern["name"]).then(() => {
        loading.dismiss();
        this.dismiss();
      })
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
