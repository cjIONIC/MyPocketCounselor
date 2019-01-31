import { Component } from '@angular/core';

/**
 * Generated class for the ModalCounselorsProfileComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-counselors-profile',
  templateUrl: 'modal-counselors-profile.html'
})
export class ModalCounselorsProfileComponent {

  text: string;

  constructor() {
    console.log('Hello ModalCounselorsProfileComponent Component');
    this.text = 'Hello World';
  }

}
