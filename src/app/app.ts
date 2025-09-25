import { inject, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, AsyncPipe } from '@angular/common';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { FirestoreService } from './services/firestore.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, AsyncPipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bienestar-app');

  // Inyecto el servicio correctamente usando inject()
  firestoreService = inject(FirestoreService);

  // Ahora puedo usarlo para inicializar datos$
  datos$ = this.firestoreService.getPruebas();
  nuevoMensaje = '';

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      this.firestoreService.addMensaje(this.nuevoMensaje);
      this.nuevoMensaje = '';
    }
  }
}
