import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  IonTextarea, IonDatetimeButton, IonModal, IonDatetime, IonText, IonSpinner } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBackOutline, personCircle, calendarOutline } from 'ionicons/icons';
import { GastosService } from '../../services/gastos.service';

@Component({
  selector: 'app-nuevo-gasto',
  templateUrl: './nuevo-gasto.page.html',
  styleUrls: ['./nuevo-gasto.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, IonDatetime, IonModal, IonDatetimeButton,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonInput,
    IonText,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class NuevoGastoPage implements OnInit {
  guardando = false;
  errorMessage: string | null = null;
  private readonly todayValue = new Date().toISOString().split('T')[0];

  form = this.formBuilder.group({
    concepto: ['', [Validators.required, Validators.minLength(3)]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    fecha_gasto: [this.todayValue, [Validators.required]],
    categoria: ['', [Validators.required]],
    metodo_pago: ['', [Validators.required]],
    notas: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor(
    private formBuilder: NonNullableFormBuilder,
    private gastosService: GastosService
  ) {
    addIcons({
      arrowBackOutline,
      personCircle,
      calendarOutline
    });
  }

  ngOnInit() {
  }

  seleccionarMetodo(metodo: string) {
    this.form.controls.metodo_pago.setValue(metodo);
    this.form.controls.metodo_pago.markAsTouched();
  }

  async guardar(): Promise<void> {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.errorMessage = null;

    const payload = this.form.getRawValue();
    const { error } = await this.gastosService.addGasto({
      concepto: payload.concepto.trim(),
      monto: Number(payload.monto),
      fecha_gasto: payload.fecha_gasto,
      categoria: payload.categoria,
      metodo_pago: payload.metodo_pago,
      notas: payload.notas.trim(),
    });

    if (error) {
      this.errorMessage = error;
    } else {
      this.form.reset({
        concepto: '',
        monto: 0,
        fecha_gasto: this.todayValue,
        categoria: '',
        metodo_pago: '',
        notas: '',
      });
    }

    this.guardando = false;
  }

  isMetodoActivo(metodo: string): boolean {
    return this.form.controls.metodo_pago.value === metodo;
  }

  onFechaGastoChange(value: string | string[] | null | undefined): void {
    if (typeof value === 'string') {
      this.form.controls.fecha_gasto.setValue(value);
      this.form.controls.fecha_gasto.markAsTouched();
    }
  }

}
