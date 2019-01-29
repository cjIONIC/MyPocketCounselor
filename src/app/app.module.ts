import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Modal } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar'; 
import { CallNumber } from '@ionic-native/call-number';

import { MyApp } from './app.component'; 

//Pages
import { PeoplePage } from '../pages/people/people';
import { NotificationPage } from '../pages/notification/notification';
import { MenuPage } from '../pages/menu/menu';
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
import { DatabaseProvider } from '../providers/database/database';

import {TimeAgoPipe} from 'time-ago-pipe';
import {  FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { PopFeedOptionsComponent } from '../components/pop-feed-options/pop-feed-options';
import { PopFilterComponent } from '../components/pop-filter/pop-filter';
import { ModalStudentUpdateComponent } from '../components/modal-student-update/modal-student-update';

import { PostPage } from '../pages/post/post';
//Native Plugins
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { EmailComposer } from '@ionic-native/email-composer';
import { Camera } from '@ionic-native/camera';
import { GooglePlus } from '@ionic-native/google-plus';
import { IonicStorageModule } from '@ionic/storage';
import { ModalProfileComponent } from '../components/modal-profile/modal-profile';
import { Keyboard } from '@ionic-native/keyboard';
import { Network } from '@ionic-native/network'
import { PopScheduleComponent } from '../components/pop-schedule/pop-schedule';
import { ModalScheduleComponent } from '../components/modal-schedule/modal-schedule';
import { ModalRequestComponent } from '../components/modal-request/modal-request';
import { ModalNotificationComponent } from '../components/modal-notification/modal-notification';
import { ChatPeopleListPage } from '../pages/chat-people-list/chat-people-list';
import { ChatMessagePage } from '../pages/chat-message/chat-message';
import { AppointmentAddPage } from '../pages/appointment-add/appointment-add';

import { ReactiveFormsModule } from '@angular/forms';
import { PostAddPage } from '../pages/post-add/post-add';
import { PostEditPage } from '../pages/post-edit/post-edit';
import { HomePage } from '../pages/home/home';
import { RegisterValidationPage } from '../pages/register-validation/register-validation';
import { ModalFeedbackAddComponent } from '../components/modal-feedback-add/modal-feedback-add';
import { ProfilePage } from '../pages/profile/profile';
import { ModalAppointmentSearchComponent } from '../components/modal-appointment-search/modal-appointment-search';
import { ModalPasswordComponent } from '../components/modal-password/modal-password';

import { Firebase } from '@ionic-native/firebase';

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
    ModalPasswordComponent,
    RegisterPage,
    RegisterValidationPage,
    HomePage,
    ModalRequestComponent,
    PostPage,
    PostAddPage,
    PostEditPage,
    PopFeedOptionsComponent,
    PeoplePage,
    PopFilterComponent,
    ModalProfileComponent,
    ModalStudentUpdateComponent,
    NotificationPage,
    ModalNotificationComponent,
    MenuPage,
    ProfilePage,
    SearchPage,
    ChatPage,
    ChatPeopleListPage,
    ChatMessagePage,
    AppointmentPage,
    AppointmentAddPage,
    ModalAppointmentSearchComponent,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalFeedbackAddComponent,
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
    ModalPasswordComponent,
    RegisterPage,
    RegisterValidationPage,
    HomePage,
    ModalRequestComponent,
    PostPage,
    PostAddPage,
    PostEditPage,
    PopFeedOptionsComponent,
    PeoplePage,
    PopFilterComponent,
    ModalProfileComponent,
    ModalStudentUpdateComponent,
    NotificationPage,
    ModalNotificationComponent,
    MenuPage,
    ProfilePage,
    SearchPage,
    ChatPage,
    ChatPeopleListPage,
    ChatMessagePage,
    PopScheduleComponent,
    ModalScheduleComponent,
    AppointmentPage,
    AppointmentAddPage,
    ModalAppointmentSearchComponent,
    ModalFeedbackAddComponent,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    Firebase,
    Keyboard,
    GooglePlus,
    CallNumber,
    EmailComposer,
    FileChooser, File,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider
  ]
})
export class AppModule {}