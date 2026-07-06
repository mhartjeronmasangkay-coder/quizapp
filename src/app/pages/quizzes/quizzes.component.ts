import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quizzes.component.html',
  styleUrl: './quizzes.component.css'
})
export class QuizzesComponent {
  generatingPdfId: number | null = null;

  quizzes = [
    { id: 1, title: 'Basic Algebra', difficulty: 'Easy', questions: 10, duration: '15 mins' },
    { id: 2, title: 'Geometry Fundamentals', difficulty: 'Medium', questions: 15, duration: '25 mins' },
    { id: 3, title: 'Calculus Advanced', difficulty: 'Hard', questions: 20, duration: '40 mins' },
    { id: 4, title: 'Trigonometry', difficulty: 'Medium', questions: 12, duration: '20 mins' }
  ];

  constructor(private questionService: QuestionService) {}

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Easy': 'easy',
      'Medium': 'medium',
      'Hard': 'hard'
    };
    return colors[difficulty] || '';
  }

  generateQuizPDF(quiz: any): void {
    if (this.generatingPdfId) return;
    
    this.generatingPdfId = quiz.id;
    
    // For demo, we'll create a simple PDF data structure
    const mockGroupId = `quiz-${quiz.id}`;
    this.questionService.generatePDF(mockGroupId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quiz.title.replace(/\s+/g, '_')}_Quiz.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.generatingPdfId = null;
      },
      error: (err) => {
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF. Please try again.');
        this.generatingPdfId = null;
      }
    });
  }
}
