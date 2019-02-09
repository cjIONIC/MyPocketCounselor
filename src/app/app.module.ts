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
import { FeedbackPage } from '../pages/feedback/feedback';
import { ModalProfileEditComponent } from '../components/modal-profile-edit/modal-profile-edit';
import { HeadControlsPage } from '../pages/head-controls/head-controls';
import { HeadControlsStatisticsPage } from '../pages/head-controls-statistics/head-controls-statistics';

import { ChartsModule } from 'ng2-charts';
import { ModalStatisticsComponent } from '../components/modal-statistics/modal-statistics';
import { HeadControlsConcernsPage } from '../pages/head-controls-concerns/head-controls-concerns';
import { ModalConcernsAddComponent } from '../components/modal-concerns-add/modal-concerns-add';
import { HeadControlsCounselorsPage } from '../pages/head-controls-counselors/head-controls-counselors';
import { ModalCounselorsProfileComponent } from '../components/modal-counselors-profile/modal-counselors-profile';
import { HeadControlsCounselorsAddPage } from '../pages/head-controls-counselors-add/head-controls-counselors-add';
import { ModalCounselorsAcademicComponent } from '../components/modal-counselors-academic/modal-counselors-academic';
import { SettingsPage } from '../pages/settings/settings';
import { ModalPasswordUpdateComponent } from '../components/modal-password-update/modal-password-update';
import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
import { ModalCounselorEditComponent } from '../components/modal-counselor-edit/modal-counselor-edit';

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
    DisclaimerPage,
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
    ModalProfileEditComponent,
    FeedbackPage,
    HeadControlsPage,
    HeadControlsStatisticsPage,
    ModalStatisticsComponent,
    HeadControlsConcernsPage,
    ModalConcernsAddComponent,
    HeadControlsCounselorsPage,
    HeadControlsCounselorsAddPage,
    ModalCounselorsProfileComponent,
    ModalCounselorsAcademicComponent,
    ModalCounselorEditComponent,
    SettingsPage,
    ModalPasswordUpdateComponent,
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
    ChartsModule,
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
    DisclaimerPage,
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
    ModalProfileEditComponent,
    FeedbackPage,
    HeadControlsPage,
    HeadControlsStatisticsPage,
    ModalStatisticsComponent,
    HeadControlsConcernsPage,
    ModalConcernsAddComponent,
    HeadControlsCounselorsPage,
    HeadControlsCounselorsAddPage,
    ModalCounselorsProfileComponent,
    ModalCounselorsAcademicComponent,
    ModalCounselorEditComponent,
    SettingsPage,
    ModalPasswordUpdateComponent,
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