
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  SHORT_ESSAY = 'SHORT_ESSAY',
  TRUE_FALSE = 'TRUE_FALSE',
  DRAG_DROP = 'DRAG_DROP', // New Type
}

export enum Level {
  INTRO = 'INTRO', // Nhận biết
  ELEMENTARY = 'ELEMENTARY', // Thông hiểu
  INTERMEDIATE = 'INTERMEDIATE', // Vận dụng
  ADVANCED = 'ADVANCED', // Vận dụng cao (Hidden for this specific requirement)
  EXPERT = 'EXPERT', // Chuyên gia (Hidden)
}

export const LEVEL_LABELS: Record<Level, string> = {
  [Level.INTRO]: 'Nhận biết',
  [Level.ELEMENTARY]: 'Thông hiểu',
  [Level.INTERMEDIATE]: 'Vận dụng',
  [Level.ADVANCED]: 'Vận dụng cao',
  [Level.EXPERT]: 'Chuyên gia',
};

export interface Topic {
  id: string;
  name: string;
  grade: 10 | 11 | 12; // Added field for Grade level
  month: number; // 1-9 (representing academic months)
  description: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  totalScore: number;
  currentLevel: Level;
  medals: string[]; // 'Gold', 'Silver', etc.
  completedLevels: Level[];
  completedTopics: string[]; // IDs of passed topics
  completedLectureIds: string[]; // IDs of completed lectures
  avatarUrl?: string; // New field for Profile Picture
}

export interface Question {
  id: string;
  type: QuestionType;
  level: Level;
  topicId?: string; // Optional linkage to a specific topic
  content: string;
  options?: string[]; // For MC
  correctAnswer?: string; // For MC, Short Answer, True/False
  matchingPairs?: { left: string; right: string }[]; // For DRAG_DROP (Left: Definition, Right: Term)
  keywords?: string[]; // For Essay
  isChallenging?: boolean; // Featured/Challenging question flag
}

export type PostCategory = 'GENERAL' | 'PYTHON' | 'NETWORK' | 'DATA_STRUCTURE' | 'ALGORITHMS' | 'SECURITY';

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  GENERAL: 'Chung',
  PYTHON: 'Lập trình Python',
  NETWORK: 'Mạng máy tính',
  DATA_STRUCTURE: 'Cấu trúc dữ liệu',
  ALGORITHMS: 'Thuật toán',
  SECURITY: 'An toàn thông tin',
};

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED';
  type: 'OFFICIAL' | 'COMMUNITY';
  category: PostCategory; 
  grade?: 10 | 11 | 12; // New field for Grade filtering
  attachmentUrl?: string; // Base64 PDF
  attachmentName?: string;
  linkUrl?: string; // External Link URL
  createdAt: string;
}

export interface Attempt {
  id: string;
  userId: string;
  level?: Level;
  topicId?: string;
  score: number;
  maxScore: number;
  passed: boolean;
  date: string;
}

export interface Document {
  id: string;
  title: string;
  content: string; // Plain text content for simple RAG
  fileUrl?: string; // Base64 content for download
  uploadedBy: string;
  fileName: string;
}

export interface Exam {
  id: string;
  title: string;
  term: 'HK1' | 'HK2';
  type: 'MID' | 'FINAL'; // Giữa kì / Cuối kì
  fileUrl: string; // Base64 or URL
  fileName: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface Lecture {
  id: string;
  topicId: string;
  title: string;
  description: string;
  fileUrl: string; // Base64
  fileName: string;
  fileType: 'PDF' | 'IMAGE';
  videoUrl?: string; // YouTube Embed URL or MP4 Link
  codeSnippet?: string; // Code sample content
  comments?: Comment[]; // Discussion/Q&A
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  quizData?: { content: string; correctAnswer: 'Đúng' | 'Sai'; explanation?: string }[]; // New field for Interactive Quiz
}

export interface Infographic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  imageUrl: string; // URL or Base64 placeholder
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  userName: string;
  uiScore: number; // 1-5
  uxScore: number; // 1-5
  knowledgeScore: number; // 1-5
  lectureScore: number; // 1-5
  practicalScore: number; // 1-5 (New)
  motivationScore: number; // 1-5 (New)
  comment: string;
  createdAt: string;
}

export interface Worksheet {
  id: string;
  topicId: string;
  title: string;
  description: string;
  fileUrl: string; // Base64 for download
  fileName: string;
  fileType: 'PDF' | 'DOCX';
  submittedBy?: string[]; // List of user IDs who submitted
  createdAt: string;
}

// NEW: Code Problem Interface for Generator
export interface CodeProblem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: { input: string; output: string; explanation?: string }[];
  template?: { python: string; cpp?: string };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicId?: string;
  createdAt: string;
}
