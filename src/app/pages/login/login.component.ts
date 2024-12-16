import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {

  loginForm: FormGroup;
  constructor(
    public auth: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['test@ucb.edu.bo', [Validators.required, Validators.email]],
      password: ['123456', Validators.required]
    });
    console.log(auth.isLogued);
  }

  ngOnDestroy(): void {
    console.log('destroy login')
  }


  onLogin() {
    if (this.loginForm.valid) {
      console.log('formulario valido', this.loginForm.value)
        const { email, password } = this.loginForm.value;
      this.auth.loginUser(email, password);
    }
    else {
      console.log('formulario invalido', this.loginForm)
      alert('revise sus datos');
    }
  }
}
