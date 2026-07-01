import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shareOutline,
  copyOutline,
  peopleCircleOutline,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  personOutline,
  barChartOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FamiliaService, MiembroFamilia, Integrante } from '../../services/familia.service';

@Component({
  selector: 'app-familia-detalles',
  templateUrl: './familia-detalles.page.html',
  styleUrls: ['./familia-detalles.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonModal,
    CommonModule,
    FormsModule,
  ],
})
export class FamiliaDetallesPage implements OnInit {
  miembro: MiembroFamilia | null = null;
  integrantes: Integrante[] = [];
  isLoading = true;
  modalInvitarAbierto = false;
  copiado = false;

  constructor(
    private authService: AuthService,
    private familiaService: FamiliaService,
    private router: Router
  ) {
    addIcons({
      peopleCircleOutline,
      shareOutline,
      chevronForwardOutline,
      copyOutline,
      shieldCheckmarkOutline,
      personOutline,
      barChartOutline,
    });
  }

  async ngOnInit() {
    const user = await this.authService.getSession().then((r) => r.session?.user);
    if (user) {
      const { data } = await this.familiaService.getMiembroConFamilia(user.id);
      this.miembro = data;

      if (data?.familia_id) {
        await this.familiaService.syncCategoriasFamilia(data.familia_id);
        const { data: miembros } = await this.familiaService.getMiembrosDeFamilia(data.familia_id);
        this.integrantes = miembros;
      }
    }
    this.isLoading = false;
  }

  get familia() {
    return this.miembro?.familias ?? null;
  }

  irAResumen() {
    this.router.navigate(['/resumen-familia']);
  }

  irAGastosIntegrante(userId: string) {
    this.router.navigate(['/gastos-integrante', userId]);
  }

  async copiarCodigo() {
    const codigo = this.familia?.codigo_invitacion ?? '';
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      const el = document.createElement('textarea');
      el.value = codigo;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    this.copiado = true;
    setTimeout(() => (this.copiado = false), 2500);
  }
}
