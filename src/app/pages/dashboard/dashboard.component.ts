import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  user: any = null;
  activePage = 'home';

  stats = {
    totalQuizzes: 12,
    averageScore: 85,
    subjectsCompleted: 4,
    recentActivity: 'Math Quiz',
    scorePercentage: 85,
    badgesEarned: 3,
    streakDays: 7
  };

  subjects = [
    { name: 'Mathematics', icon: '📐', color: '#3b82f6', quizzes: 5, avgScore: 88 },
    { name: 'Science', icon: '🔬', color: '#10b981', quizzes: 3, avgScore: 82 },
    { name: 'English', icon: '📖', color: '#f59e0b', quizzes: 2, avgScore: 79 },
    { name: 'History', icon: '🏛️', color: '#8b5cf6', quizzes: 2, avgScore: 91 },
  ];

  leaderboard = [
    { rank: 1, name: 'Ana Santos', score: 98, badge: '🥇' },
    { rank: 2, name: 'Juan Dela Cruz', score: 95, badge: '🥈' },
    { rank: 3, name: 'Maria Reyes', score: 92, badge: '🥉' },
    { rank: 4, name: 'You', score: 85, badge: '⭐' },
    { rank: 5, name: 'Carlo Bautista', score: 80, badge: '' },
  ];

  recentActivities = [
    { subject: 'Mathematics', score: 90, date: 'Today', icon: '📐' },
    { subject: 'Science', score: 75, date: 'Yesterday', icon: '🔬' },
    { subject: 'English', score: 88, date: '2 days ago', icon: '📖' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      setTimeout(() => this.speakWelcome(), 800);
    }
  }
goToSubjects() {
  this.router.navigate(['/subjects']);
}
goToDashboard() {
  this.router.navigate(['/dashboard']);
}
  speakWelcome() {
    const pendingSubjects = this.subjects.length - this.stats.subjectsCompleted;
    const message = `Welcome back ${this.user.name}! 
      You have ${pendingSubjects} subjects not yet completed. 
      Your streak is ${this.stats.streakDays} days. 
      Keep learning and good luck!`;

    const synth = window.speechSynthesis;

    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Google US English') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')
      ) || voices[0];

      const speech = new SpeechSynthesisUtterance(message);
      speech.voice = preferred;
      speech.lang = 'en-US';
      speech.rate = 0.85;
      speech.pitch = 1.1;
      speech.volume = 1;
      synth.cancel();
      synth.speak(speech);
    };

    if (synth.getVoices().length > 0) {
      const voices = synth.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Google US English') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')
      ) || voices[0];

      const speech = new SpeechSynthesisUtterance(message);
      speech.voice = preferred;
      speech.lang = 'en-US';
      speech.rate = 0.85;
      speech.pitch = 1.1;
      speech.volume = 1;
      synth.cancel();
      synth.speak(speech);
    }
  }

  setActivePage(page: string) {
    this.activePage = page;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}