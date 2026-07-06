import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuestionService, QuestionGroup, Question } from '../../services/question';
import { QuestionCsvModalComponent } from '../../question-csv-modal/question-csv-modal';

interface AnswerDraft {
  answer_text: string;
  is_correct: boolean;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionCsvModalComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css'
})
export class QuestionsComponent implements OnInit {
  subjectId!: string;
  questionGroups: QuestionGroup[] = [];

  // New folder form
  newGroupName = '';

  // New question form (per group)
  activeGroupId: string | null = null;
  newQuestionText = '';
  newAnswers: AnswerDraft[] = this.blankAnswers();

  // Edit question form
  editingQuestionId: string | null = null;
  editQuestionText = '';
  editAnswers: AnswerDraft[] = this.blankAnswers();

  // CSV modal
  showCsvModal = false;
  csvTargetGroupId: string | null = null;

  // PDF generation / preview
  generatingPdf = false;
  currentGroupId: string | null = null;
  showPdfPreview = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  pdfGroupName = '';

  errorMessage = '';
  editErrorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.subjectId = this.route.snapshot.paramMap.get('subjectId')!;
    this.loadGroups();
  }

  loadGroups(forceRefresh = false): void {
    this.questionService.getQuestionGroups(this.subjectId, forceRefresh).subscribe(groups => {
      this.questionGroups = groups;
      this.cdr.detectChanges();
    });
  }

  blankAnswers(): AnswerDraft[] {
    return [
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
    ];
  }

  createGroup(): void {
    if (!this.newGroupName.trim()) return;
    this.questionService.createQuestionGroup(this.subjectId, this.newGroupName).subscribe(() => {
      this.newGroupName = '';
      this.loadGroups(true);
    });
  }

  deleteGroup(id: string): void {
    const confirmed = confirm('Delete this folder and all its questions? This cannot be undone.');
    if (!confirmed) return;
    this.questionService.deleteQuestionGroup(id).subscribe(() => {
      this.loadGroups(true);
    });
  }

  openQuestionForm(groupId: string): void {
    this.activeGroupId = this.activeGroupId === groupId ? null : groupId;
    this.newQuestionText = '';
    this.newAnswers = this.blankAnswers();
    this.errorMessage = '';
    // Close any open edit form when opening a new-question form
    this.editingQuestionId = null;
  }

  setCorrect(index: number): void {
    this.newAnswers.forEach((a, i) => (a.is_correct = i === index));
  }

  submitQuestion(groupId: string): void {
    this.errorMessage = '';

    if (!this.newQuestionText.trim()) {
      this.errorMessage = 'Question text is required.';
      return;
    }

    const filled = this.newAnswers.filter(a => a.answer_text.trim() !== '');
    if (filled.length !== 4) {
      this.errorMessage = 'All 4 answer options are required.';
      return;
    }

    const correctCount = this.newAnswers.filter(a => a.is_correct).length;
    if (correctCount !== 1) {
      this.errorMessage = 'Select exactly one correct answer.';
      return;
    }

    const answersPayload = this.newAnswers.map((a, i) => ({
      answer_text: a.answer_text.trim(),
      is_correct: a.is_correct,
      order: i + 1,
    }));

    this.questionService.createQuestion(groupId, this.newQuestionText.trim(), answersPayload).subscribe({
      next: () => {
        this.activeGroupId = null;
        this.loadGroups(true);
      },
      error: (err) => {
        this.errorMessage = 'Failed to create question. Please check your inputs.';
        console.error(err);
      }
    });
  }

  // ===== Edit question =====

  startEditQuestion(question: Question): void {
    this.editingQuestionId = question.id;
    this.editQuestionText = question.question_text;

    const sorted = [...(question.answers ?? [])].sort((a, b) => a.order - b.order);
    this.editAnswers = sorted.length === 4
      ? sorted.map(a => ({ answer_text: a.answer_text, is_correct: a.is_correct }))
      : this.blankAnswers();

    this.editErrorMessage = '';
    // Close any open "add question" form when editing
    this.activeGroupId = null;
  }

  setEditCorrect(index: number): void {
    this.editAnswers.forEach((a, i) => (a.is_correct = i === index));
  }

  submitEditQuestion(questionId: string): void {
    this.editErrorMessage = '';

    if (!this.editQuestionText.trim()) {
      this.editErrorMessage = 'Question text is required.';
      return;
    }

    const filled = this.editAnswers.filter(a => a.answer_text.trim() !== '');
    if (filled.length !== 4) {
      this.editErrorMessage = 'All 4 answer options are required.';
      return;
    }

    const correctCount = this.editAnswers.filter(a => a.is_correct).length;
    if (correctCount !== 1) {
      this.editErrorMessage = 'Select exactly one correct answer.';
      return;
    }

    const answersPayload = this.editAnswers.map((a, i) => ({
      answer_text: a.answer_text.trim(),
      is_correct: a.is_correct,
      order: i + 1,
    }));

    this.questionService.updateQuestion(questionId, this.editQuestionText.trim(), answersPayload).subscribe({
      next: () => {
        this.editingQuestionId = null;
        this.loadGroups(true);
      },
      error: (err) => {
        this.editErrorMessage = 'Failed to update question. Please check your inputs.';
        console.error(err);
      }
    });
  }

  cancelEditQuestion(): void {
    this.editingQuestionId = null;
    this.editErrorMessage = '';
  }

  deleteQuestion(id: string): void {
    const confirmed = confirm('Delete this question?');
    if (!confirmed) return;
    this.questionService.deleteQuestion(id).subscribe(() => {
      this.loadGroups(true);
    });
  }

  openCsvModal(groupId: string): void {
    this.csvTargetGroupId = groupId;
    this.showCsvModal = true;
  }

  onCsvClosed(): void {
    this.showCsvModal = false;
    this.csvTargetGroupId = null;
  }

  onCsvImportFinished(): void {
    this.loadGroups(true);
  }

  generatePDF(groupId: string, groupName: string, showAnswers = false): void {
    if (this.generatingPdf) return;

    const group = this.questionGroups.find(g => g.id === groupId);
    if (!group || !group.questions || group.questions.length === 0) {
      alert('No questions in this folder. Add some questions first.');
      return;
    }

    this.generatingPdf = true;
    this.currentGroupId = groupId;
    this.pdfGroupName = groupName;

    this.questionService.generatePDF(groupId, showAnswers).subscribe({
      next: (blob) => {
        this.pdfBlob = blob;
        const url = window.URL.createObjectURL(blob);
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.showPdfPreview = true;
        this.generatingPdf = false;
        this.currentGroupId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF. Please try again.');
        this.generatingPdf = false;
        this.currentGroupId = null;
        this.cdr.detectChanges();
      }
    });
  }

  downloadPreviewedPdf(): void {
    if (!this.pdfBlob) return;
    const url = window.URL.createObjectURL(this.pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.pdfGroupName.replace(/\s+/g, '_')}_Quiz.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  closePdfPreview(): void {
    this.showPdfPreview = false;
    this.pdfPreviewUrl = null;
    this.pdfBlob = null;
  }
}
