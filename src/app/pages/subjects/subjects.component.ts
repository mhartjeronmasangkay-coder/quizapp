import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService, Subject } from '../../services/subject';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {

  subjects: Subject[] = [];
  newSubjectName: string = '';
  newSubjectDescription: string = '';
  activeMenu: string | null = null;
  editingSubject: Subject | null = null;

  constructor(private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
    });
  }

  addSubject(): void {
    if (!this.newSubjectName.trim()) return;

    this.subjectService
      .createSubject(this.newSubjectName, this.newSubjectDescription, true)
      .subscribe(() => {
        this.newSubjectName = '';
        this.newSubjectDescription = '';
        this.loadSubjects();
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
}