import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logoIonic } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroPage implements OnInit {
  form = {
    username: '',
    email: '',
    password: '',
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ logoIonic });
  }

  async ngOnInit(): Promise<void> {
    const { session } = await this.authService.getSession();

    if (session) {
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    }
  }

  async onRegister(): Promise<void> {
    const username = this.form.username.trim();
    const email = this.form.email.trim();
    const password = this.form.password;

    if (!username || !email || !password || this.isLoading) {
      this.errorMessage = 'Completa usuario, correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { error: signUpError } = await this.authService.signUp(email, password, username);
    if (signUpError) {
      this.errorMessage = signUpError;
      this.isLoading = false;
      return;
    }

    const { error: signInError } = await this.authService.signIn(email, password);
    if (signInError) {
      this.errorMessage = 'Cuenta creada. Verifica correo o inicia sesión manualmente.';
      this.isLoading = false;
      return;
    }

    this.isLoading = false;
    this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

}
