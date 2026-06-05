import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, trendingUp, notificationsOutline, restaurantOutline, wifiOutline, busOutline, cartOutline, carOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ]
})
export class Tab4Page implements OnInit {

  constructor() {
    addIcons({ personCircle, trendingUp, notificationsOutline, restaurantOutline, wifiOutline, busOutline, cartOutline, carOutline });
  }

  ngOnInit() {
  }

}
