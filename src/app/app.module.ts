import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Modal } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar'; 
import { CallNumber } from '@ionic-native/call-number';

import { MyApp } from './app.component'; 

//Pages
import { FeedPage } from '../pages/feed/feed';
import { PeoplePage } from '../pages/people/people';
import { NotificationPage } from '../pages/notification/notification';
import { MenuPage } from '../pages/menu/menu';
import { TabPage } from '../pages/tab/tab';
import { SearchPage } from '../pages/search/search';
import { ChatPage } from '../pages/chat/chat';
import { LoginPage } from '../pages/login/login';
import { AppointmentPage } from '../pages/appointment/appointment';
import { RegisterPage } from '../pages/register/register';

//Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';

//Extra imports for Native Apps
//import { Calendar } from '@ionic-native/calendar';
import { DatePicker } from '@ionic-native/date-picker'; 
import { DatabaseProvider } from '../providers/database/database';

import {TimeAgoPipe} from 'time-ago-pipe';
import {  FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { PopFeedOptionsComponent } from '../components/pop-feed-options/pop-feed-options';
import { EditPostPage } from '../pages/edit-post/edit-post';
import { PopFilterComponent } from '../components/pop-filter/pop-filter';
import { ModalStudentUpdateComponent } from '../components/modal-student-update/modal-student-update';

//Native Plugins
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera } from '@ionic-native/camera';
import { AddPostPage } from '../pages/add-post/add-post';
import { GooglePlus } from '@ionic-native/google-plus';
import { IonicStorageModule } from '@ionic/storage';
import { ModalSearchComponent } from '../components/modal-search/modal-search';
import { ModalProfileComponent } from '../components/modal-profile/modal-profile';
import { Keyboard } from '@ionic-native/keyboard';
import { Network } from '@ionic-native/network'
import { PopScheduleComponent } from '../components/pop-schedule/pop-schedule';
import { ModalScheduleComponent } from '../components/modal-schedule/modal-schedule';
import { RequestPage } from '../pages/request/request';
import { ModalRequestComponent } from '../components/modal-request/modal-request';
import { ModalNotificationComponent } from '../components/modal-notification/modal-notification';
import { ChatPeopleListPage } from '../pages/chat-people-list/chat-people-list';
import { ChatMessagePage } from '../pages/chat-message/chat-message';
import { AppointmentAddPage } from '../pages/appointment-add/appointment-add';




import { ReactiveFormsModule } from '@angular/forms';

const firebaseConfig = {
  apiKey: "AIzaSyAVITAZa_qU9vSHq_ASeHJ1JGt3Sy8s8a0",
  authDomain: "mpcapp-c01ec.firebaseapp.com",
  databaseURL: "https://mpcapp-c01ec.firebaseio.com",
  projectId: "mpcapp-c01ec",
  storageBucket: "mpcapp-c01ec.appspot.com",
  messagingSenderId: "578845672664"
};


@NgModule({ 
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    RequestPage,
    ModalRequestComponent,
    FeedPage,
    PopFeedOptionsComponent,
    AddPostPage,
    EditPostPage,
    PeoplePage,
    PopFilterComponent,
    ModalProfileComponent,
    ModalStudentUpdateComponent,
    NotificationPage,
    ModalNotificationComponent,
    MenuPage,
    SearchPage,
    ChatPage,
    ChatPeopleListPage,
    ChatMessagePage,
    AppointmentPage,
    AppointmentAddPage,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalSearchComponent,
    TabPage,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,      
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      scrollFocusAssist: false
    }),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    RequestPage,
    ModalRequestComponent,
    FeedPage,
    PopFeedOptionsComponent,
    AddPostPage,
    EditPostPage,
    PeoplePage,
    PopFilterComponent,
    ModalProfileComponent,
    ModalStudentUpdateComponent,
    NotificationPage,
    ModalNotificationComponent,
    MenuPage,
    SearchPage,
    ChatPage,
    ChatPeopleListPage,
    ChatMessagePage,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalSearchComponent,
    AppointmentPage,
    AppointmentAddPage,
    TabPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    DatePicker,
    Keyboard,
    GooglePlus,
    CallNumber,
    FileChooser, File,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider
  ]
})
export class AppModule {}
