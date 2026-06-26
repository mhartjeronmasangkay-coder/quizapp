import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  currentPage = 'dashboard';
  stats = { total_students: 0, total_subjects: 0, total_questions: 0 };
  students: any[] = [];
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadStudents();
  }

  loadStats() {
    this.http.get(`${this.apiUrl}/admin/stats`).subscribe({
      next: (data: any) => {
        this.stats = data;
        this.cdr.detectChanges();
      }
    });
  }

  loadStudents() {
    this.http.get(`${this.apiUrl}/admin/students`).subscribe({
      next: (data: any) => {
        this.students = data;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}