import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ble-simple-mode',
  templateUrl: './simple-mode.component.html',
  styles: [`
    .more-button {
      position: absolute;
      top: 5px;
      right: 10px;
    }
  `]
})
export class SimpleModeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
