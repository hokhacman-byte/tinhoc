
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Level, Question, QuestionType, Role, User, LEVEL_LABELS, Exam, Post, Topic, PostCategory, POST_CATEGORY_LABELS, CodeProblem } from '../types';
import { generateTrueFalseQuestions, generateCodeExercises } from '../services/geminiService';

const AdminPanel = () => {
  const { 
    users, questions, posts, attempts, exams, topics, infographics, lectures, currentUser, codeProblems, documents, surveyResponses, worksheets,
    deleteQuestion, addQuestion, updateQuestion, importQuestions,
    approvePost, deletePost, updatePost, importPosts,
    importUsers, updateUser, addExam, deleteExam, deleteInfographic,
    addCodeProblem, deleteCodeProblem
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'exams' | 'posts' | 'infographics' | 'stats' | 'code_problems' | 'system'>('users');

  // --- USER MANAGEMENT STATE ---
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editRole, setEditRole] = useState<Role>(Role.STUDENT);
  const [userSearch, setUserSearch] = useState('');

  // --- QUESTION BANK STATE ---
  const [qBankGrade, setQBankGrade] = useState<10 | 11 | 12>(10);
  const [qBankTopicId, setQBankTopicId] = useState<string>('ALL');
  const [qSearch, setQSearch] = useState('');
  const [qPage, setQPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;

  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qType, setQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [qLevel, setQLevel] = useState<Level>(Level.INTRO);
  const [formGrade, setFormGrade] = useState<10 | 11 | 12>(10);
  const [qTopicId, setQTopicId] = useState<string>(''); 
  const [qContent, setQContent] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qKeywords, setQKeywords] = useState('');
  const [qIsChallenging, setQIsChallenging] = useState(false);
  const [isAddingQ, setIsAddingQ] = useState(false);

  // Auto Generate Questions State
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoGenCount, setAutoGenCount] = useState(5);
  const [autoGenTopicId, setAutoGenTopicId] = useState('');
  const [isGeneratingQ, setIsGeneratingQ] = useState(false);

  // --- CODE PROBLEM GENERATOR STATE ---
  const [codeTopic, setCodeTopic] = useState('');
  const [codeReq, setCodeReq] = useState('Mức độ khó dần, từ cơ bản đến nâng cao.');
  const [codeCount, setCodeCount] = useState(3);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedProblems, setGeneratedProblems] = useState<any[]>([]);

  // ... (Existing Post/Exam States) ...
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'OFFICIAL' | 'COMMUNITY'>('OFFICIAL');
  const [postStatus, setPostStatus] = useState<'PENDING' | 'APPROVED'>('APPROVED');

  const [examTitle, setExamTitle] = useState('');
  const [examTerm, setExamTerm] = useState<'HK1' | 'HK2'>('HK1');
  const [examType, setExamType] = useState<'MID' | 'FINAL'>('MID');
  const [examFile, setExamFile] = useState<string>('');
  const [examFileName, setExamFileName] = useState('');

  // ... (Filter Logic for Questions) ...
  useEffect(() => { setQPage(1); }, [qBankGrade, qBankTopicId, qSearch]);
  
  // Get topics for the selected filter grade
  const currentGradeTopics = topics.filter(t => t.grade === qBankGrade);
  
  // Filter for Form (when adding/editing)
  const formGradeTopics = topics.filter(t => t.grade === formGrade);

  const filteredQuestions = questions.filter(q => {
      const topic = topics.find(t => t.id === q.topicId);
      if (!topic || topic.grade !== qBankGrade) return false;
      if (qBankTopicId !== 'ALL' && q.topicId !== qBankTopicId) return false;
      if (qSearch && !q.content.toLowerCase().includes(qSearch.toLowerCase())) return false;
      return true;
  });
  const totalQPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIdx = (qPage - 1) * QUESTIONS_PER_PAGE;
  const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, filteredQuestions.length);
  const displayedQuestions = filteredQuestions.slice(startIdx, endIdx);

  // --- HELPER FOR UI ---
  const getTypeColor = (type: QuestionType) => {
      switch(type) {
          case QuestionType.MULTIPLE_CHOICE: return 'bg-purple-100 text-purple-700 border-purple-200';
          case QuestionType.TRUE_FALSE: return 'bg-cyan-100 text-cyan-700 border-cyan-200';
          case QuestionType.SHORT_ANSWER: return 'bg-blue-100 text-blue-700 border-blue-200';
          case QuestionType.SHORT_ESSAY: return 'bg-orange-100 text-orange-700 border-orange-200';
          case QuestionType.DRAG_DROP: return 'bg-pink-100 text-pink-700 border-pink-200';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  const getLevelColor = (level: Level) => {
      switch(level) {
          case Level.INTRO: return 'text-green-600 bg-green-50 border-green-100';
          case Level.ELEMENTARY: return 'text-blue-600 bg-blue-50 border-blue-100';
          case Level.INTERMEDIATE: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
          case Level.ADVANCED: return 'text-orange-600 bg-orange-50 border-orange-100';
          case Level.EXPERT: return 'text-red-600 bg-red-50 border-red-100';
          default: return 'text-gray-600';
      }
  };

  // --- USER HANDLERS ---
  
  // 1. Download Template
  const handleDownloadUserTemplate = () => {
      const XLSX = (window as any).XLSX;
      if (!XLSX) return alert("Lỗi thư viện Excel");
      
      const templateData = [
          { "Họ và tên": "Nguyễn Văn A", "Email": "hocsinh1@example.com", "Mật khẩu": "123456", "Vai trò": "STUDENT" },
          { "Họ và tên": "Cô Giáo B", "Email": "gv1@example.com", "Mật khẩu": "password", "Vai trò": "TEACHER" }
      ];
      
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "Mau_Danh_Sach_Nguoi_Dung.xlsx");
  };

  // 2. Import Excel
  const handleImportUsersExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const XLSX = (window as any).XLSX;
      const reader = new FileReader();
      
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          const newUsers: User[] = data.map((row: any) => {
              // Flexible Header Matching
              const name = row["Họ và tên"] || row["Name"] || row["Họ tên"] || row["Tên"] || "Unknown";
              const email = row["Email"] || row["Mail"] || `user${Math.random().toString().slice(2, 6)}@example.com`;
              const roleRaw = row["Vai trò"] || row["Role"] || row["Vai trò (STUDENT/TEACHER)"] || "STUDENT";
              
              // Normalize Role
              let role = Role.STUDENT;
              if (roleRaw.toString().toUpperCase().includes('TEACHER') || roleRaw.toString().toUpperCase().includes('GIÁO VIÊN')) {
                  role = Role.TEACHER;
              } else if (roleRaw.toString().toUpperCase().includes('ADMIN') || roleRaw.toString().toUpperCase().includes('QUẢN TRỊ')) {
                  role = Role.ADMIN;
              }

              return {
                  id: Date.now().toString() + Math.random().toString().slice(2, 5),
                  name: name,
                  email: email,
                  password: row["Mật khẩu"] || row["Password"] || "123456",
                  role: role,
                  totalScore: 0,
                  currentLevel: Level.INTRO,
                  medals: [],
                  completedLevels: [],
                  completedTopics: [],
                  completedLectureIds: []
              };
          });

          importUsers(newUsers);
          
          // Generate feedback with names
          const namesList = newUsers.map(u => u.name).join(', ');
          const displayNames = namesList.length > 150 ? namesList.substring(0, 150) + '...' : namesList;
          
          alert(`Đã nhập thành công ${newUsers.length} tài khoản!\n\nDanh sách: ${displayNames}`);
      };
      reader.readAsBinaryString(file);
      e.target.value = ''; // Reset input
  };

  // 3. Export Users
  const handleExportUsers = () => {
      const XLSX = (window as any).XLSX;
      const data = users.map(u => ({
          "ID": u.id,
          "Họ và tên": u.name,
          "Email": u.email,
          "Vai trò": u.role,
          "Tổng điểm": u.totalScore,
          "Cấp độ": u.currentLevel
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DanhSachNguoiDung");
      XLSX.writeFile(wb, `DanhSach_NguoiDung_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleEditUserClick = (user: User) => { setEditingUser(user); setEditName(user.name); setEditAvatar(user.avatarUrl || ''); setEditRole(user.role); };
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setEditAvatar(ev.target?.result as string);
          reader.readAsDataURL(file);
      }
  };
  const handleSaveUser = () => { if(editingUser) { updateUser({...editingUser, name: editName, role: editRole, avatarUrl: editAvatar}); setEditingUser(null); } };

  // ... (Question Handlers) ...
  const resetQuestionForm = () => { 
      setIsAddingQ(false); 
      setEditingQId(null); 
      setQContent(''); 
      setQCorrect(''); 
      setQOptions(['','','','']); 
      setQKeywords(''); 
      setQType(QuestionType.MULTIPLE_CHOICE);
      setQLevel(Level.INTRO);
      setQTopicId('');
  };

  const handleSaveQuestion = () => { 
      if (!qContent || !qTopicId) {
          alert('Vui lòng nhập nội dung câu hỏi và chọn chủ đề.');
          return;
      }
      if (qType === QuestionType.MULTIPLE_CHOICE && !qCorrect) {
          alert('Vui lòng nhập đáp án đúng.');
          return;
      }

      const newQuestion: Question = {
          id: editingQId || Date.now().toString(),
          topicId: qTopicId,
          type: qType,
          level: qLevel,
          content: qContent,
          correctAnswer: qCorrect,
          options: qType === QuestionType.MULTIPLE_CHOICE ? qOptions : undefined,
          keywords: qKeywords ? qKeywords.split(',').map(k => k.trim()) : undefined,
          isChallenging: qIsChallenging
      };

      if (editingQId) {
          updateQuestion(newQuestion);
      } else {
          addQuestion(newQuestion);
      }
      resetQuestionForm();
      alert('Đã lưu câu hỏi thành công!');
  };

  const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...qOptions];
      newOptions[index] = value;
      setQOptions(newOptions);
  };

  const handleEditQuestion = (q: Question) => { 
      setEditingQId(q.id);
      setQContent(q.content);
      setQType(q.type);
      setQLevel(q.level);
      setQCorrect(q.correctAnswer || '');
      setQOptions(q.options || ['','','','']);
      setQKeywords(q.keywords?.join(', ') || '');
      setQTopicId(q.topicId || '');
      
      const topic = topics.find(t => t.id === q.topicId);
      if (topic) setFormGrade(topic.grade);
      
      setIsAddingQ(true); 
  };
  
  const handleOpenAutoModal = () => { if(qBankTopicId !== 'ALL') setAutoGenTopicId(qBankTopicId); else if(currentGradeTopics.length > 0) setAutoGenTopicId(currentGradeTopics[0].id); setShowAutoModal(true); };
  const handleAutoGenerate = async () => { /* ... */ };
  
  // EXPORT QUESTIONS HANDLER
  const handleExportQuestions = () => {
      const XLSX = (window as any).XLSX;
      if (!XLSX) return alert("Lỗi thư viện Excel");

      const exportData = filteredQuestions.map(q => {
          const topic = topics.find(t => t.id === q.topicId);
          return {
              "ID": q.id,
              "Chủ đề": topic ? topic.name : 'Unknown',
              "Khối": topic ? topic.grade : '',
              "Mức độ": LEVEL_LABELS[q.level],
              "Loại câu hỏi": q.type,
              "Nội dung câu hỏi": q.content,
              "Đáp án đúng": q.correctAnswer,
              "Phương án A": q.options?.[0] || '',
              "Phương án B": q.options?.[1] || '',
              "Phương án C": q.options?.[2] || '',
              "Phương án D": q.options?.[3] || '',
              "Giải thích (Tự luận/Gợi ý)": q.keywords?.join(', ') || ''
          };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-width columns roughly
      const wscols = [
          { wch: 10 }, // ID
          { wch: 30 }, // Topic
          { wch: 5 },  // Grade
          { wch: 10 }, // Level
          { wch: 15 }, // Type
          { wch: 50 }, // Content
          { wch: 20 }, // Answer
          { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, // Options
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "NganHangCauHoi");
      XLSX.writeFile(wb, `NganHangCauHoi_Lop${qBankGrade}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ... (Code Problem Handlers) ...
  const handleGenerateCodeProblems = async () => {
      if (!codeTopic) {
          alert("Vui lòng nhập chủ đề bài tập.");
          return;
      }
      setIsGeneratingCode(true);
      const results = await generateCodeExercises(codeTopic, codeReq, codeCount);
      setGeneratedProblems(results);
      setIsGeneratingCode(false);
  };

  const handleSaveCodeProblem = (problem: any) => {
      const newProblem: CodeProblem = {
          id: Date.now().toString() + Math.random().toString().slice(2, 5),
          title: problem.title,
          description: problem.description,
          inputFormat: problem.inputFormat,
          outputFormat: problem.outputFormat,
          examples: problem.examples,
          template: { python: problem.template },
          difficulty: problem.difficulty,
          createdAt: new Date().toISOString()
      };
      addCodeProblem(newProblem);
      // Remove from generated list to show it's saved
      setGeneratedProblems(prev => prev.filter(p => p !== problem));
      alert("Đã lưu bài tập vào hệ thống!");
  };

  // --- SYSTEM BACKUP HANDLER ---
  const handleSystemBackup = () => {
      const backupData = {
          metadata: {
              timestamp: new Date().toISOString(),
              exportedBy: currentUser?.name,
              systemVersion: '1.0'
          },
          data: {
              users,
              questions,
              posts,
              attempts,
              documents,
              exams,
              infographics,
              lectures,
              surveyResponses,
              worksheets,
              codeProblems
          }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LHP_LMS_Backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const tabs = [
    { id: 'users', icon: 'fa-users', label: 'Người dùng', desc: 'Quản lý tài khoản', color: 'from-violet-500 to-purple-600' },
    { id: 'questions', icon: 'fa-database', label: 'Ngân hàng câu hỏi', desc: 'Soạn thảo & Duyệt', color: 'from-purple-500 to-fuchsia-600' },
    { id: 'code_problems', icon: 'fa-laptop-code', label: 'Bài tập Code (AI)', desc: 'Tự sinh đề bài', color: 'from-blue-600 to-cyan-500' },
    { id: 'exams', icon: 'fa-file-signature', label: 'Đề thi & Tài liệu', desc: 'Quản lý học liệu', color: 'from-fuchsia-500 to-pink-600' },
    { id: 'posts', icon: 'fa-newspaper', label: 'Tin tức & Bài viết', desc: 'Thông báo & Cộng đồng', color: 'from-pink-500 to-rose-500' },
    { id: 'infographics', icon: 'fa-images', label: 'Thư viện ảnh', desc: 'Infographics & Media', color: 'from-indigo-500 to-violet-500' },
    { id: 'stats', icon: 'fa-chart-line', label: 'Báo cáo thống kê', desc: 'Phân tích dữ liệu', color: 'from-blue-500 to-indigo-500' },
    { id: 'system', icon: 'fa-server', label: 'Hệ thống', desc: 'Sao lưu & Bảo trì', color: 'from-slate-600 to-gray-700' },
  ];

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  // Stats for Users Tab
  const studentCount = users.filter(u => u.role === Role.STUDENT).length;
  const teacherCount = users.filter(u => u.role === Role.TEACHER).length;
  const adminCount = users.filter(u => u.role === Role.ADMIN).length;

  // Theme Helpers
  const getGradeTheme = (grade: number) => { /* ... */ return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', activeRing: 'ring-blue-300' }; };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-full -mr-20 -mt-20 z-0"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight flex items-center">
                <i className="fas fa-user-shield mr-4 text-violet-600"></i> Trung tâm Quản trị
            </h2>
            <p className="text-gray-500 font-medium mt-2 text-lg ml-1">Hệ thống điều hành LHP LMS & Quản lý nội dung số</p>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 z-10">
             <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Menu Chức Năng</p>
                <div className="flex flex-col gap-3">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`group relative flex items-center p-4 rounded-2xl transition-all duration-300 text-left border w-full overflow-hidden ${
                                    isActive 
                                    ? 'bg-white border-violet-200 shadow-xl shadow-violet-100/50 scale-[1.02] z-10' 
                                    : 'bg-white border-transparent hover:bg-violet-50/50 hover:border-violet-100'
                                }`}
                            >
                                {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${tab.color}`}></div>}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all mr-4 shrink-0 relative overflow-hidden ${
                                    isActive ? `text-white shadow-md transform scale-110` : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-violet-500'
                                }`}>
                                    {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${tab.color}`}></div>}
                                    <i className={`fas ${tab.icon} relative z-10`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{tab.label}</h4>
                                    <p className={`text-[11px] truncate transition-colors ${isActive ? 'text-violet-600 font-medium' : 'text-gray-400'}`}>{tab.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 w-full min-w-0 animate-fade-in">
          
          {/* ... USERS TAB ... */}
          {activeTab === 'users' && (
             <div className="space-y-6">
                {/* 1. STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng người dùng</p>
                            <p className="text-3xl font-black text-gray-800 mt-1">{users.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-xl">
                            <i className="fas fa-users"></i>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Học sinh</p>
                            <p className="text-3xl font-black text-blue-600 mt-1">{studentCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                            <i className="fas fa-user-graduate"></i>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Giáo viên</p>
                            <p className="text-3xl font-black text-purple-600 mt-1">{teacherCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-xl">
                            <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                    </div>
                </div>

                {/* 2. ACTIONS BAR */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="relative w-full lg:w-96">
                        <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên hoặc email..." 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap justify-end gap-3 w-full lg:w-auto">
                        <button 
                            onClick={handleDownloadUserTemplate}
                            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center"
                            title="Tải file mẫu Excel"
                        >
                            <i className="fas fa-file-download mr-2"></i> Mẫu nhập
                        </button>
                        
                        <label className="px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors flex items-center cursor-pointer">
                            <i className="fas fa-file-import mr-2"></i> Nhập Excel
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportUsersExcel} />
                        </label>

                        <button 
                            onClick={handleExportUsers}
                            className="px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center"
                        >
                            <i className="fas fa-file-excel mr-2"></i> Xuất Excel
                        </button>
                    </div>
                </div>

                {/* 3. USER TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-5">Thông tin người dùng</th>
                                    <th className="p-5">Vai trò</th>
                                    <th className="p-5">Thống kê</th>
                                    <th className="p-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                                                    user.role === Role.ADMIN ? 'bg-red-500' :
                                                    user.role === Role.TEACHER ? 'bg-purple-500' : 'bg-blue-500'
                                                }`}>
                                                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover"/> : user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{user.name}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                                                user.role === Role.ADMIN ? 'bg-red-50 text-red-600 border-red-100' :
                                                user.role === Role.TEACHER ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {user.role === Role.ADMIN ? 'Quản trị' : user.role === Role.TEACHER ? 'Giáo viên' : 'Học sinh'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                                                    <i className="fas fa-star mr-1"></i> {user.totalScore} XP
                                                </div>
                                                <div className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                    <i className="fas fa-layer-group mr-1"></i> {LEVEL_LABELS[user.currentLevel]}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => handleEditUserClick(user)}
                                                className="text-gray-400 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <i className="fas fa-pen"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <i className="fas fa-search text-4xl mb-3 opacity-30"></i>
                            <p>Không tìm thấy người dùng phù hợp.</p>
                        </div>
                    )}
                </div>

                {/* EDIT USER MODAL (Existing logic hooked up) */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                            <h3 className="text-xl font-black text-gray-800 mb-6">Chỉnh sửa thông tin</h3>
                            
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                            {editAvatar ? (
                                                <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl text-gray-400 font-bold">{editName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full shadow-sm cursor-pointer hover:text-purple-600">
                                            <i className="fas fa-camera text-xs"></i>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ và tên</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vai trò</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value as Role)}
                                    >
                                        <option value={Role.STUDENT}>Học sinh</option>
                                        <option value={Role.TEACHER}>Giáo viên</option>
                                        <option value={Role.ADMIN}>Quản trị viên</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button 
                                    onClick={() => setEditingUser(null)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleSaveUser}
                                    className="px-8 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          )}

          {/* QUESTIONS TAB */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
               
               {/* 1. FILTER & ACTION BAR */}
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
                   {/* Top Row: Grade Selection & Global Actions */}
                   <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-6">
                       <div className="flex bg-gray-100 p-1.5 rounded-xl">
                           {[10, 11, 12].map(g => (
                               <button 
                                    key={g} 
                                    onClick={() => { setQBankGrade(g as any); setQBankTopicId('ALL'); }}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${qBankGrade === g ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                               >
                                   Khối {g}
                               </button>
                           ))}
                       </div>
                       
                       <div className="flex gap-3">
                           <button 
                               onClick={handleExportQuestions}
                               className="bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-green-100 transition-all flex items-center"
                           >
                               <i className="fas fa-file-excel mr-2"></i> Xuất Excel
                           </button>
                           <button 
                               onClick={() => { setIsAddingQ(true); setEditingQId(null); setQContent(''); setQOptions(['','','','']); }}
                               className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center transform hover:-translate-y-0.5"
                           >
                               <i className="fas fa-plus mr-2"></i> Thêm câu hỏi
                           </button>
                       </div>
                   </div>

                   {/* Bottom Row: Search & Filters */}
                   <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text"
                                placeholder="Tìm kiếm nội dung câu hỏi..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                value={qSearch}
                                onChange={(e) => setQSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-72 relative">
                            <select
                                className="w-full p-3 pl-4 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none font-medium text-gray-700 cursor-pointer"
                                value={qBankTopicId}
                                onChange={(e) => setQBankTopicId(e.target.value)}
                            >
                                <option value="ALL">-- Tất cả chủ đề Khối {qBankGrade} --</option>
                                {currentGradeTopics.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                   </div>
               </div>

                {/* 2. QUESTION LIST (CARDS) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-sm font-bold text-gray-500">Hiển thị {displayedQuestions.length} / {filteredQuestions.length} câu hỏi</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {displayedQuestions.map((q, idx) => {
                            const topic = topics.find(t => t.id === q.topicId);
                            return (
                                <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all group relative overflow-hidden">
                                    {/* Action Buttons (Visible on hover) */}
                                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditQuestion(q); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <i className="fas fa-pen text-xs"></i>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="Xóa"
                                        >
                                            <i className="fas fa-trash text-xs"></i>
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <span className="text-xs font-bold text-gray-300 w-6 mt-1">#{startIdx + idx + 1}</span>
                                        
                                        <div className="flex-1 space-y-3">
                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${getTypeColor(q.type)}`}>
                                                    {q.type.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getLevelColor(q.level)}`}>
                                                    {LEVEL_LABELS[q.level]}
                                                </span>
                                                {topic && (
                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 flex items-center">
                                                        <i className={`fas ${topic.icon} mr-1.5`}></i> {topic.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <p className="text-gray-800 font-medium text-base line-clamp-3">
                                                {q.content}
                                            </p>
                                            
                                            {/* Preview Answer (Optional) */}
                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                <i className="fas fa-key"></i>
                                                <span className="truncate max-w-md">Đáp án: <span className="font-mono font-bold text-gray-600">{q.correctAnswer || '(Chưa có)'}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500 font-medium">Không tìm thấy câu hỏi nào.</p>
                        </div>
                    )}
                </div>

                {/* ADD/EDIT QUESTION MODAL */}
                {isAddingQ && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-800 flex items-center">
                                    <i className="fas fa-edit text-purple-600 mr-2"></i> {editingQId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                                </h3>
                                <button onClick={resetQuestionForm} className="text-gray-400 hover:text-red-500"><i className="fas fa-times text-xl"></i></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Khối lớp</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formGrade}
                                        onChange={(e) => setFormGrade(Number(e.target.value) as any)}
                                    >
                                        <option value={10}>Khối 10</option>
                                        <option value={11}>Khối 11</option>
                                        <option value={12}>Khối 12</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chủ đề</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={qTopicId}
                                        onChange={(e) => setQTopicId(e.target.value)}
                                    >
                                        <option value="">-- Chọn chủ đề --</option>
                                        {formGradeTopics.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loại câu hỏi</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={qType}
                                        onChange={(e) => setQType(e.target.value as QuestionType)}
                                    >
                                        <option value={QuestionType.MULTIPLE_CHOICE}>Trắc nghiệm</option>
                                        <option value={QuestionType.TRUE_FALSE}>Đúng / Sai</option>
                                        <option value={QuestionType.SHORT_ANSWER}>Trả lời ngắn</option>
                                        <option value={QuestionType.SHORT_ESSAY}>Tự luận</option>
                                        <option value={QuestionType.DRAG_DROP}>Kéo thả (Beta)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mức độ</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={qLevel}
                                        onChange={(e) => setQLevel(e.target.value as Level)}
                                    >
                                        {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nội dung câu hỏi</label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24"
                                    placeholder="Nhập nội dung câu hỏi..."
                                    value={qContent}
                                    onChange={(e) => setQContent(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Conditional Rendering based on Type */}
                            {qType === QuestionType.MULTIPLE_CHOICE && (
                                <div className="space-y-3 mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Các phương án (Chọn đáp án đúng)</label>
                                    {qOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input 
                                                type="radio" 
                                                name="correctAnswer" 
                                                checked={qCorrect === opt && opt !== ''} 
                                                onChange={() => setQCorrect(opt)}
                                                className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                            />
                                            <input 
                                                type="text" 
                                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {qType === QuestionType.TRUE_FALSE && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Đáp án đúng</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={qCorrect}
                                        onChange={(e) => setQCorrect(e.target.value)}
                                    >
                                        <option value="">-- Chọn đáp án --</option>
                                        <option value="Đúng">Đúng</option>
                                        <option value="Sai">Sai</option>
                                    </select>
                                </div>
                            )}

                            {(qType === QuestionType.SHORT_ANSWER || qType === QuestionType.SHORT_ESSAY) && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                        {qType === QuestionType.SHORT_ANSWER ? 'Đáp án đúng' : 'Từ khóa chấm điểm (Cách nhau bởi dấu phẩy)'}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={qType === QuestionType.SHORT_ANSWER ? qCorrect : qKeywords}
                                        onChange={(e) => qType === QuestionType.SHORT_ANSWER ? setQCorrect(e.target.value) : setQKeywords(e.target.value)}
                                        placeholder={qType === QuestionType.SHORT_ANSWER ? "Nhập đáp án chính xác..." : "VD: input, số nguyên, danh sách"}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={resetQuestionForm}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleSaveQuestion}
                                    className="px-8 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg"
                                >
                                    {editingQId ? 'Cập nhật' : 'Lưu câu hỏi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* ... Other Tabs Content ... */}
          {activeTab === 'code_problems' && (
              <div className="space-y-8">
                  {/* ... Code Generator Code ... */}
                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-100 relative overflow-hidden">
                      {/* ... Header ... */}
                      <h3 className="font-bold text-2xl text-indigo-900 mb-6 flex items-center relative z-10">
                          <i className="fas fa-robot text-indigo-500 mr-3"></i> 
                          AI Exercise Generator
                      </h3>
                      {/* ... Inputs ... */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div>
                              <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Chủ đề bài tập</label>
                              <input 
                                  type="text" 
                                  value={codeTopic}
                                  onChange={(e) => setCodeTopic(e.target.value)}
                                  className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:bg-white focus:outline-none"
                              />
                          </div>
                          {/* ... Other inputs ... */}
                      </div>
                      <div className="mt-6 flex justify-end">
                          <button 
                              onClick={handleGenerateCodeProblems}
                              className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                          >
                              {isGeneratingCode ? "Đang tạo..." : "Tạo bài tập"}
                          </button>
                      </div>
                  </div>
                  {/* ... Results ... */}
              </div>
          )}

          {/* SYSTEM BACKUP TAB */}
          {activeTab === 'system' && (
              <div className="space-y-8 animate-fade-in">
                  {/* Backup Card */}
                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 z-0"></div>
                      <div className="relative z-10">
                          <h3 className="text-2xl font-black text-gray-800 mb-4 flex items-center">
                              <i className="fas fa-database text-slate-600 mr-3"></i> Sao lưu dữ liệu hệ thống
                          </h3>
                          <p className="text-gray-500 mb-8 max-w-2xl leading-relaxed">
                              Tạo bản sao an toàn cho toàn bộ cơ sở dữ liệu của hệ thống.
                          </p>
                          
                          <div className="flex flex-wrap gap-4">
                              <button 
                                  onClick={handleSystemBackup}
                                  className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold shadow-xl hover:bg-slate-900 transition-all transform hover:-translate-y-1 flex items-center"
                              >
                                  <i className="fas fa-download mr-3"></i> Tải xuống bản sao lưu
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
