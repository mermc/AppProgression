import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatMenuModule,
    MatButtonToggleModule,
  ]
})
export class Dashboard implements OnInit {

  personas$!: Observable<any[]>;
  grupos$!: Observable<any[]>;

  vistaActual: 'personas' | 'grupos' = 'personas';

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = user.uid;

    const personasRef = collection(this.firestore, 'personas');
    const gruposRef = collection(this.firestore, 'grupos');

    this.personas$ = collectionData(
      query(personasRef, where('userId', '==', userId)),
      { idField: 'id' }
    );

    this.grupos$ = collectionData(
      query(gruposRef, where('userId', '==', userId)),
      { idField: 'id' }
    );
  }

  cambiarVista(tipo: 'personas' | 'grupos'): void {
    this.vistaActual = tipo;
  }

  crearNuevo(): void {
    const tipo = this.vistaActual === 'personas' ? 'persona' : 'grupo';
    this.router.navigate([`/dashboard/nuevo`]);
  }

  irADetalle(item: any, tipo: 'personas' | 'grupos'): void {
    this.router.navigate([`/dashboard/detalle/${tipo}/${item.id}`]);
  }

}

