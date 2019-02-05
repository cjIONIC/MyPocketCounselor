import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../providers/database/database';

//Pages
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { HomePage } from '../pages/home/home';
import { HeadControlsPage } from '../pages/head-controls/head-controls';
import { DisclaimerPage } from '../pages/disclaimer/disclaimer';

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
      
      this.initialize();
    });
  }

  async initialize() {
    const disclaimer = await this.db.getDisclaimer();
    
    if(disclaimer) {
      this.getUserProfile();
    } else {
      this.rootPage = DisclaimerPage;
    }
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
      this.rootPage = HomePage;
    }
  }
}

