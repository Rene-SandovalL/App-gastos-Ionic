import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonProgressBar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle,
  trendingUp,
  notificationsOutline,
  restaurantOutline,
  wifiOutline,
  cartOutline,
  carOutline,
  medkitOutline,
} from 'ionicons/icons';
import { GastosService } from '../../services/gastos.service';
import { gastos } from '../../models/gasto.model';

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
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonProgressBar,
    IonSpinner,
    CommonModule,
  ]
})
export class Tab4Page implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  totalMes = 0;
  totalCount = 0;
  donutGradient = 'conic-gradient(#e0e0e0 0deg 360deg)';
  topCategoryLabel = 'Sin datos';
  topCategoryPercent = 0;
  topCategoryColor = '#757575';
  categoryBreakdown: Array<{
    label: string;
    amount: number;
    percent: number;
    color: string;
    icon: string;
    cssClass: string;
  }> = [];

  private readonly categoryConfig = [
    { key: 'Servicio', label: 'Servicios', color: '#d32f2f', icon: 'wifi-outline', cssClass: 'servicios' },
    { key: 'Comida', label: 'Comida', color: '#f57c00', icon: 'restaurant-outline', cssClass: 'comida' },
    { key: 'Salud', label: 'Salud', color: '#388e3c', icon: 'medkit-outline', cssClass: 'salud' },
    { key: 'Otros', label: 'Otros', color: '#757575', icon: 'cart-outline', cssClass: 'otros' },
    { key: 'Transporte', label: 'Transporte', color: '#1976d2', icon: 'car-outline', cssClass: 'transporte' },
  ];

  constructor(private gastosService: GastosService) {
    addIcons({
      personCircle,
      trendingUp,
      notificationsOutline,
      restaurantOutline,
      wifiOutline,
      cartOutline,
      carOutline,
      medkitOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadResumen();
  }

  async loadResumen(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    const { fechaInicio, fechaFin } = this.getMesActualRango();
    const gastosMes = await this.fetchGastosMes(fechaInicio, fechaFin);

    this.totalCount = gastosMes.length;
    this.totalMes = gastosMes.reduce((acc, gasto) => acc + Number(gasto.monto || 0), 0);
    this.buildCategoryStats(gastosMes);

    this.isLoading = false;
  }

  private async fetchGastosMes(fechaInicio: string, fechaFin: string): Promise<gastos[]> {
    const pageSize = 200;
    let offset = 0;
    const results: gastos[] = [];

    while (true) {
      const { data, error } = await this.gastosService.getGastos({
        limit: pageSize,
        offset,
        fechaInicio,
        fechaFin,
      });

      if (error) {
        this.errorMessage = error;
        return [];
      }

      results.push(...data);
      if (data.length < pageSize) {
        break;
      }
      offset += data.length;
    }

    return results;
  }

  private buildCategoryStats(items: gastos[]): void {
    const totals = new Map<string, number>();
    this.categoryConfig.forEach((category) => totals.set(category.key, 0));

    items.forEach((gasto) => {
      const key = this.normalizeCategory(gasto.categoria);
      totals.set(key, (totals.get(key) ?? 0) + Number(gasto.monto || 0));
    });

    const total = this.totalMes || 0;
    this.categoryBreakdown = this.categoryConfig.map((category) => {
      const amount = totals.get(category.key) ?? 0;
      const percent = total > 0 ? (amount / total) * 100 : 0;
      return {
        label: category.label,
        amount,
        percent,
        color: category.color,
        icon: category.icon,
        cssClass: category.cssClass,
      };
    });

    this.donutGradient = this.buildDonutGradient(this.categoryBreakdown);
    this.updateTopCategory();
  }

  private updateTopCategory(): void {
    if (this.categoryBreakdown.length === 0 || this.totalMes === 0) {
      this.topCategoryLabel = 'Sin datos';
      this.topCategoryPercent = 0;
      this.topCategoryColor = '#757575';
      return;
    }

    const top = [...this.categoryBreakdown].sort((a, b) => b.amount - a.amount)[0];
    this.topCategoryLabel = top.label;
    this.topCategoryPercent = top.percent;
    this.topCategoryColor = top.color;
  }

  private buildDonutGradient(breakdown: Array<{ percent: number; color: string }>): string {
    if (!this.totalMes) {
      return 'conic-gradient(#e0e0e0 0deg 360deg)';
    }

    let currentDeg = 0;
    const segments = breakdown.map((item) => {
      const start = currentDeg;
      const sweep = (item.percent / 100) * 360;
      currentDeg += sweep;
      return `${item.color} ${start.toFixed(2)}deg ${currentDeg.toFixed(2)}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  private normalizeCategory(categoria: string | null): string {
    if (!categoria) {
      return 'Otros';
    }

    const trimmed = categoria.trim();
    if (trimmed.toLowerCase() === 'servicios') {
      return 'Servicio';
    }

    const match = this.categoryConfig.find((item) => item.label.toLowerCase() === trimmed.toLowerCase());
    return match ? match.key : 'Otros';
  }

  private getMesActualRango(): { fechaInicio: string; fechaFin: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      fechaInicio: start.toISOString().split('T')[0],
      fechaFin: end.toISOString().split('T')[0],
    };
  }
}
