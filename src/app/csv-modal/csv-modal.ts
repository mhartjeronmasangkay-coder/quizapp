import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SubjectService, ImportStatus } from '../services/subject'; // adjust path to match your actual file
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-csv-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csv-modal.html',
  styleUrl: './csv-modal.css'
})
export class CsvModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() importFinished = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  isUploading = false;
  importStatus: ImportStatus | null = null;
  errorMessage = '';
  private pollHandle: any = null;

  constructor(
    private http: HttpClient,
    private subjectService: SubjectService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = '';
  }

  uploadCsv() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';

    this.subjectService.importSubjectsCsv(this.selectedFile).subscribe({
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
        this.errorMessage = 'Upload failed. Please try again.';
        console.error(err);
      }
    });
  }

  private pollStatus(jobId: string) {
    this.pollHandle = setInterval(() => {
      this.subjectService.getImportStatus(jobId).subscribe({
        next: (status) => {
          this.importStatus = status;
          if (status.status === 'completed') {
            clearInterval(this.pollHandle);
            this.importFinished.emit();
          }
        },
        error: () => clearInterval(this.pollHandle)
      });
    }, 1500);
  }

  exportCsv() {
    this.http.get(`${environment.apiUrl}/subjects/export`, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subjects.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Export failed. Please try again.';
        console.error(err);
      }
    });
  }

  close() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.selectedFile = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.importStatus = null;
    this.errorMessage = '';
    this.closed.emit();
  }
}
