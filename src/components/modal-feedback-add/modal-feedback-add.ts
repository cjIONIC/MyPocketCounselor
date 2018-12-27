import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the ModalFeedbackAddComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-feedback-add',
  templateUrl: 'modal-feedback-add.html'
})
export class ModalFeedbackAddComponent {

  text: string;

  constructor(public viewCtrl: ViewController,
    public db: DatabaseProvider) {
    console.log('Hello ModalFeedbackAddComponent Component');
  }

  onSubmit(value) {
    console.log("Value: ", value);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
