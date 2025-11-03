import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-registro-list',
  standalone: true,
  templateUrl: './registro-list.html',
  styleUrls: ['./registro-list.css'],
  imports: [CommonModule, MatButtonModule, MatCard]
})
export class RegistroList implements OnInit {
  registros$!: Observable<any[]>;
  tipo!: 'personas' | 'grupos';
  id!: string;
  itemId!: string;

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;

    if (!this.tipo || !this.id || !this.itemId) {
      this.snackBar.open('Parámetros inválidos', 'Cerrar', { duration: 2000 });
      this.router.navigate(['/dashboard']);
      return;
    }

    const ref = collection(this.firestore, `${this.tipo}/${this.id}/items/${this.itemId}/registros`);
    this.registros$ = collectionData(ref, { idField: 'id' });
  }

  nuevoRegistro() {
    this.router.navigate([
      `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros/nuevo`
    ]);
  }
}
