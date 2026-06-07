import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { Capacitor } from '@capacitor/core';
import {
  CameraPreview,
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from '@capacitor-community/camera-preview';
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
export class Tab3Page implements OnDestroy {
  constructor(
    private router: Router,
    private geminiService: GeminiService
  ) {
    addIcons({ cameraOutline, imageOutline, trashOutline, sparkles });
  }

  @ViewChild('webVideo') webVideo!: ElementRef<HTMLVideoElement>;
  finalPhoto: string | null = null;
  photoBase64: string | null = null;
  isAnalyzing = false;
  errorMessage: string | null = null;
  isPreviewActive = false;
  isWebPreviewActive = false;
  private webStream: MediaStream | null = null;

  async takePhoto(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const canUseCamera = await this.ensureCameraPermission();
      if (!canUseCamera) {
        this.errorMessage = 'Permiso de cámara denegado.';
        return;
      }

      if (!this.isPreviewActive) {
        await this.startPreview();
        return;
      }

      await this.capturePreviewPhoto();
      return;
    }

    if (!this.isWebPreviewActive) {
      await this.startWebPreview();
      return;
    }

    await this.captureWebPhoto();
  }

  async openGallery(): Promise<void> {
    await this.stopPreview();
    await this.stopWebPreview();
    await this.capturePhoto(CameraSource.Photos);
  }

  async capturePhoto(source: CameraSource): Promise<void> {
    this.errorMessage = null;
    try {
      if (source === CameraSource.Camera) {
        const canUseCamera = await this.ensureCameraPermission();
        if (!canUseCamera) {
          this.errorMessage = 'Permiso de cámara denegado.';
          return;
        }
      }

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

  async startPreview(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isPreviewActive) {
      return;
    }

    this.errorMessage = null;

    const target = document.getElementById('cameraSpace');
    if (!target) {
      this.errorMessage = 'No se encontro el contenedor de la camara.';
      return;
    }

    const rect = target.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const options: CameraPreviewOptions = {
      parent: 'cameraSpace',
      className: 'camera-preview',
      position: 'rear',
      disableAudio: true,
      toBack: false,
      x: Math.round(rect.left * scale),
      y: Math.round(rect.top * scale),
      width: Math.round(rect.width * scale),
      height: Math.round(rect.height * scale),
    };

    try {
      await CameraPreview.start(options);
      this.isPreviewActive = true;
    } catch (error) {
      this.errorMessage = 'No se pudo abrir la cámara en vista previa.';
    }
  }

  async capturePreviewPhoto(): Promise<void> {
    if (!this.isPreviewActive) {
      return;
    }

    const options: CameraPreviewPictureOptions = {
      quality: 90,
    };

    try {
      const result = await CameraPreview.capture(options);
      if (!result?.value) {
        this.errorMessage = 'No se pudo capturar la foto.';
        return;
      }

      this.photoBase64 = result.value;
      this.finalPhoto = `data:image/jpeg;base64,${result.value}`;
      await this.stopPreview();
    } catch (error) {
      this.errorMessage = 'No se pudo capturar la foto.';
    }
  }

  async stopPreview(): Promise<void> {
    if (!this.isPreviewActive) {
      return;
    }

    try {
      await CameraPreview.stop();
    } finally {
      this.isPreviewActive = false;
    }
  }

  private async ensureCameraPermission(): Promise<boolean> {
    const permissions = await Camera.requestPermissions({
      permissions: ['camera'],
    });
    return permissions.camera === 'granted' || permissions.camera === 'limited';
  }

  clearPhoto(): void {
    this.finalPhoto = null;
    this.photoBase64 = null;
    this.errorMessage = null;
    this.stopPreview();
    this.stopWebPreview();
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

  private async startWebPreview(): Promise<void> {
    this.errorMessage = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.errorMessage = 'Este navegador no soporta la cámara.';
      return;
    }

    try {
      this.webStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      const video = this.webVideo?.nativeElement;
      if (!video) {
        this.errorMessage = 'No se pudo iniciar la vista previa.';
        return;
      }

      video.srcObject = this.webStream;
      await video.play();
      this.isWebPreviewActive = true;
    } catch (error) {
      this.errorMessage = 'No se pudo acceder a la cámara del navegador.';
    }
  }

  private async captureWebPhoto(): Promise<void> {
    const video = this.webVideo?.nativeElement;
    if (!video) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1] ?? '';

    if (!base64) {
      this.errorMessage = 'No se pudo capturar la foto.';
      return;
    }

    this.finalPhoto = dataUrl;
    this.photoBase64 = base64;
    await this.stopWebPreview();
  }

  private async stopWebPreview(): Promise<void> {
    if (this.webStream) {
      this.webStream.getTracks().forEach((track) => track.stop());
      this.webStream = null;
    }

    this.isWebPreviewActive = false;
  }

  ngOnDestroy(): void {
    this.stopPreview();
    this.stopWebPreview();
  }
}
