import { Component } from '@angular/core';

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

  constructor() {
    console.log('Hello ModalFeedbackAddComponent Component');
    this.text = 'Hello World';
  }

}
