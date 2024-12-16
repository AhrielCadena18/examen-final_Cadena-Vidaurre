import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  isLogued = false;
  profile: any;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    public db: DatabaseService,
    public router: Router
  ) {
    this.verifyIsLogued();
    //////////////
    let storedProfile: any = localStorage.getItem('profile');
    if (storedProfile) {
      this.profile = JSON.parse(storedProfile);
    }
    let stroedUser: any = localStorage.getItem('user');
    if (stroedUser) {
      let user = JSON.parse(stroedUser)
      this.getProfile(user?.uid);
    }
    //////////////
  }

  async registerUser(email: string, password: string, additionalData: { name: string; phone: string; username: string }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      const userDocRef = doc(this.firestore, `users/${userId}`);
      await setDoc(userDocRef, { ...additionalData, email });
      this.router.navigateByUrl('/login')
      console.log('Usuario registrado y documento creado en Firestore');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      localStorage.setItem('user', JSON.stringify(userCredential.user));
      console.log('Usuario autenticado:', userCredential.user);
      //esto se debe usar en el componente de perfil
      this.getProfile(userCredential.user.uid);
      this.router.navigateByUrl('/profile');
    } catch (error) {
      //alert('Error:' + error);
      console.error('Error al iniciar sesión:', error);
    }
  }

  verifyIsLogued() {
    let user = localStorage.getItem('user');
    this.isLogued = user ? true : false;
    return user ? true : false;
  }

  getProfile(uid: any) {
    this.db.getDocumentById('users', uid)
      .subscribe(
        (res: any) => {
          console.log('perfil desde firebase', res)
          localStorage.setItem('profile', JSON.stringify(res));
          this.profile = res;
        },
        (error: any) => { console.log(error) })
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/login');
    // /location.reload()
  }
}
