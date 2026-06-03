import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonChip,
  IonLabel,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { pencilOutline, trashOutline, ellipsisVertical, search, personCircle, add, medkitOutline, carOutline, wifiOutline, cafeOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonFab,
    IonFabButton,
    RouterLink
  ]
})
export class Tab2Page {

  constructor() {
    addIcons({
      pencilOutline,
      trashOutline,
      ellipsisVertical,
      search,
      personCircle,
      add,
      medkitOutline,
      carOutline,
      wifiOutline,
      cafeOutline

    });
  }


}
