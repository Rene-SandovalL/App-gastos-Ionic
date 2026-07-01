import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonItem, IonLabel, IonIcon, IonProgressBar, IonSpinner, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUpOutline, personOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FamiliaService, Integrante } from '../../services/familia.service';
import { GastosService } from '../../services/gastos.service';
import { categoria, gastos } from '../../models/gasto.model';

export interface CategoriaResumen {
  label: string;
  amount: number;
  percent: number;
  icon: string;
  color: string;
}

export interface IntegranteResumen extends Integrante {
  total: number;
}

@Component({
  selector: 'app-resumen-familia',
  templateUrl: './resumen-familia.page.html',
  styleUrls: ['./resumen-familia.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonItem, IonLabel, IonIcon, IonProgressBar, IonSpinner, IonList,
    CommonModule
  ]
})
export class ResumenFamiliaPage implements OnInit {

  isLoading = true;
  totalMes = 0;
  totalCount = 0;
  donutGradient = 'conic-gradient(#e0e0e0 0deg 360deg)';
  topCategoryLabel = '—';
  topCategoryPercent = 0;
  categoryBreakdown: CategoriaResumen[] = [];
  integrantesResumen: IntegranteResumen[] = [];

  constructor(
    private authService: AuthService,
    private familiaService: FamiliaService,
    private gastosService: GastosService
  ) {
    addIcons({ trendingUpOutline, personOutline, arrowBackOutline });
  }

  async ngOnInit() {
    const user = await this.authService.getSession().then(r => r.session?.user);
    if (!user) { this.isLoading = false; return; }

    const { data: miembro } = await this.familiaService.getMiembroConFamilia(user.id);
    if (!miembro?.familia_id) { this.isLoading = false; return; }

    await this.familiaService.syncCategoriasFamilia(miembro.familia_id);

    // Rango del mes actual
    const now = new Date();
    const fechaInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const fechaFin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    // Obtener integrantes
    const { data: integrantes } = await this.familiaService.getMiembrosDeFamilia(miembro.familia_id);

    // Traer todos los gastos familiares en una sola consulta (mejor rendimiento y total conjunto real)
    const { data: todosGastos } = await this.gastosService.getGastosFamilia({
      familiaId: miembro.familia_id,
      fechaInicio,
      fechaFin,
    });

    // Agregar totales por integrante desde el conjunto familiar
    const totalesPorUser = new Map<string, number>();
    for (const g of todosGastos) {
      const prev = totalesPorUser.get(g.user_id) ?? 0;
      totalesPorUser.set(g.user_id, prev + g.monto);
    }

    this.integrantesResumen = integrantes.map((integrante) => ({
      ...integrante,
      total: totalesPorUser.get(integrante.user_id) ?? 0,
    }));
    this.totalCount = todosGastos.length;
    this.totalMes = todosGastos.reduce((s, g) => s + g.monto, 0);

    // Agrupar por categoría
    const porCategoria = new Map<string, { amount: number; cat: categoria | null }>();
    for (const g of todosGastos) {
      const key = g.categorias?.nombre ?? 'Sin categoría';
      const prev = porCategoria.get(key) ?? { amount: 0, cat: g.categorias ?? null };
      prev.amount += g.monto;
      prev.cat = g.categorias ?? prev.cat;
      porCategoria.set(key, prev);
    }

    this.categoryBreakdown = Array.from(porCategoria.entries())
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([label, { amount, cat }]) => ({
        label,
        amount,
        percent: this.totalMes > 0 ? Math.round((amount / this.totalMes) * 100) : 0,
        icon: cat?.icono ?? 'cart-outline',
        color: cat?.color ?? '#9ca3af',
      }));

    if (this.categoryBreakdown.length > 0) {
      this.topCategoryLabel = this.categoryBreakdown[0].label;
      this.topCategoryPercent = this.categoryBreakdown[0].percent;
      this.donutGradient = this.buildDonut(this.categoryBreakdown);
    }

    this.isLoading = false;
  }

  private buildDonut(cats: CategoriaResumen[]): string {
    let deg = 0;
    const stops = cats.map(c => {
      const end = deg + (c.percent / 100) * 360;
      const stop = `${c.color} ${deg}deg ${end}deg`;
      deg = end;
      return stop;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }
}
