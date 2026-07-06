import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService, ImportStatus } from '../services/question';

@Component({
  selector: 'app-question-csv-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-csv-modal.html',
  styleUrl: './question-csv-modal.css'
})
export class QuestionCsvModalComponent {
  @Input() visible = false;
  @Input() questionGroupId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() importFinished = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  isUploading = false;
  importStatus: ImportStatus | null = null;
  errorMessage = '';
  private pollHandle: any = null;

  constructor(private questionService: QuestionService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = '';
    this.importStatus = null;
  }

  uploadCsv() {
    if (!this.selectedFile || !this.questionGroupId) return;
    this.isUploading = true;
    this.errorMessage = '';
    this.importStatus = null;

    this.questionService.importQuestionsCsv(this.questionGroupId, this.selectedFile).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.importStatus = result;
        this.selectedFile = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        if (result.jobId) {
          this.pollStatus(result.jobId);
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage =
          err?.graphQLErrors?.[0]?.message ??
          err?.networkError?.error?.errors?.[0]?.message ??
          err?.networkError?.message ??
          err?.message ??
          'Upload failed. Please check the file and try again.';
        console.error('CSV import error:', err);
      }
    });
  }

  private pollStatus(jobId: string) {
    this.pollHandle = setInterval(() => {
      this.questionService.getImportStatus(jobId).subscribe({
        next: (status) => {
          this.importStatus = status;
          if (status.status === 'completed') {
            clearInterval(this.pollHandle);
            this.pollHandle = null;
            this.importFinished.emit();
            // Auto-close after 2s so user can see the completion message
            setTimeout(() => this.close(), 2000);
          }
        },
        error: () => {
          clearInterval(this.pollHandle);
          this.pollHandle = null;
        }
      });
    }, 1500);
  }

  get progressPercent(): number {
    if (!this.importStatus || this.importStatus.total === 0) return 0;
    return Math.round((this.importStatus.processed / this.importStatus.total) * 100);
  }

  downloadSample(): void {
    const csv = [
      'question_text,option_a,option_b,option_c,option_d,correct_option',
      'What is 2 + 2?,3,4,5,6,b',
      'What is 5 + 3?,6,7,8,9,c',
      'What is 10 - 4?,4,5,6,7,c',
      'What is 3 x 3?,6,7,8,9,d',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  close() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.pollHandle = null;
    this.selectedFile = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.importStatus = null;
    this.errorMessage = '';
    this.closed.emit();
  }
}