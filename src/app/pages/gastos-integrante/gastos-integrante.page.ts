import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonLabel, IonIcon, IonList, IonItem, IonNote, IonSpinner, IonButton,
  IonModal, IonDatetime
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { calendarOutline, cartOutline, chevronDownOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FamiliaService } from '../../services/familia.service';
import { GastosService } from '../../services/gastos.service';
import { gastos, categoria } from '../../models/gasto.model';

@Component({
  selector: 'app-gastos-integrante',
  templateUrl: './gastos-integrante.page.html',
  styleUrls: ['./gastos-integrante.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonLabel, IonIcon, IonList, IonItem, IonNote, IonSpinner, IonButton,
    IonModal, IonDatetime,
    CommonModule, FormsModule
  ]
})
export class GastosIntegrantePage implements OnInit {

  integranteUserId: string = '';
  familiaId: string = '';
  integranteNombre: string = 'Integrante';
  integranteAvatar: string | null = null;
  integranteIniciales: string = '??';

  // Filtro de mes: formato YYYY-MM
  mesSeleccionado: string = '';
  mesLabel: string = '';
  modalFechaAbierto: boolean = false;
  monthPickerValue: string | null = null;

  // Filtro de categoría por nombre (evita mismatch de IDs entre miembros)
  filtrosCategoria: string[] = ['Todos'];
  categoriaActiva: string = 'Todos';
  categorias: categoria[] = [];

  isLoading = false;
  gastosFiltrados: gastos[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private familiaService: FamiliaService,
    private gastosService: GastosService
  ) {
    addIcons({ calendarOutline, cartOutline, chevronDownOutline });
  }

  async ngOnInit() {
    this.integranteUserId = this.route.snapshot.paramMap.get('id') ?? '';

    // Cargar categorías y sesión en paralelo para reducir espera inicial
    const [catsRes, userRes] = await Promise.all([
      this.gastosService.getCategorias(),
      this.authService.getSession(),
    ]);
    this.categorias = catsRes.data;
    const nombresUnicos = Array.from(
      new Set(
        this.categorias
          .map((c) => c.nombre?.trim())
          .filter((v): v is string => Boolean(v))
      )
    );
    this.filtrosCategoria = ['Todos', ...nombresUnicos];

    // Por defecto al entrar: mes actual seleccionado y visible
    const now = new Date();
    this.mesSeleccionado = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.monthPickerValue = `${this.mesSeleccionado}-01T00:00:00`;
    this.actualizarMesLabel();

    // Resolver nombre/avatar del integrante desde la familia
    const user = userRes.session?.user;
    if (user) {
      const { data: miembro } = await this.familiaService.getMiembroConFamilia(user.id);
      if (miembro?.familia_id) {
        this.familiaId = miembro.familia_id;
        await this.familiaService.syncCategoriasFamilia(this.familiaId);
        const { data: integrantes } = await this.familiaService.getMiembrosDeFamilia(miembro.familia_id);
        const encontrado = integrantes.find(i => i.user_id === this.integranteUserId);
        if (encontrado) {
          this.integranteNombre   = encontrado.nombre;
          this.integranteAvatar   = encontrado.avatar_url;
          this.integranteIniciales = encontrado.iniciales;
        }
      }
    }

    await this.cargarGastos();
  }

  async ionViewWillEnter(): Promise<void> {
    if (!this.integranteUserId) {
      return;
    }
    await this.cargarGastos();
  }

  async cargarGastos() {
    if (!this.integranteUserId || !this.mesSeleccionado || !this.familiaId) {
      this.gastosFiltrados = [];
      return;
    }
    this.isLoading = true;

    const [year, month] = this.mesSeleccionado.split('-').map(Number);
    const fechaInicio = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const fechaFin = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data } = await this.gastosService.getGastosIntegranteFamilia({
      familiaId: this.familiaId,
      integranteUserId: this.integranteUserId,
      fechaInicio,
      fechaFin,
      categoriaId: null,
    });

    this.gastosFiltrados = this.categoriaActiva === 'Todos'
      ? data
      : data.filter((g) =>
          (g.categorias?.nombre ?? '').trim().toLowerCase() ===
          this.categoriaActiva.trim().toLowerCase()
        );
    this.isLoading = false;
  }

  async setFiltroCategoria(filtro: string): Promise<void> {
    this.categoriaActiva = filtro;
    await this.cargarGastos();
  }

  openMonthModal(): void {
    this.monthPickerValue = `${this.mesSeleccionado}-01T00:00:00`;
    this.modalFechaAbierto = true;
  }

  closeMonthModal(): void {
    this.modalFechaAbierto = false;
  }

  onMonthChange(value: string | string[] | null | undefined): void {
    if (typeof value !== 'string') {
      return;
    }
    this.monthPickerValue = value;
  }

  async applySelectedMonth(): Promise<void> {
    if (!this.monthPickerValue) {
      this.closeMonthModal();
      return;
    }

    const monthValue = this.monthPickerValue.slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(monthValue)) {
      this.mesSeleccionado = monthValue;
      this.actualizarMesLabel();
    }

    this.closeMonthModal();
    await this.cargarGastos();
  }

  private actualizarMesLabel() {
    const [year, month] = this.mesSeleccionado.split('-').map(Number);
    const fecha = new Date(year, month - 1, 1);
    this.mesLabel = fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  get totalFiltrado(): number {
    return this.gastosFiltrados.reduce((s, g) => s + g.monto, 0);
  }

  // Valor ISO para el ion-datetime (primer día del mes seleccionado)
  get fechaISO(): string {
    return `${this.mesSeleccionado}-01T00:00:00`;
  }

}
