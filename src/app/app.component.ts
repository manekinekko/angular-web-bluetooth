import { Component } from '@angular/core';

@Component({
  selector: 'ble-root',
  template: `
    <mat-toolbar color="primary">
      <img class="logo" src="assets/angular-web-ble.png" />
      <span>Angular Web BLE Demo</span>
      <nav class="nav">
        <button mat-button routerLink="" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">Batch mode</button>
        <button mat-button routerLink="/simple-mode" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">Simple mode</button>
      </nav>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .mat-toolbar.mat-primary {
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .logo {
      width: 32px;
      margin: 0 10px;
    }
    .nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-left: 20px;
      padding: 8px 16px;
    }
    .active-link {
      background: hsla(0,0%,100%,.15);
    }
  `]
})
export class AppComponent {}
