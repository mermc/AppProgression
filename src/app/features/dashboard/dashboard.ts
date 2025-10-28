import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatMenuModule
  ]
})
export class Dashboard implements OnInit {

  personas$: Observable<any[]>;
  grupos$: Observable<any[]>;
  vistaActual: 'personas' | 'grupos' = 'personas'; // pestaña activa

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    const personasRef = collection(this.firestore, 'personas');
    const gruposRef = collection(this.firestore, 'grupos');
    this.personas$ = collectionData(personasRef, { idField: 'id' });
    this.grupos$ = collectionData(gruposRef, { idField: 'id' });
  }

  ngOnInit() {}

  cambiarVista(tipo: 'personas' | 'grupos') {
    this.vistaActual = tipo;
  }

  irADetalle(item: any, tipo: 'personas' | 'grupos') {
    this.router.navigate(['/dashboard/detalle', tipo, item.id]);
  }


  irAPerfil() {
    this.router.navigate(['/perfil']);
  }

  crearNuevo() {
      console.log('Ir a crear nuevo');
    this.router.navigate(['/dashboard/component/nuevo']);
  }


}
