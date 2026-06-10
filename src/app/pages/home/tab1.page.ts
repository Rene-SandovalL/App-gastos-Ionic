import { Component, OnInit } from '@angular/core';
import {
  IonAvatar,
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
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  airplaneOutline,
  arrowUpOutline,
  buildOutline,
  busOutline,
  cafeOutline,
  calendarOutline,
  carOutline,
  cartOutline,
  chevronForward,
  fastFoodOutline,
  filmOutline,
  fitnessOutline,
  gameControllerOutline,
  giftOutline,
  homeOutline,
  schoolOutline,
  shirtOutline,
  notificationsOutline,
  personCircle,
  qrCodeOutline,
  receiptOutline,
  restaurantOutline,
  trendingUp,
  walletOutline,
  wifiOutline,
  medkitOutline,
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { GastosService } from '../../services/gastos.service';
import { gastos } from '../../models/gasto.model';
import { CommonModule, CurrencyPipe, NgStyle } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    CurrencyPipe,
    NgStyle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonAvatar,
    IonButton,
    IonButtons,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    RouterLink,
  ],
})
export class Tab1Page implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;

  totalMes = 0;
  totalHoy = 0;
  totalGastosMes = 0;
  topCategoryName = 'Sin datos';
  topCategoryColor = 'black';
  topCategoryIcon = 'restaurant-outline';

  gastosRecientes: gastos[] = [];

  constructor(
    private router: Router,
    private gastosService: GastosService
  ) {
    addIcons({
      add,
      airplaneOutline,
      arrowUpOutline,
      buildOutline,
      busOutline,
      cafeOutline,
      calendarOutline,
      carOutline,
      cartOutline,
      chevronForward,
      fastFoodOutline,
      filmOutline,
      fitnessOutline,
      gameControllerOutline,
      giftOutline,
      homeOutline,
      schoolOutline,
      shirtOutline,
      notificationsOutline,
      personCircle,
      qrCodeOutline,
      receiptOutline,
      restaurantOutline,
      trendingUp,
      walletOutline,
      wifiOutline,
      medkitOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadHomeData();
  }

  async loadHomeData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    const { inicioMes, finMes, hoy } = this.getDateRanges();
    const gastosMes = await this.fetchMonthExpenses(inicioMes, finMes);

    if (this.errorMessage) {
      this.isLoading = false;
      return;
    }

    this.totalMes = gastosMes.reduce((acc, gasto) => acc + Number(gasto.monto || 0), 0);
    this.totalGastosMes = gastosMes.length;
    this.totalHoy = gastosMes
      .filter((gasto) => this.onlyDate(gasto.fecha_gasto) === hoy)
      .reduce((acc, gasto) => acc + Number(gasto.monto || 0), 0);

    this.resolveTopCategory(gastosMes);
    this.gastosRecientes = [...gastosMes]
      .sort((a, b) => new Date(b.fecha_gasto).getTime() - new Date(a.fecha_gasto).getTime())
      .slice(0, 5);

    this.isLoading = false;
  }

  private async fetchMonthExpenses(inicioMes: string, finMes: string): Promise<gastos[]> {
    const pageSize = 200;
    let offset = 0;
    const result: gastos[] = [];

    while (true) {
      const { data, error } = await this.gastosService.getGastos({
        limit: pageSize,
        offset,
        fechaInicio: inicioMes,
        fechaFin: finMes,
      });

      if (error) {
        this.errorMessage = error;
        return [];
      }

      result.push(...data);

      if (data.length < pageSize) {
        break;
      }

      offset += data.length;
    }

    return result;
  }

  private resolveTopCategory(gastosMes: gastos[]): void {
    const totals = new Map<string, { amount: number; color: string; icon: string }>();

    gastosMes.forEach((gasto) => {
      const nombre = gasto.categorias?.nombre ?? gasto.categoria ?? 'Otros';
      const color = gasto.categorias?.color ?? '#5c6671';
      const icon = gasto.categorias?.icono ?? 'restaurant-outline';
      const key = nombre.trim();
      const current = totals.get(key);

      if (current) {
        current.amount += Number(gasto.monto || 0);
        if (current.icon === 'restaurant-outline' && gasto.categorias?.icono) {
          current.icon = gasto.categorias.icono;
        }
      } else {
        totals.set(key, { amount: Number(gasto.monto || 0), color, icon });
      }
    });

    if (totals.size === 0) {
      this.topCategoryName = 'Sin datos';
      this.topCategoryIcon = 'restaurant-outline';
      return;
    }

    const top = [...totals.entries()].sort((a, b) => b[1].amount - a[1].amount)[0];
    this.topCategoryName = top[0];
    this.topCategoryIcon = top[1].icon;
  }

  goToScan(): void {
    this.router.navigateByUrl('/tabs/tab3');
  }

  goToGastos(): void {
    this.router.navigateByUrl('/tabs/tab2');
  }

  getRecentIcon(gasto: gastos): string {
    return gasto.categorias?.icono ?? 'cart-outline';
  }

  getRecentIconStyle(gasto: gastos): Record<string, string> {
    const color = gasto.categorias?.color ?? '#5c6671';
    return {
      color,
      background: this.hexToRgba(color, 0.14),
    };
  }

  formatRecentDate(fecha: string): string {
    const date = new Date(fecha);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const time = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });

    if (sameDay(date, today)) {
      return `Hoy, ${time}`;
    }

    if (sameDay(date, yesterday)) {
      return `Ayer, ${time}`;
    }

    return `${date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}, ${time}`;
  }

  private getDateRanges(): { inicioMes: string; finMes: string; hoy: string } {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
    const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      inicioMes: inicio.toISOString().split('T')[0],
      finMes: fin.toISOString().split('T')[0],
      hoy: now.toISOString().split('T')[0],
    };
  }

  private onlyDate(value: string): string {
    return value.split('T')[0];
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');

    if (normalized.length !== 6) {
      return `rgba(92, 102, 113, ${alpha})`;
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

}
