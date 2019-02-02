import { Component } from '@angular/core';

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

  text: string;

  constructor() {
    console.log('Hello ModalCounselorsAcademicComponent Component');
    this.text = 'Hello World';
  }

}
