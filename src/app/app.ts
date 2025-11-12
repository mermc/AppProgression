import { inject, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, AsyncPipe } from '@angular/common';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { FirestoreService } from './core/services/firestore.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bienestar-app');

  // Inyecto el servicio correctamente usando inject()
  firestoreService = inject(FirestoreService);

  
}
