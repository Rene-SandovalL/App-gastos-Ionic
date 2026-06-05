import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonLabel,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  cameraOutline,
  imageOutline,
  trashOutline,
  sparkles,
} from 'ionicons/icons';
import { GeminiService } from '../../services/gemini.service';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonLabel,
    IonIcon,
    IonSpinner,
    CommonModule,
  ],
})
export class Tab3Page {
  constructor(
    private router: Router,
    private geminiService: GeminiService
  ) {
    addIcons({ cameraOutline, imageOutline, trashOutline, sparkles });
  }

  finalPhoto: string | null = null;
  photoBase64: string | null = null;
  isAnalyzing = false;
  errorMessage: string | null = null;

  async takePhoto(): Promise<void> {
    await this.capturePhoto(CameraSource.Camera);
  }

  async openGallery(): Promise<void> {
    await this.capturePhoto(CameraSource.Photos);
  }

  async capturePhoto(source: CameraSource): Promise<void> {
    this.errorMessage = null;
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source,
        allowEditing: false,
      });

      if (!photo.base64String) {
        this.errorMessage = 'No se pudo obtener la imagen.';
        return;
      }

      this.photoBase64 = photo.base64String;
      this.finalPhoto = `data:image/jpeg;base64,${photo.base64String}`;
    } catch (error) {
      this.errorMessage = 'No se pudo abrir la cámara o la galería.';
    }
  }

  clearPhoto(): void {
    this.finalPhoto = null;
    this.photoBase64 = null;
    this.errorMessage = null;
  }

  async analyzeTicket(): Promise<void> {
    if (!this.photoBase64 || this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = null;

    const { data, error } = await this.geminiService.analyzeTicket(this.photoBase64);

    if (error || !data) {
      this.errorMessage = error ?? 'No se pudo analizar el ticket.';
      this.isAnalyzing = false;
      return;
    }

    this.isAnalyzing = false;
    this.router.navigate(['/tabs/confirmar-gasto'], {
      state: {
        foto: this.finalPhoto,
        ...data,
      },
    });
  }
}
