import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea, IonDatetimeButton, IonModal, IonDatetime } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBackOutline, personCircle, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-nuevo-gasto',
  templateUrl: './nuevo-gasto.page.html',
  styleUrls: ['./nuevo-gasto.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonModal, IonDatetimeButton,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ]
})
export class NuevoGastoPage implements OnInit {

  metodoSeleccionado: string = 'efectivo';

  constructor() {
    addIcons({
      arrowBackOutline,
      personCircle,
      calendarOutline
    });
  }

  ngOnInit() {
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
  }

}
