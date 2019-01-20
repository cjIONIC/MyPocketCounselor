import { Component } from '@angular/core';

/**
 * Generated class for the PopProfileEditComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pop-profile-edit',
  templateUrl: 'pop-profile-edit.html'
})
export class PopProfileEditComponent {

  text: string;

  constructor() {
    console.log('Hello PopProfileEditComponent Component');
    this.text = 'Hello World';
  }

}
