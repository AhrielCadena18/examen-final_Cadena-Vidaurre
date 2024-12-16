import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AngularFireAuthModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  loginForm: FormGroup;
  constructor(
    public auth: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['+591', []],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('formulario valido', this.loginForm.value);
      const {email, password } = this.loginForm.value
     // this.auth.registerUser(this.loginForm.value.email, this.loginForm.value.password , this.loginForm.value)
      this.auth.registerUser(email, password , this.loginForm.value)
        .then(
          (res: any) => { console.log('then 1', res) },
          (res: any) => { console.log('callback2', res) },
        )
    }
    else {
      console.log('formulario invalido', this.loginForm.value)
      alert('revise sus datos');
    }
  }
}
