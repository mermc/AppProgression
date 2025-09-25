import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,
  UserCredential } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseApp = initializeApp(environment.firebase);
  private auth = getAuth(this.firebaseApp);

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

}