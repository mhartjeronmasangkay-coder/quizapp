import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';


@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {

  subjects: any[] = [];
  selectedSubject: any = null;
  selectedSubSubject: any = null;
  step = 1;
  isAnimating = false;

  constructor(
    private quizService: QuizService, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
  this.quizService.getSubjects().subscribe({
    next: (data: any) => {
      console.log('✅ Subjects received:', data); 
      this.subjects = data;
         this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('❌ Error:', err); 
    }
  });
}

  selectSubject(subject: any) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.selectedSubject = subject;
    setTimeout(() => {
      this.step = 2;
      this.isAnimating = false;
    }, 400);
  }

  selectSubSubject(subSubject: any) {
    if (subSubject.is_locked) {
      this.shakeLocked(subSubject);
      return;
    }
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.selectedSubSubject = subSubject;
    setTimeout(() => {
      this.step = 3;
      this.isAnimating = false;
    }, 400);
  }

  selectLevel(level: any) {
    if (level.is_locked) {
      this.shakeLocked(level);
      return;
    }
    this.router.navigate(['/quiz', level.id]);
  }

  shakeLocked(item: any) {
    item.shaking = true;
    setTimeout(() => item.shaking = false, 500);
  }

  goBack() {
    if (this.step === 3) {
      this.step = 2;
      this.selectedSubSubject = null;
    } else if (this.step === 2) {
      this.step = 1;
      this.selectedSubject = null;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}