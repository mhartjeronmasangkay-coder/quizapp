// Frontend Architecture - TypeScript Models & Interfaces

// ========== CORE MODELS ==========

export interface ApiResponse<T> {
  success: boolean;
  status_code?: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  email_verified_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ========== QUIZ MODELS ==========

export interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  questionGroups?: QuestionGroup[];
}

export interface QuestionGroup {
  id: number;
  subject_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface Question {
  id: number;
  question_group_id: number;
  question_text: string;
  created_at: string;
  updated_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  question_group_id: number;
  started_at: string;
  submitted_at?: string;
  time_spent_seconds: number;
  score: number;
  percentage: number;
  is_passed: boolean;
  created_at: string;
}

export interface QuizResult {
  score: number;
  percentage: number;
  is_passed: boolean;
  time_spent_seconds: number;
  answers: UserAnswer[];
}

export interface UserAnswer {
  id: number;
  quiz_attempt_id: number;
  question_id: number;
  selected_answer_id: number;
  is_correct: boolean;
  time_spent_seconds: number;
  question?: Question;
  selectedAnswer?: Answer;
}

// ========== USER PROGRESS ==========

export interface UserProgress {
  completed_levels: number;
  passed_levels: number;
  average_score: number;
  total_time_spent_seconds: number;
  streak_days: number;
}

export interface StudentStats {
  id: number;
  name: string;
  username: string;
  email: string;
  attempts: number;
  passed: number;
  average_score: number;
  created_at: string;
}

// ========== ADMIN MODELS ==========

export interface DashboardStats {
  total_students: number;
  total_subjects: number;
  total_questions: number;
  total_quiz_attempts: number;
  average_completion_rate: number;
  average_score: number;
  total_hours_spent: number;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  model_name: string;
  model_id: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  created_at: string;
}

// ========== FORM MODELS ==========

export interface RegisterFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateSubjectForm {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CreateQuestionGroupForm {
  subject_id: number;
  name: string;
}

export interface CreateQuestionForm {
  question_group_id: number;
  question_text: string;
  answers: CreateAnswerForm[];
}

export interface CreateAnswerForm {
  answer_text: string;
  is_correct: boolean;
  order: number;
}

// ========== IMPORT MODELS ==========

export interface ImportStatus {
  jobId: string | null;
  status: string;
  processed: number;
  total: number;
  errors: string[];
}

// ========== ERROR HANDLING ==========

export interface ApiError {
  success: false;
  status_code: number;
  message: string;
  errors?: Record<string, string[]>;
  trace_id?: string;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public apiError: ApiError
  ) {
    super(apiError.message);
  }
}
