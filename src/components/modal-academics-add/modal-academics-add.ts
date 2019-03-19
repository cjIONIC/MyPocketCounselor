import { Component } from '@angular/core';

/**
 * Generated class for the ModalAcademicsAddComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-academics-add',
  templateUrl: 'modal-academics-add.html'
})
export class ModalAcademicsAddComponent {

  text: string;

  constructor() {
    console.log('Hello ModalAcademicsAddComponent Component');
    this.text = 'Hello World';
  }

}
