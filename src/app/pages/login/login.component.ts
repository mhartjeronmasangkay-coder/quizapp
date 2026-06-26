import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
     next: (response: any) => {
  this.isLoading = false;
  this.successMessage = 'Welcome back, ' + response.user.name + '!';
  this.authService.saveUser(response.user);
  setTimeout(() => {
    if (response.user.role === 'teacher') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }, 1000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password!';
      }
    });
  }
}