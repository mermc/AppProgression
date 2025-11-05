import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  imports: [CommonModule, MatCardModule, MatButtonModule]
})
export class Perfil implements OnInit, OnDestroy {
  usuarioAuth: User | null = null;
  perfil: any = null;
  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = this.authService.user$.subscribe(async (user: User | null) => {
      this.usuarioAuth = user;
      if (user) {
        try {
          const ref = doc(this.firestore, 'usuarios', user.uid);
          const snap = await getDoc(ref);
          this.perfil = snap.exists() ? snap.data() : null;
        } catch (error) {
          console.error('Error al cargar perfil:', error);
        }
      } else {
        // usuario desconectado → limpiar datos
        this.perfil = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
