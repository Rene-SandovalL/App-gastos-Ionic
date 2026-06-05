import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonModal,
  IonDatetime,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  pencilOutline,
  trashOutline,
  ellipsisVertical,
  search,
  personCircle,
  add,
  medkitOutline,
  carOutline,
  wifiOutline,
  cafeOutline,
  cartOutline,
  calendarOutline,
  receiptOutline,
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { gastos } from '../../models/gasto.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonModal,
    IonDatetime,
    IonSpinner,
    IonToast,
    RouterLink
  ]
})
export class Tab2Page implements OnInit {
  gastos: gastos[] = [];
  isLoading = false;
  isLoadingMore = false;
  reachedEnd = false;
  pageSize = 12;
  offset = 0;

  filters = ['Todos', 'Comida', 'Salud', 'Transporte', 'Servicio'];
  activeFilter = 'Todos';

  isDateModalOpen = false;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  searchValue = '';
  private searchDebounceId?: number;
  activeCardId: number | null = null;
  isToastOpen = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' = 'success';

  constructor(
    private gastosService: GastosService,
    private router: Router
  ) {
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
      cafeOutline,
      cartOutline,
      calendarOutline,
      receiptOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadGastos(true);
  }

  async loadGastos(reset: boolean): Promise<void> {
    if (this.isLoading || this.isLoadingMore) {
      return;
    }

    if (reset) {
      this.offset = 0;
      this.reachedEnd = false;
      this.gastos = [];
    }

    this.isLoading = reset;
    this.isLoadingMore = !reset;

    const { data, error } = await this.gastosService.getGastos({
      limit: this.pageSize,
      offset: this.offset,
      categoria: this.activeFilter === 'Todos' ? null : this.activeFilter,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      searchTerm: this.searchValue.trim() ? this.searchValue.trim() : null,
    });

    if (!error) {
      this.gastos = reset ? data : [...this.gastos, ...data];
      this.offset += data.length;
      if (data.length < this.pageSize) {
        this.reachedEnd = true;
      }
    }

    this.isLoading = false;
    this.isLoadingMore = false;
  }

  async loadMore(event: CustomEvent): Promise<void> {
    if (this.reachedEnd) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    await this.loadGastos(false);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  }

  async setFilter(filter: string): Promise<void> {
    this.activeFilter = filter;
    await this.loadGastos(true);
  }

  onSearchChange(event: CustomEvent): void {
    const value = (event.detail as { value?: string | null }).value ?? '';
    this.searchValue = value;

    if (this.searchDebounceId) {
      window.clearTimeout(this.searchDebounceId);
    }

    this.searchDebounceId = window.setTimeout(() => {
      this.loadGastos(true);
    }, 300);
  }

  openDateModal(): void {
    this.isDateModalOpen = true;
  }

  closeDateModal(): void {
    this.isDateModalOpen = false;
  }

  async applyDateRange(): Promise<void> {
    this.closeDateModal();
    await this.loadGastos(true);
  }

  clearDateRange(): void {
    this.fechaInicio = null;
    this.fechaFin = null;
  }

  onFechaInicioChange(value: string | string[] | null | undefined): void {
    if (typeof value === 'string') {
      this.fechaInicio = this.normalizeDateValue(value);
    }
  }

  onFechaFinChange(value: string | string[] | null | undefined): void {
    if (typeof value === 'string') {
      this.fechaFin = this.normalizeDateValue(value);
    }
  }

  normalizeDateValue(value: string): string {
    return value.split('T')[0];
  }

  trackByGastoId(index: number, gasto: gastos): number {
    return gasto.id;
  }

  getCategoryClass(categoria: string | null): string {
    const normalized = this.normalizeCategoria(categoria);

    switch (normalized) {
      case 'Comida':
        return 'comida';
      case 'Salud':
        return 'salud';
      case 'Transporte':
        return 'transporte';
      case 'Servicio':
        return 'servicio';
      default:
        return 'otros';
    }
  }

  getCategoryIcon(categoria: string | null): string {
    const normalized = this.normalizeCategoria(categoria);

    switch (normalized) {
      case 'Comida':
        return 'cafe-outline';
      case 'Salud':
        return 'medkit-outline';
      case 'Transporte':
        return 'car-outline';
      case 'Servicio':
        return 'wifi-outline';
      default:
        return 'cart-outline';
    }
  }

  normalizeCategoria(categoria: string | null): string {
    if (!categoria) {
      return 'Otros';
    }

    const trimmed = categoria.trim();

    if (trimmed.toLowerCase() === 'servicios') {
      return 'Servicio';
    }

    return trimmed;
  }

  getCategoryLabel(categoria: string | null): string {
    const normalized = this.normalizeCategoria(categoria);
    return normalized === 'Otros' ? 'Otros' : normalized;
  }

  toggleActions(gastoId: number): void {
    this.activeCardId = this.activeCardId === gastoId ? null : gastoId;
  }

  editarGasto(gasto: gastos): void {
    this.router.navigate(['/tabs/nuevo-gasto'], {
      state: { gasto },
    });
  }

  async eliminarGasto(gastoId: number): Promise<void> {
    const { error } = await this.gastosService.deleteGasto(gastoId);

    if (error) {
      this.presentToast('No se pudo borrar el gasto.', 'danger');
      return;
    }

    this.gastos = this.gastos.filter((item) => item.id !== gastoId);
    this.activeCardId = null;
    this.presentToast('Gasto eliminado.', 'success');
  }

  presentToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.isToastOpen = true;
  }

  setToastOpen(value: boolean): void {
    this.isToastOpen = value;
  }


}
