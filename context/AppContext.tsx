
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Question, Post, Attempt, Document, Role, Level, QuestionType, Exam, Topic, Infographic, Lecture, SurveyResponse, Worksheet, CodeProblem, Comment } from '../types';
import { MOCK_ADMIN, MOCK_QUESTIONS, MOCK_POSTS, MOCK_DOCS, MOCK_TOPICS, MOCK_INFOGRAPHICS, MOCK_LECTURES, MOCK_WORKSHEETS, MOCK_CODE_PROBLEMS } from '../constants';

interface AppState {
  users: User[];
  questions: Question[];
  posts: Post[];
  attempts: Attempt[];
  documents: Document[];
  exams: Exam[];
  topics: Topic[];
  infographics: Infographic[];
  lectures: Lecture[];
  surveyResponses: SurveyResponse[];
  worksheets: Worksheet[];
  codeProblems: CodeProblem[];
  currentUser: User | null;
}

interface AppContextType extends AppState {
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, role?: Role) => boolean;
  logout: () => void;
  updateUser: (u: User) => void; 
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  importQuestions: (qs: Question[]) => void;
  submitPost: (p: Post) => void;
  updatePost: (p: Post) => void;
  approvePost: (id: string) => void;
  deletePost: (id: string) => void;
  importPosts: (newPosts: Post[]) => void;
  saveAttempt: (a: Attempt) => void;
  addDocument: (d: Document) => void;
  addExam: (e: Exam) => void;
  deleteExam: (id: string) => void;
  importUsers: (users: User[]) => void;
  addInfographic: (i: Infographic) => void;
  deleteInfographic: (id: string) => void;
  addLecture: (l: Lecture) => void;
  deleteLecture: (id: string) => void;
  toggleLectureCompletion: (id: string) => void;
  addLectureComment: (lectureId: string, comment: Comment) => void;
  submitSurvey: (s: SurveyResponse) => void;
  addWorksheet: (w: Worksheet) => void;
  deleteWorksheet: (id: string) => void;
  submitWorksheet: (id: string, userId: string) => void;
  addCodeProblem: (p: CodeProblem) => void;
  deleteCodeProblem: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // Load initial state from LocalStorage or constants
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('lms_users');
    return stored ? JSON.parse(stored) : [MOCK_ADMIN];
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const stored = localStorage.getItem('lms_questions');
    return stored ? JSON.parse(stored) : MOCK_QUESTIONS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = localStorage.getItem('lms_posts');
    return stored ? JSON.parse(stored) : MOCK_POSTS;
  });

  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    const stored = localStorage.getItem('lms_attempts');
    return stored ? JSON.parse(stored) : [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const stored = localStorage.getItem('lms_documents');
    return stored ? JSON.parse(stored) : MOCK_DOCS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const stored = localStorage.getItem('lms_exams');
    return stored ? JSON.parse(stored) : [];
  });

  // Topics are usually static, but could be dynamic. For now, we load from constants.
  const [topics] = useState<Topic[]>(MOCK_TOPICS);

  // Infographics
  const [infographics, setInfographics] = useState<Infographic[]>(() => {
    const stored = localStorage.getItem('lms_infographics');
    return stored ? JSON.parse(stored) : MOCK_INFOGRAPHICS;
  });

  // Lectures
  const [lectures, setLectures] = useState<Lecture[]>(() => {
      const stored = localStorage.getItem('lms_lectures');
      return stored ? JSON.parse(stored) : MOCK_LECTURES;
  });

  // Surveys
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(() => {
      const stored = localStorage.getItem('lms_surveys');
      return stored ? JSON.parse(stored) : [];
  });

  // Worksheets
  const [worksheets, setWorksheets] = useState<Worksheet[]>(() => {
      const stored = localStorage.getItem('lms_worksheets');
      return stored ? JSON.parse(stored) : MOCK_WORKSHEETS;
  });

  // Code Problems
  const [codeProblems, setCodeProblems] = useState<CodeProblem[]>(() => {
      const stored = localStorage.getItem('lms_code_problems');
      return stored ? JSON.parse(stored) : MOCK_CODE_PROBLEMS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('lms_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('lms_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('lms_questions', JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem('lms_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('lms_attempts', JSON.stringify(attempts)); }, [attempts]);
  useEffect(() => { localStorage.setItem('lms_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('lms_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('lms_infographics', JSON.stringify(infographics)); }, [infographics]);
  useEffect(() => { localStorage.setItem('lms_lectures', JSON.stringify(lectures)); }, [lectures]);
  useEffect(() => { localStorage.setItem('lms_surveys', JSON.stringify(surveyResponses)); }, [surveyResponses]);
  useEffect(() => { localStorage.setItem('lms_worksheets', JSON.stringify(worksheets)); }, [worksheets]);
  useEffect(() => { localStorage.setItem('lms_code_problems', JSON.stringify(codeProblems)); }, [codeProblems]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('lms_current_user');
  }, [currentUser]);

  // Actions
  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, pass: string, role: Role = Role.STUDENT) => {
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      role,
      totalScore: 0,
      currentLevel: Level.INTRO,
      medals: [],
      completedLevels: [],
      completedTopics: [],
      completedLectureIds: []
    };
    setUsers([...users, newUser]);
    return true;
  };

  const logout = () => setCurrentUser(null);

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const addQuestion = (q: Question) => setQuestions(prev => [...prev, q]);

  const updateQuestion = (updatedQ: Question) => {
    setQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q));
  };
  
  const deleteQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id));

  const importQuestions = (qs: Question[]) => {
    setQuestions(prev => [...prev, ...qs]);
  };

  const submitPost = (p: Post) => setPosts([p, ...posts]);

  const updatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const approvePost = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
  };

  const deletePost = (id: string) => setPosts(posts.filter(p => p.id !== id));

  const importPosts = (newPosts: Post[]) => {
    setPosts(prev => [...newPosts, ...prev]);
  };

  const saveAttempt = (attempt: Attempt) => {
    setAttempts([...attempts, attempt]);
    
    if (currentUser) {
      const updatedUser = { ...currentUser };
      updatedUser.totalScore += attempt.score;
      
      if (attempt.passed && attempt.level) {
          if (!updatedUser.completedLevels.includes(attempt.level)) {
             updatedUser.completedLevels.push(attempt.level);
             
             let medal = '';
             if (attempt.level === Level.ELEMENTARY) medal = 'Đồng'; 
             if (attempt.level === Level.INTERMEDIATE) medal = 'Bạc'; 
             if (attempt.level === Level.ADVANCED) medal = 'Vàng'; 
             if (attempt.level === Level.EXPERT) medal = 'Kim cương'; 
             
             if (medal && !updatedUser.medals.includes(medal)) {
                 updatedUser.medals.push(medal);
             }

             const levelOrder = [Level.INTRO, Level.ELEMENTARY, Level.INTERMEDIATE, Level.ADVANCED, Level.EXPERT];
             const currentIndex = levelOrder.indexOf(attempt.level);
             if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
                 const nextLevel = levelOrder[currentIndex + 1];
                 const nextIndex = levelOrder.indexOf(nextLevel);
                 const userCurrentIndex = levelOrder.indexOf(updatedUser.currentLevel);
                 if (nextIndex > userCurrentIndex) {
                     updatedUser.currentLevel = nextLevel;
                 }
             }
          }
      }

      if (attempt.passed && attempt.topicId && !updatedUser.completedTopics.includes(attempt.topicId)) {
          updatedUser.completedTopics.push(attempt.topicId);
      }

      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
    }
  };

  const addDocument = (doc: Document) => setDocuments([...documents, doc]);

  const addExam = (exam: Exam) => setExams([...exams, exam]);
  const deleteExam = (id: string) => setExams(exams.filter(e => e.id !== id));

  const importUsers = (newUsers: User[]) => {
    const uniqueNew = newUsers.filter(nu => !users.some(u => u.email === nu.email));
    setUsers([...users, ...uniqueNew]);
  };

  const addInfographic = (info: Infographic) => setInfographics([info, ...infographics]);
  const deleteInfographic = (id: string) => setInfographics(infographics.filter(i => i.id !== id));

  const addLecture = (l: Lecture) => setLectures([l, ...lectures]);
  const deleteLecture = (id: string) => setLectures(lectures.filter(l => l.id !== id));

  const toggleLectureCompletion = (lectureId: string) => {
    if (!currentUser) return;
    
    const isCompleted = currentUser.completedLectureIds?.includes(lectureId);
    let newCompletedIds: string[];

    if (isCompleted) {
        newCompletedIds = currentUser.completedLectureIds.filter(id => id !== lectureId);
    } else {
        newCompletedIds = [...(currentUser.completedLectureIds || []), lectureId];
    }

    const updatedUser = { ...currentUser, completedLectureIds: newCompletedIds };
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const addLectureComment = (lectureId: string, comment: Comment) => {
      setLectures(prev => prev.map(l => {
          if (l.id === lectureId) {
              return { ...l, comments: [...(l.comments || []), comment] };
          }
          return l;
      }));
  };

  const submitSurvey = (s: SurveyResponse) => setSurveyResponses([...surveyResponses, s]);

  const addWorksheet = (w: Worksheet) => setWorksheets([w, ...worksheets]);
  const deleteWorksheet = (id: string) => setWorksheets(worksheets.filter(w => w.id !== id));
  
  const submitWorksheet = (id: string, userId: string) => {
      setWorksheets(prev => prev.map(w => {
          if (w.id === id) {
              const currentSubmitted = w.submittedBy || [];
              if (!currentSubmitted.includes(userId)) {
                  return { ...w, submittedBy: [...currentSubmitted, userId] };
              }
          }
          return w;
      }));
  };

  const addCodeProblem = (p: CodeProblem) => setCodeProblems([...codeProblems, p]);
  const deleteCodeProblem = (id: string) => setCodeProblems(codeProblems.filter(p => p.id !== id));

  return (
    <AppContext.Provider value={{
      users, questions, posts, attempts, documents, exams, topics, infographics, lectures, surveyResponses, worksheets, codeProblems, currentUser,
      login, register, logout, updateUser, addQuestion, updateQuestion, deleteQuestion, importQuestions, submitPost, updatePost,
      approvePost, deletePost, importPosts, saveAttempt, addDocument, addExam, deleteExam, importUsers,
      addInfographic, deleteInfographic, addLecture, deleteLecture, toggleLectureCompletion, addLectureComment, submitSurvey,
      addWorksheet, deleteWorksheet, submitWorksheet, addCodeProblem, deleteCodeProblem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
