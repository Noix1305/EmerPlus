import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}
  async onLogin() {
    const isAuthenticated = await this.authService.login(this.username, this.password);
    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      console.error('Nombre de usuario o contraseña incorrectos');
      alert('Nombre de usuario o contraseña incorrectos');
    }
  }
  ngOnInit() {
  }

}
