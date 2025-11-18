import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from './../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  irAPerfil(): void {
    // Navega a la ruta del perfil dentro del dashboard
    this.router.navigate(['/dashboard/perfil']);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      // después de logout: ir a login
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error al hacer logout:', err);
      this.snackBar.open('No se pudo cerrar sesión', 'Cerrar', { duration: 3000 });
    }
  }
}
