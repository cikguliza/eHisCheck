
export type UserRole = 'guru' | 'pelajar';

export interface User {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
  password: string;
  class_name?: string; // New field for students
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  semester: string; // New field: Semester 1, 2, or 3
  section_a_questions: string[]; // 5 structural questions
  section_b_questions: string[]; // up to 3 essay questions
  created_at: string;
  user_id: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  name: string;
  answers_a: string[]; 
  answers_b: string[]; 
  marks_a?: number[]; 
  marks_b?: number[]; 
  ai_comments_a?: string[]; // Granular AI feedback for Section A
  ai_comments_b?: string[]; // Granular AI feedback for Section B
  submitted_at: string;
  status: 'submitted' | 'graded';
  teacher_marks: number;
  teacher_feedback: string;
  ai_feedback?: string;
  ai_suggested_marks?: number;
}

export type AppView = 
  | 'login' 
  | 'guru-dashboard' 
  | 'student-dashboard' 
  | 'create-assignment' 
  | 'answer-assignment' 
  | 'view-submissions' 
  | 'grade-submission' 
  | 'performance' 
  | 'leaderboard' 
  | 'register-students' 
  | 'view-students';
