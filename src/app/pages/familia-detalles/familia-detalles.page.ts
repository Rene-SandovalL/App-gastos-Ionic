import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareOutline, copyOutline, peopleCircleOutline, chevronForwardOutline, shieldCheckmarkOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FamiliaService, MiembroFamilia } from '../../services/familia.service';

@Component({
  selector: 'app-familia-detalles',
  templateUrl: './familia-detalles.page.html',
  styleUrls: ['./familia-detalles.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonSpinner, IonModal,
    CommonModule, FormsModule
  ]
})
export class FamiliaDetallesPage implements OnInit {

  miembro: MiembroFamilia | null = null;
  isLoading: boolean = true;
  modalInvitarAbierto: boolean = false;
  copiado: boolean = false;

  constructor(
    private authService: AuthService,
    private familiaService: FamiliaService
  ) {
    addIcons({peopleCircleOutline,shareOutline,chevronForwardOutline,copyOutline,shieldCheckmarkOutline,personOutline});
  }

  async ngOnInit() {
    const user = await this.authService.getSession().then(r => r.session?.user);
    if (user) {
      const { data } = await this.familiaService.getMiembroConFamilia(user.id);
      this.miembro = data;
    }
    this.isLoading = false;
  }

  get familia() {
    return this.miembro?.familias ?? null;
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
