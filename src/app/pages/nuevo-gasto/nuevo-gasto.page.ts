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
import { Router } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { gastos } from '../../models/gasto.model';

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
  private editId: number | null = null;

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
    private gastosService: GastosService,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      personCircle,
      calendarOutline
    });
  }

  ngOnInit() {
    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as {
      gasto?: gastos;
    };

    if (state?.gasto) {
      this.editId = state.gasto.id;
      this.form.setValue({
        concepto: state.gasto.concepto ?? '',
        monto: Number(state.gasto.monto ?? 0),
        fecha_gasto: state.gasto.fecha_gasto ?? this.todayValue,
        categoria: state.gasto.categoria ?? 'Otros',
        metodo_pago: state.gasto.metodo_pago ?? 'Efectivo',
        notas: state.gasto.notas ?? '',
      });
    }
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
    const concepto = payload.concepto.trim();
    const notas = payload.notas.trim();
    const monto = Number(payload.monto);
    const fecha = payload.fecha_gasto;
    const categoria = payload.categoria;
    const metodo = payload.metodo_pago;

    const { error } = this.editId
      ? await this.gastosService.updateGasto(this.editId, {
          concepto,
          monto,
          fecha_gasto: fecha,
          categoria,
          metodo_pago: metodo,
          notas,
        })
      : await this.gastosService.addGasto({
          concepto,
          monto,
          fecha_gasto: fecha,
          categoria,
          metodo_pago: metodo,
          notas,
        });

    if (error) {
      this.errorMessage = error;
      this.guardando = false;
      return;
    }

    this.guardando = false;
    this.router.navigateByUrl('/tabs/tab2');
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

  cancelar(): void {
    this.router.navigateByUrl('/tabs/tab2');
  }

}
