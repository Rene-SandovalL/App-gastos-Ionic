import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  FormsModule,
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
  IonTextarea, IonModal, IonDatetime, IonText, IonSpinner } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  airplaneOutline,
  arrowBackOutline,
  buildOutline,
  busOutline,
  cafeOutline,
  calendarOutline,
  carOutline,
  cartOutline,
  closeOutline,
  fastFoodOutline,
  filmOutline,
  fitnessOutline,
  gameControllerOutline,
  giftOutline,
  homeOutline,
  medicalOutline,
  personCircle,
  qrCodeOutline,
  schoolOutline,
  shirtOutline,
  walletOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { categoria, gastos } from '../../models/gasto.model';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-nuevo-gasto',
  templateUrl: './nuevo-gasto.page.html',
  styleUrls: ['./nuevo-gasto.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, IonDatetime, IonModal,
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
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class NuevoGastoPage implements OnInit {
  guardando = false;
  isLoadingCategorias = false;
  errorMessage: string | null = null;
  private readonly todayValue = new Date().toISOString().split('T')[0];
  private editId: number | null = null;
  categoriasDisponibles: categoria[] = [];
  private gastoEnEdicion: gastos | null = null;

  isNuevaCategoriaModalOpen = false;
  guardandoCategoria = false;
  errorNuevaCategoria: string | null = null;
  nuevaCategoria = {
    nombre: '',
    color: '#3b82f6',
    icono: 'cart-outline',
  };

  readonly iconosDisponibles: string[] = [
    'cart-outline',
    'cafe-outline',
    'fast-food-outline',
    'car-outline',
    'bus-outline',
    'game-controller-outline',
    'film-outline',
    'medical-outline',
    'fitness-outline',
    'school-outline',
    'home-outline',
    'shirt-outline',
    'gift-outline',
    'wallet-outline',
    'airplane-outline',
    'build-outline',
  ];

  form = this.formBuilder.group({
    concepto: ['', [Validators.required, Validators.minLength(3)]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    fecha_gasto: [this.todayValue, [Validators.required]],
    categoria_id: [0, [Validators.required, Validators.min(1)]],
    metodo_pago: ['', [Validators.required]],
    notas: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor(
    private formBuilder: NonNullableFormBuilder,
    private gastosService: GastosService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({
      personCircle,
      calendarOutline,
      qrCodeOutline,
      arrowBackOutline,
      addCircleOutline,
      closeOutline,
      cartOutline,
      cafeOutline,
      fastFoodOutline,
      carOutline,
      busOutline,
      gameControllerOutline,
      filmOutline,
      medicalOutline,
      fitnessOutline,
      schoolOutline,
      homeOutline,
      shirtOutline,
      giftOutline,
      walletOutline,
      airplaneOutline,
      buildOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as {
      gasto?: gastos;
    };

    if (state?.gasto) {
      this.editId = state.gasto.id;
      this.gastoEnEdicion = state.gasto;
    }

    await this.loadCategorias();
    this.applyEditData();
  }

  async loadCategorias(): Promise<void> {
    this.isLoadingCategorias = true;
    const { data, error } = await this.gastosService.getCategorias();
    this.isLoadingCategorias = false;

    if (error) {
      this.errorMessage = error;
      return;
    }

    this.categoriasDisponibles = data;

    if (this.form.controls.categoria_id.value === 0 && this.categoriasDisponibles.length > 0) {
      this.form.controls.categoria_id.setValue(this.categoriasDisponibles[0].id);
    }
  }

  private applyEditData(): void {
    if (!this.gastoEnEdicion) {
      return;
    }

    this.form.setValue({
      concepto: this.gastoEnEdicion.concepto ?? '',
      monto: Number(this.gastoEnEdicion.monto ?? 0),
      fecha_gasto: this.gastoEnEdicion.fecha_gasto ?? this.todayValue,
      categoria_id: this.resolveCategoriaId(this.gastoEnEdicion),
      metodo_pago: this.gastoEnEdicion.metodo_pago ?? 'Efectivo',
      notas: this.gastoEnEdicion.notas ?? '',
    });
  }

  private resolveCategoriaId(gasto: gastos): number {
    if (gasto.categoria_id) {
      return gasto.categoria_id;
    }

    const nombre = gasto.categorias?.nombre ?? gasto.categoria ?? '';
    const match = this.categoriasDisponibles.find(
      (item) => item.nombre.toLowerCase() === nombre.toLowerCase()
    );

    return match?.id ?? (this.categoriasDisponibles[0]?.id ?? 0);
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
    const categoria_id = Number(payload.categoria_id);
    const metodo = payload.metodo_pago;

    const { error } = this.editId
      ? await this.gastosService.updateGasto(this.editId, {
          concepto,
          monto,
          fecha_gasto: fecha,
          categoria_id,
          metodo_pago: metodo,
          notas,
        })
      : await this.gastosService.addGasto({
          concepto,
          monto,
          fecha_gasto: fecha,
          categoria_id,
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

  abrirNuevaCategoriaModal(): void {
    this.errorNuevaCategoria = null;
    this.nuevaCategoria = {
      nombre: '',
      color: '#3b82f6',
      icono: 'cart-outline',
    };
    this.isNuevaCategoriaModalOpen = true;
  }

  cerrarNuevaCategoriaModal(): void {
    if (this.guardandoCategoria) {
      return;
    }
    this.isNuevaCategoriaModalOpen = false;
  }

  seleccionarIconoCategoria(icono: string): void {
    this.nuevaCategoria.icono = icono;
  }

  esIconoSeleccionado(icono: string): boolean {
    return this.nuevaCategoria.icono === icono;
  }

  async guardarNuevaCategoria(): Promise<void> {
    const nombre = this.nuevaCategoria.nombre.trim();

    if (!nombre || !this.nuevaCategoria.icono || this.guardandoCategoria) {
      return;
    }

    this.guardandoCategoria = true;
    this.errorNuevaCategoria = null;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('categorias')
      .insert({
        nombre,
        color: this.nuevaCategoria.color,
        icono: this.nuevaCategoria.icono,
      })
      .select('id')
      .single();

    if (error) {
      this.errorNuevaCategoria = error.message;
      this.guardandoCategoria = false;
      return;
    }

    await this.loadCategorias();

    if (data?.id) {
      this.form.controls.categoria_id.setValue(Number(data.id));
      this.form.controls.categoria_id.markAsTouched();
    }

    this.guardandoCategoria = false;
    this.isNuevaCategoriaModalOpen = false;
  }

}
