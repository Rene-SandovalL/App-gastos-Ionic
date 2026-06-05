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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';

import { addIcons } from 'ionicons';
import {
  cameraOutline,
  imageOutline,
  trashOutline,
  sparkles,
} from 'ionicons/icons';
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
    CommonModule,
  ],
})
export class Tab3Page implements OnDestroy {
  constructor() {
    addIcons({ cameraOutline, imageOutline, trashOutline, sparkles });
  }

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  isCameraActive = false;
  finalPhoto: string | null = null;
  mediaStream: MediaStream | null = null;

  async startCamera() {
    this.finalPhoto = null;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      this.videoElement.nativeElement.srcObject = this.mediaStream;
      this.isCameraActive = true;
    } catch (error) {
      console.error('Error al acceder a la cámara web:', error);
      alert('Activa los permisos de la cámara en tu navegador, pa.');
    }
  }

  async takePhoto() {
    if (!this.videoElement.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.finalPhoto = canvas.toDataURL('image/jpeg', 0.9);

    this.stopCamera();
  }

  async stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.isCameraActive = false;
  }

  async openGallery() {
    try {
      const galeria = await Camera.chooseFromGallery({
        allowMultipleSelection: false,
      });

      if (galeria.results && galeria.results.length > 0) {
        this.finalPhoto = galeria.results[0].webPath ?? null;
      }

      await this.stopCamera();
    } catch (error) {
      console.error('Error abriendo galería:', error);
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
