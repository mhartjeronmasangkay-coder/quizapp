import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { QuestionService } from '../../services/question';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent {
  generatingPdfId: string | null = null;

  results = [
    { id: 1, quiz: 'Basic Algebra', score: 85, total: 100, date: '2024-01-15', status: 'Passed' },
    { id: 2, quiz: 'Geometry Fundamentals', score: 72, total: 100, date: '2024-01-14', status: 'Passed' },
    { id: 3, quiz: 'Calculus Advanced', score: 65, total: 100, date: '2024-01-13', status: 'Passed' },
    { id: 4, quiz: 'Trigonometry', score: 90, total: 100, date: '2024-01-12', status: 'Passed' }
  ];

  averageScore = 78;

  constructor(private questionService: QuestionService) {}

  getScoreColor(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  generateResultPDF(result: any): void {
    if (this.generatingPdfId) return;

    this.generatingPdfId = result.quiz;

    const mockGroupId = `result-${result.id}`;
    this.questionService.generatePDF(mockGroupId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.quiz.replace(/\s+/g, '_')}_Result.pdf`;
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
