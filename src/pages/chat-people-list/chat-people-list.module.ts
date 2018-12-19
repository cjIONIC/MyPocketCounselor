import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPeopleListPage } from './chat-people-list';

@NgModule({
  declarations: [
    ChatPeopleListPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPeopleListPage),
  ],
})
export class ChatPeopleListPageModule {}
