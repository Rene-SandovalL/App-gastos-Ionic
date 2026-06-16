import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircle, notificationsOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonIcon, IonLabel, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {

  userName: string = 'Usuario';
  userEmail: string = '';
  userInitials: string = '??';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({personCircle,notificationsOutline,logOutOutline});
  }

  async ngOnInit() {
    const user = await this.authService.getSession().then(res => res.session?.user);

    if (user) {
      this.userEmail = user.email || '';
      this.userName = user.user_metadata?.['full_name'] || user.user_metadata?.['username'] || 'Usuario';
      this.generateInitials(this.userName);
    }
  }

  generateInitials(name: string) {
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    this.userInitials = initials;
  }

  async onLogout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
