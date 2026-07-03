import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService, Subject } from '../../services/subject';
import { HttpClient } from '@angular/common/http';
import { CsvModalComponent } from '../../csv-modal/csv-modal';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, CsvModalComponent],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {
  showCsvModal = false;
  subjects: Subject[] = [];
  newSubjectName: string = '';
  newSubjectDescription: string = '';
  activeMenu: string | null = null;
  editingSubject: Subject | null = null;

  constructor(
    private subjectService: SubjectService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(forceRefresh = false): void {
    this.subjectService.getSubjects(forceRefresh).subscribe(subjects => {
      this.subjects = subjects;
      this.cdr.detectChanges();
    });
  }

  addSubject(): void {
    if (!this.newSubjectName.trim()) return;
    this.subjectService
      .createSubject(this.newSubjectName, this.newSubjectDescription, true)
      .subscribe(() => {
        this.newSubjectName = '';
        this.newSubjectDescription = '';
        this.loadSubjects(true);
      });
  }

  removeSubject(id: string): void {
    this.subjectService.deleteSubject(id).subscribe(() => {
      this.subjects = this.subjects.filter(subject => subject.id !== id);
      this.activeMenu = null;
    });
  }

  toggleMenu(subjectId: string): void {
    this.activeMenu = this.activeMenu === subjectId ? null : subjectId;
  }

  startEdit(subject: Subject): void {
    this.editingSubject = { ...subject };
    this.activeMenu = null;
  }

   saveEdit(): void {
    if (!this.editingSubject || !this.editingSubject.name.trim()) return;

    this.subjectService
      .updateSubject(
        this.editingSubject.id,
        this.editingSubject.name,
        this.editingSubject.description
      )
      .subscribe(() => {
        this.loadSubjects();
        this.editingSubject = null;
      });
  }

  cancelEdit(): void {
    this.editingSubject = null;
  }
  deleteAllSubjects(): void {
  if (this.subjects.length === 0) return;

  const confirmed = confirm(
    `Are you sure you want to delete all ${this.subjects.length} subject(s)? This cannot be undone.`
  );
  if (!confirmed) return;

  const deleteRequests = this.subjects.map(subject =>
    this.subjectService.deleteSubject(subject.id).pipe(
      catchError(() => of(null)) // don't let one failure stop the rest
    )
  );

  forkJoin(deleteRequests).subscribe(() => {
    this.loadSubjects(true);
  });
}
}
