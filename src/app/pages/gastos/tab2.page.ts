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
  airplaneOutline,
  buildOutline,
  busOutline,
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
  fastFoodOutline,
  filmOutline,
  fitnessOutline,
  gameControllerOutline,
  giftOutline,
  homeOutline,
  cartOutline,
  schoolOutline,
  shirtOutline,
  walletOutline,
  calendarOutline,
  receiptOutline,
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { categoria, gastos } from '../../models/gasto.model';

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

  filters: string[] = ['Todos'];
  activeFilter = 'Todos';
  categoriasDisponibles: categoria[] = [];

  isDateModalOpen = false;
  fechaSeleccionada: string | null = null;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;

  isMonthModalOpen = false;
  selectedMonthValue: string | null = null;
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
      fastFoodOutline,
      busOutline,
      gameControllerOutline,
      filmOutline,
      fitnessOutline,
      schoolOutline,
      homeOutline,
      shirtOutline,
      giftOutline,
      walletOutline,
      airplaneOutline,
      buildOutline,
      cartOutline,
      calendarOutline,
      receiptOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.initializeCurrentMonthRange();
    await this.loadCategorias();
    await this.loadGastos(true);
  }

  private initializeCurrentMonthRange(): void {
    const today = new Date();
    this.applyMonthFromDate(today);
    this.selectedMonthValue = this.toMonthInputValue(today);
    this.fechaSeleccionada = null;
  }

  private applyMonthFromDate(date: Date): void {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.fechaInicio = this.toDateString(monthStart);
    this.fechaFin = this.toDateString(monthEnd);
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toMonthInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  async loadCategorias(): Promise<void> {
    const { data, error } = await this.gastosService.getCategorias();

    if (error) {
      return;
    }

    this.categoriasDisponibles = data;
    this.filters = ['Todos', ...data.map((item) => item.nombre)];

    if (this.activeFilter !== 'Todos' && !this.filters.includes(this.activeFilter)) {
      this.activeFilter = 'Todos';
    }
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
      categoriaId: this.getActiveFilterCategoriaId(),
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

  private getActiveFilterCategoriaId(): number | null {
    if (this.activeFilter === 'Todos') {
      return null;
    }

    const selected = this.categoriasDisponibles.find(
      (item) => item.nombre.toLowerCase() === this.activeFilter.toLowerCase()
    );

    return selected?.id ?? null;
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
    if (this.fechaSeleccionada) {
      const dia = this.normalizeDateValue(this.fechaSeleccionada);
      this.fechaInicio = dia;
      this.fechaFin = dia;
    }

    this.closeDateModal();
    await this.loadGastos(true);
  }

  clearDateRange(): void {
    this.fechaSeleccionada = null;
    const current = this.selectedMonthValue
      ? new Date(`${this.selectedMonthValue}-01T00:00:00`)
      : new Date();

    this.applyMonthFromDate(current);
    this.closeDateModal();
    this.loadGastos(true);
  }

  onFechaInicioChange(value: string | string[] | null | undefined): void {
    if (typeof value === 'string') {
      this.fechaSeleccionada = this.normalizeDateValue(value);
    }
  }

  onFechaFinChange(value: string | string[] | null | undefined): void {
    this.onFechaInicioChange(value);
  }

  openMonthModal(): void {
    this.isMonthModalOpen = true;
  }

  closeMonthModal(): void {
    this.isMonthModalOpen = false;
  }

  onMonthChange(value: string | string[] | null | undefined): void {
    if (typeof value !== 'string') {
      return;
    }

    const monthValue = value.slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(monthValue)) {
      this.selectedMonthValue = monthValue;
    }
  }

  async applySelectedMonth(): Promise<void> {
    if (!this.selectedMonthValue) {
      this.closeMonthModal();
      return;
    }

    const baseDate = new Date(`${this.selectedMonthValue}-01T00:00:00`);
    this.applyMonthFromDate(baseDate);
    this.fechaSeleccionada = null;

    this.closeMonthModal();
    await this.loadGastos(true);
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

  getCategoriaNombre(gasto: gastos): string | null {
    return gasto.categorias?.nombre ?? gasto.categoria;
  }

  getCategoriaIcono(gasto: gastos): string {
    return gasto.categorias?.icono ?? this.getCategoryIcon(this.getCategoriaNombre(gasto));
  }

  getCategoriaIconStyle(gasto: gastos): Record<string, string> | null {
    const color = gasto.categorias?.color;

    if (!color) {
      return null;
    }

    return {
      color,
      background: this.hexToRgba(color, 0.16),
    };
  }

  getCategoriaTagStyle(gasto: gastos): Record<string, string> | null {
    const color = gasto.categorias?.color;

    if (!color) {
      return null;
    }

    return {
      color,
      background: this.hexToRgba(color, 0.16),
    };
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '').trim();

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return `rgba(92, 102, 113, ${alpha})`;
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
