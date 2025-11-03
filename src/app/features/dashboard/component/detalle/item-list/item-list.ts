import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { query, orderBy } from 'firebase/firestore';

@Component({
  selector: 'app-itemlist',
  standalone: true,
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.css'],
  imports: [CommonModule, MatButtonModule, MatCardModule]
})
export class ItemList implements OnInit {
  tipo!: 'personas' | 'grupos';
  parentId!: string;
  items$!: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.parentId = this.route.snapshot.paramMap.get('id')!;

    const itemsRef = collection(this.firestore, `${this.tipo}/${this.parentId}/items`);
const q = query(itemsRef, orderBy('fecha', 'desc'));
this.items$ = collectionData(q, { idField: 'id' });
  }

  editarItem(itemId: string) {
    this.router.navigate([`/dashboard/detalle/${this.tipo}/${this.parentId}/items/${itemId}`]);
  }

  async eliminarItem(itemId: string) {
    if (!confirm('¿Eliminar este item?')) return;
    try {
      const ref = doc(this.firestore, `${this.tipo}/${this.parentId}/items/${itemId}`);
      await deleteDoc(ref);
      this.snackBar.open('Item eliminado', 'OK', { duration: 2000 });
    } catch (err) {
      console.error(err);
      this.snackBar.open('Error al eliminar el item', 'Cerrar', { duration: 2000 });
    }
  }

  volver() {
    this.router.navigate([`/dashboard/detalle/${this.tipo}/${this.parentId}`]);
  }
}
