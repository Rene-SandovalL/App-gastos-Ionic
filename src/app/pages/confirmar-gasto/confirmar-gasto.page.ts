import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonChip,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personCircle,
  notificationsOutline,
  sparkles,
  eyeOutline,
  storefrontOutline,
  bagHandleOutline,
  calendarOutline,
  cashOutline,
  documentTextOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { GastosService } from '../../services/gastos.service';
import { categoria } from '../../models/gasto.model';

@Component({
  selector: 'app-confirmar-gasto',
  templateUrl: './confirmar-gasto.page.html',
  styleUrls: ['./confirmar-gasto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonChip,
    IonLabel,
    IonSpinner,
  ],
})
export class ConfirmarGastoPage implements OnInit {
  foto: string | null = null;
  monto = 0;
  establecimiento = '';
  concepto = '';
  fecha = '';
  categoria = 'Otros';
  categoriaId: number | null = null;
  metodo_pago = 'Efectivo';
  notas = 'Escaneado desde ticket';
  categoriasDisponibles: categoria[] = [];

  guardando = false;
  errorMessage: string | null = null;

  constructor(private router: Router, private gastosService: GastosService) {
    addIcons({
      personCircle,
      notificationsOutline,
      sparkles,
      eyeOutline,
      storefrontOutline,
      bagHandleOutline,
      calendarOutline,
      cashOutline,
      documentTextOutline,
      restaurantOutline,
    });
  }

  ngOnInit(): void {
    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as {
      foto?: string;
      monto?: number;
      establecimiento?: string;
      concepto?: string;
      fecha?: string;
      categoria?: string;
    };

    this.foto = state.foto ?? null;
    this.monto = Number(state.monto ?? 0);
    this.establecimiento = state.establecimiento ?? '';
    this.concepto = state.concepto ?? '';
    this.fecha = state.fecha ?? new Date().toISOString().split('T')[0];
    this.categoria = this.normalizeCategoria(state.categoria ?? 'Otros');

    this.loadCategorias();
  }

  private async loadCategorias(): Promise<void> {
    const { data, error } = await this.gastosService.getCategorias();
    if (error) {
      this.errorMessage = error;
      return;
    }

    this.categoriasDisponibles = data;
    const match = this.categoriasDisponibles.find(
      (item) => item.nombre.toLowerCase() === this.categoria.toLowerCase()
    );
    this.categoriaId = match?.id ?? this.categoriasDisponibles[0]?.id ?? null;
  }

  async guardar(): Promise<void> {
    if (this.guardando) {
      return;
    }

    this.guardando = true;
    this.errorMessage = null;

    if (!this.categoriaId) {
      this.errorMessage = 'No se encontro una categoría válida.';
      this.guardando = false;
      return;
    }

    const conceptoFinal = this.buildConcepto();
    const { error } = await this.gastosService.addGasto({
      concepto: conceptoFinal,
      monto: Number(this.monto),
      fecha_gasto: this.fecha,
      categoria_id: this.categoriaId,
      metodo_pago: this.metodo_pago,
      notas: this.notas,
    });

    if (error) {
      this.errorMessage = error;
      this.guardando = false;
      return;
    }

    this.guardando = false;
    this.router.navigate(['/tabs/tab2']);
  }

  private buildConcepto(): string {
    const establecimiento = this.establecimiento.trim();
    const concepto = this.concepto.trim();

    if (establecimiento && concepto) {
      return `${establecimiento} - ${concepto}`;
    }

    return establecimiento || concepto || 'Gasto';
  }

  private normalizeCategoria(value: string): string {
    const allowed = ['Comida', 'Servicios', 'Transporte', 'Salud', 'Otros'];
    const match = allowed.find((item) => item.toLowerCase() === value.toLowerCase());
    return match ?? 'Otros';
  }
}
