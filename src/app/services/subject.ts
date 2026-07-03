import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Subject {
  id: string;
  name: string;
  description: string;
  is_published: boolean;
}

export interface ImportStatus {
  jobId: string | null;
  status: 'queued' | 'processing' | 'completed' | 'not_found';
  processed: number;
  total: number;
  errors: string[];
}

const IMPORT_SUBJECTS_CSV = gql`
  mutation ImportSubjectsCsv($file: Upload!) {
    importSubjectsCsv(file: $file) {
      jobId
      status
      processed
      total
      errors
    }
  }
`;

const IMPORT_STATUS = gql`
  query ImportStatus($jobId: String!) {
    importStatus(jobId: $jobId) {
      jobId
      status
      processed
      total
      errors
    }
  }
`;

const GET_SUBJECTS = gql`
  query {
    subjects {
      id
      name
      description
      is_published
    }
  }
`;

const CREATE_SUBJECT = gql`
  mutation CreateSubject($name: String!, $description: String, $is_published: Boolean) {
    createSubject(name: $name, description: $description, is_published: $is_published) {
      id
      name
      description
      is_published
    }
  }
`;

const UPDATE_SUBJECT = gql`
  mutation UpdateSubject($id: ID!, $name: String, $description: String, $is_published: Boolean) {
    updateSubject(id: $id, name: $name, description: $description, is_published: $is_published) {
      id
      name
      description
      is_published
    }
  }
`;

const DELETE_SUBJECT = gql`
  mutation DeleteSubject($id: ID!) {
    deleteSubject(id: $id) {
      id
      name
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  constructor(private apollo: Apollo) {}

 getSubjects(forceRefresh = false): Observable<Subject[]> {
  return this.apollo
    .watchQuery<{ subjects: Subject[] }>({
      query: GET_SUBJECTS,
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    })
    .valueChanges
    .pipe(map(result => (result.data?.subjects ?? []) as Subject[]));
}

  createSubject(name: string, description: string, is_published: boolean = true): Observable<Subject> {
    return this.apollo
      .mutate<{ createSubject: Subject }>({
        mutation: CREATE_SUBJECT,
        variables: { name, description, is_published },
        refetchQueries: [{ query: GET_SUBJECTS }],
      })
      .pipe(map(result => result.data!.createSubject));
  }

  updateSubject(id: string, name?: string, description?: string, is_published?: boolean): Observable<Subject> {
    return this.apollo
      .mutate<{ updateSubject: Subject }>({
        mutation: UPDATE_SUBJECT,
        variables: { id, name, description, is_published },
        refetchQueries: [{ query: GET_SUBJECTS }],
      })
      .pipe(map(result => result.data!.updateSubject));
  }

  deleteSubject(id: string): Observable<Subject> {
    return this.apollo
      .mutate<{ deleteSubject: Subject }>({
        mutation: DELETE_SUBJECT,
        variables: { id },
        update: (cache) => {
          const existing = cache.readQuery<{ subjects: Subject[] }>({ query: GET_SUBJECTS });
          if (existing) {
            cache.writeQuery({
              query: GET_SUBJECTS,
              data: { subjects: existing.subjects.filter(s => s.id !== id) },
            });
          }
        },
      })
      .pipe(map(result => result.data!.deleteSubject));
  }
  importSubjectsCsv(file: File): Observable<ImportStatus> {
  return this.apollo
    .mutate<{ importSubjectsCsv: ImportStatus }>({
      mutation: IMPORT_SUBJECTS_CSV,
      variables: { file },
      context: { useMultipart: true },
    })
    .pipe(map(result => result.data!.importSubjectsCsv));
}

getImportStatus(jobId: string): Observable<ImportStatus> {
  return this.apollo
    .query<{ importStatus: ImportStatus }>({
      query: IMPORT_STATUS,
      variables: { jobId },
      fetchPolicy: 'network-only',
    })
    .pipe(map(result => result.data!.importStatus));
}

}
