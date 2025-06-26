import { Component } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private isBrowserOpen = false;
  private loader: HTMLIonLoadingElement | null = null;
  constructor(
    private iab: InAppBrowser,
    private loadingController: LoadingController
  ) {
    this.openWebView();

    // Handle back button press
    CapacitorApp.addListener('backButton', () => {
      if (this.isBrowserOpen) {
        CapacitorApp.exitApp();
      }
    });

    // Reopen browser when app comes back from background
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && !this.isBrowserOpen) {
        this.openWebView();
      }
    });
  }

  async openWebView() {
    this.isBrowserOpen = true;

    // Show loader first
    this.loader = await this.loadingController.create({
      // message: 'Loading...',
      spinner: 'dots',
      backdropDismiss: false
    });
    await this.loader.present();
  
    // Delay opening browser slightly to allow loader to be visible
    setTimeout(() => {
      const browser: InAppBrowserObject = this.iab.create('https://www.runthrough.co.uk/', '_blank', {
        location: 'no',
        toolbar: 'no',
        zoom: 'no',
        enableViewportScale: 'no',
      });
  
      browser.on('loadstop').subscribe(() => {
        this.dismissLoader();
      });
  
      browser.on('loaderror').subscribe(() => {
        this.dismissLoader();
      });
  
      browser.on('exit').subscribe(() => {
        this.isBrowserOpen = false;
        CapacitorApp.exitApp();
      });
    }, 200); // small delay (can be 100–300ms)
  }

  async dismissLoader() {
    if (this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
  }
}
