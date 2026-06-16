import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoInstagram, logoIonic } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonIcon, IonText, IonSpinner, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  credentials = {
    email: '',
    password: '',
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({logoIonic,logoInstagram});
  }

  async ngOnInit(): Promise<void> {
    const { session } = await this.authService.getSession();

    if (session) {
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    }
  }

  async onLogin(): Promise<void> {
    const email = this.credentials.email.trim();
    const password = this.credentials.password;

    if (!email || !password || this.isLoading) {
      this.errorMessage = 'Ingresa correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { error } = await this.authService.signIn(email, password);

    if (error) {
      this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.';
      this.isLoading = false;
      return;
    }

    this.isLoading = false;
    this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

  goToRegister(): void {
    this.router.navigateByUrl('/registro');
  }
}
