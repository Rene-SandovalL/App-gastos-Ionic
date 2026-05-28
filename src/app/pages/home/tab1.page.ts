import { Component, inject } from '@angular/core';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonChip,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {add,arrowUpOutline,cafeOutline,calendarOutline,carOutline,cartOutline,chevronForward,homeOutline,listOutline,notificationsOutline,personCircle,qrCodeOutline,receiptOutline,restaurantOutline,statsChartOutline,trendingUp,} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,    IonAvatar,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,],
})
export class Tab1Page {
  private readonly router = inject(Router);

  constructor() {
    addIcons({
      add,arrowUpOutline,cafeOutline,calendarOutline,carOutline,cartOutline,chevronForward,homeOutline,listOutline,notificationsOutline,personCircle,qrCodeOutline,receiptOutline,restaurantOutline,statsChartOutline,trendingUp,});
  }

  irNuevoGasto() {
    this.router.navigateByUrl('/nuevo-gasto');
  }
}
