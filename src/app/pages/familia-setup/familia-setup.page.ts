import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonInput, IonSpinner,
  IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, keyOutline, peopleOutline, chevronForwardOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FamiliaService } from '../../services/familia.service';

@Component({
  selector: 'app-familia-setup',
  templateUrl: './familia-setup.page.html',
  styleUrls: ['./familia-setup.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonInput, IonSpinner,
    IonToast,
    CommonModule, FormsModule
  ]
})
export class FamiliaSetupPage implements OnInit {

  // Vista activa: 'opciones' | 'crear' | 'unirse'
  vista: 'opciones' | 'crear' | 'unirse' = 'opciones';

  nombreFamilia: string = '';
  codigoInvitacion: string = '';

  isLoading: boolean = false;

  toastMensaje: string = '';
  toastColor: 'danger' | 'success' = 'danger';
  mostrarToast: boolean = false;

  private userId: string = '';

  constructor(
    private authService: AuthService,
    private familiaService: FamiliaService,
    private router: Router
  ) {
    addIcons({peopleOutline,addCircleOutline,chevronForwardOutline,keyOutline});
  }

  async ngOnInit() {
    const user = await this.authService.getSession().then(r => r.session?.user);
    this.userId = user?.id ?? '';
  }

  async onCrearFamilia() {
    if (!this.nombreFamilia.trim()) {
      this.mostrarError('El nombre de la familia no puede estar vacío.');
      return;
    }
    this.isLoading = true;
    const { error } = await this.familiaService.crearFamilia(this.nombreFamilia, this.userId);
    this.isLoading = false;

    if (error) {
      this.mostrarError(error);
    } else {
      this.router.navigate(['/familia-detalles'], { replaceUrl: true });
    }
  }

  async onUnirseAFamilia() {
    if (!this.codigoInvitacion.trim()) {
      this.mostrarError('Introduce el código de invitación.');
      return;
    }
    this.isLoading = true;
    const { error } = await this.familiaService.unirseAFamilia(this.codigoInvitacion, this.userId);
    this.isLoading = false;

    if (error) {
      this.mostrarError(error);
    } else {
      this.router.navigate(['/familia-detalles'], { replaceUrl: true });
    }
  }

  private mostrarError(mensaje: string) {
    this.toastMensaje = mensaje;
    this.toastColor = 'danger';
    this.mostrarToast = true;
  }
}

