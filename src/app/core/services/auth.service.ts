import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  UserCredential, onAuthStateChanged, User } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseApp = initializeApp(environment.firebase);
  private auth = getAuth(this.firebaseApp);
  private userSubject = new BehaviorSubject<User | null>(null);
  
  // Observable del estado del usuario
  user$ = this.userSubject.asObservable();

  constructor() {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Registrarse
  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // Obtener el usuario actual
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}