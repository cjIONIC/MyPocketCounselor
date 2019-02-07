import { Component } from '@angular/core';
import { NavParams, App, ViewController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { PostEditPage } from '../../pages/post-edit/post-edit';

/**
 * Generated class for the PopFeedOptionsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pop-feed-options',
  templateUrl: 'pop-feed-options.html'
})
export class PopFeedOptionsComponent {

  text: string;
  post = [];

  constructor( public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public db: DatabaseProvider,
    public app: App) {
      try {
        this.post = this.navParams.get('post');
      } catch {

      }
  }

  presentToast(description) {
    let toast = this.toastCtrl.create({
      message: description,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  deletePost() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'You are about to delete this post.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            try {
              let id = this.post["id"];

              
              let loading = this.loadingCtrl.create({
                spinner: 'ios',
                content: 'Please Wait...'
              });

              loading.present().then(() => {
                this.db.deletePost(id).then(() => {
                  loading.dismiss();
                  this.presentToast("Successfully deleted post");
                  this.viewCtrl.dismiss();
                })
              })
            } catch {
              
            }
          }
        }
      ]
    });
    alert.present();
  }

  editPost() {
    try {
      this.viewCtrl.dismiss().then(() => {
        this.app.getRootNav().push(PostEditPage, {post:this.post});
      });
    } catch {
      
    }
    
  }

}
