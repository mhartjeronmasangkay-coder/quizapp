import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface Question {
  id: string;
  question_text: string;
  question_group_id: string;
  answers?: Answer[];
}

export interface QuestionGroup {
  id: string;
  subject_id: string;
  name: string;
  questions?: Question[];
}

export interface ImportStatus {
  jobId: string | null;
  status: 'queued' | 'processing' | 'completed' | 'not_found';
  processed: number;
  total: number;
  errors: string[];
}

const GET_QUESTION_GROUPS = gql`
  query QuestionGroups($subject_id: ID!) {
    questionGroups(subject_id: $subject_id) {
      id
      subject_id
      name
      questions {
        id
        question_text
        answers {
          id
          answer_text
          is_correct
          order
        }
      }
    }
  }
`;

const CREATE_QUESTION_GROUP = gql`
  mutation CreateQuestionGroup($subject_id: ID!, $name: String!) {
    createQuestionGroup(subject_id: $subject_id, name: $name) {
      id
      subject_id
      name
    }
  }
`;

const CREATE_QUESTION = gql`
  mutation CreateQuestion($question_group_id: ID!, $question_text: String!, $answers: [CreateAnswerInput!]!) {
    createQuestion(question_group_id: $question_group_id, question_text: $question_text, answers: $answers) {
      id
      question_text
      answers {
        id
        answer_text
        is_correct
        order
      }
    }
  }
`;

const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($id: ID!, $question_text: String!, $answers: [UpdateAnswerInput!]!) {
    updateQuestion(id: $id, question_text: $question_text, answers: $answers) {
      id
      question_text
      answers {
        id
        answer_text
        is_correct
        order
      }
    }
  }
`;

const DELETE_QUESTION_GROUP = gql`
  mutation DeleteQuestionGroup($id: ID!) {
    deleteQuestionGroup(id: $id) {
      id
    }
  }
`;

const DELETE_QUESTION = gql`
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id) {
      id
    }
  }
`;

const IMPORT_QUESTIONS_CSV = gql`
  mutation ImportQuestionsCsv($question_group_id: ID!, $file: Upload!) {
    importQuestionsCsv(question_group_id: $question_group_id, file: $file) {
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

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(
    private apollo: Apollo,
    private http: HttpClient
  ) {}

  getQuestionGroups(subjectId: string, forceRefresh = false): Observable<QuestionGroup[]> {
    return this.apollo
      .watchQuery<{ questionGroups: QuestionGroup[] }>({
        query: GET_QUESTION_GROUPS,
        variables: { subject_id: subjectId },
        fetchPolicy: forceRefresh ? 'network-only' : 'cache-and-network',
        notifyOnNetworkStatusChange: true,
      })
.valueChanges
      .pipe(map(result => (result.data?.questionGroups ?? []) as QuestionGroup[]));
  }

  createQuestionGroup(subjectId: string, name: string): Observable<QuestionGroup> {
    return this.apollo
      .mutate<{ createQuestionGroup: QuestionGroup }>({
        mutation: CREATE_QUESTION_GROUP,
        variables: { subject_id: subjectId, name },
      })
      .pipe(map(result => result.data!.createQuestionGroup));
  }

  createQuestion(questionGroupId: string, questionText: string, answers: { answer_text: string; is_correct: boolean; order: number }[]): Observable<Question> {
    return this.apollo
      .mutate<{ createQuestion: Question }>({
        mutation: CREATE_QUESTION,
        variables: { question_group_id: questionGroupId, question_text: questionText, answers },
      })
      .pipe(map(result => result.data!.createQuestion));
  }

updateQuestion(id: string, questionText: string, answers: { answer_text: string; is_correct: boolean; order: number }[]): Observable<Question> {
    return this.apollo
      .mutate<{ updateQuestion: Question }>({
        mutation: UPDATE_QUESTION,
        variables: { id, question_text: questionText, answers },
      })
      .pipe(map(result => result.data!.updateQuestion));
  }

  deleteQuestionGroup(id: string): Observable<{ id: string }> {
    return this.apollo
      .mutate<{ deleteQuestionGroup: { id: string } }>({
        mutation: DELETE_QUESTION_GROUP,
        variables: { id },
      })
      .pipe(map(result => result.data!.deleteQuestionGroup));
  }

  deleteQuestion(id: string): Observable<{ id: string }> {
    return this.apollo
      .mutate<{ deleteQuestion: { id: string } }>({
        mutation: DELETE_QUESTION,
        variables: { id },
      })
      .pipe(map(result => result.data!.deleteQuestion));
  }

  importQuestionsCsv(questionGroupId: string, file: File): Observable<ImportStatus> {
    return this.apollo
      .mutate<{ importQuestionsCsv: ImportStatus }>({
        mutation: IMPORT_QUESTIONS_CSV,
        variables: { question_group_id: questionGroupId, file },
      })
      .pipe(map(result => result.data!.importQuestionsCsv));
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

  generatePDF(questionGroupId: string, showAnswers = false): Observable<Blob> {
    return this.http.post(
      `${environment.apiUrl}/questions/generate-pdf`,
      { question_group_id: parseInt(questionGroupId, 10), show_answers: showAnswers },
      { responseType: 'blob' }
    );
  }
}