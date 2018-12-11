import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../providers/database/database';

//Pages
import { LoginPage } from '../pages/login/login';
import { TabPage } from '../pages/tab/tab';
import { RegisterPage } from '../pages/register/register';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    public keyboard: Keyboard,
    splashScreen: SplashScreen,
    public db: DatabaseProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.getUserProfile();
    });
  }
  async getUserProfile() {
    const user = await this.db.getProfileInStorage();
    //this.db.setProfileInStorage();
    const nowUser = await this.db.getUserInfo();
    console.log("Users: ", user, nowUser);
    if(user === null || user === undefined || user.length === 0) {
    console.log("Not logged in");
    this.rootPage = LoginPage;
    } else {
      console.log("Already logged in");
      this.rootPage = TabPage;
    }
  }
}

