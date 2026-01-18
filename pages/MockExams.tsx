
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Question, QuestionType, Level, LEVEL_LABELS, Attempt, User, Role } from '../types';

interface ExamConfig {
    id: string;
    title: string;
    type: 'REGULAR' | 'MID_TERM' | 'FINAL_TERM';
    duration: number; // minutes
    questionCount: number;
    targetMonths: number[]; // Months to pull questions from
    color: string;
    icon: string;
}

// CẤU HÌNH ĐỀ THI (Updated Durations & Months)
const EXAM_CONFIGS: ExamConfig[] = [
    { id: 'TX1', title: 'Thường xuyên 1', type: 'REGULAR', duration: 3, questionCount: 15, targetMonths: [9], color: 'blue', icon: 'fa-star-half-alt' },
    { id: 'TX2', title: 'Thường xuyên 2', type: 'REGULAR', duration: 3, questionCount: 15, targetMonths: [10], color: 'cyan', icon: 'fa-star-half-alt' },
    { id: 'TX3', title: 'Thường xuyên 3', type: 'REGULAR', duration: 3, questionCount: 15, targetMonths: [11], color: 'indigo', icon: 'fa-star-half-alt' },
    { id: 'GK1', title: 'Giữa kỳ 1', type: 'MID_TERM', duration: 5, questionCount: 30, targetMonths: [9, 10], color: 'orange', icon: 'fa-adjust' },
    { id: 'CK1', title: 'Cuối kỳ 1', type: 'FINAL_TERM', duration: 7, questionCount: 40, targetMonths: [9, 10, 11, 12], color: 'red', icon: 'fa-circle' },
];

const MockExams = () => {
  const { questions, topics, currentUser, saveAttempt, attempts, users } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(10);
  const [mode, setMode] = useState<'MENU' | 'DOING' | 'RESULT'>('MENU');
  const [menuTab, setMenuTab] = useState<'LIST' | 'STATS'>('LIST'); // Tab: Danh sách đề | Thống kê
  
  // Test State
  const [currentConfig, setCurrentConfig] = useState<ExamConfig | null>(null);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Seconds
  const resultRef = useRef<HTMLDivElement>(null);

  // Anti-Cheat State
  const [violationCount, setViolationCount] = useState(0);

  const isAdminOrTeacher = currentUser?.role === Role.ADMIN || currentUser?.role === Role.TEACHER;

  // Scroll to top on result
  useEffect(() => {
      if (mode === 'RESULT' && resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [mode]);

  // TIMER LOGIC
  useEffect(() => {
      let timer: any;
      if (mode === 'DOING' && timeLeft > 0) {
          timer = setInterval(() => {
              setTimeLeft((prev) => prev - 1);
          }, 1000);
      } else if (mode === 'DOING' && timeLeft === 0) {
          // Time's up!
          clearInterval(timer);
          handleSubmit(true); // true = auto submit
      }
      return () => clearInterval(timer);
  }, [mode, timeLeft]);

  // ANTI-CHEAT LOGIC: Listen for Visibility Change & Interactions
  useEffect(() => {
      if (mode !== 'DOING') return;

      const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
              setViolationCount(prev => prev + 1);
          }
      };

      const handleCopy = (e: any) => {
          e.preventDefault();
          alert("Hệ thống chống gian lận: Chức năng Copy bị khóa!");
      };

      const handleContextMenu = (e: any) => {
          e.preventDefault();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          document.removeEventListener("copy", handleCopy);
          document.removeEventListener("contextmenu", handleContextMenu);
      };
  }, [mode]);

  // ANTI-CHEAT LOGIC: Handle Violation Count
  useEffect(() => {
      if (mode === 'DOING' && violationCount > 0) {
          if (violationCount >= 3) {
              alert("BẠN ĐÃ VI PHẠM QUY CHẾ (RỜI KHỎI MÀN HÌNH) QUÁ 3 LẦN.\nHỆ THỐNG SẼ TỰ ĐỘNG NỘP BÀI NGAY LẬP TỨC.");
              handleSubmit(true);
          } else {
              alert(`CẢNH BÁO GIAN LẬN (${violationCount}/3):\nHệ thống phát hiện bạn vừa rời khỏi màn hình thi.\nNếu vi phạm 3 lần, bài thi sẽ bị hủy hoặc tự động nộp.`);
          }
      }
  }, [violationCount, mode]);


  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- STATISTICS LOGIC ---
  const getMockAttempts = () => {
      // Lọc các lần thi thử (topicId bắt đầu bằng MOCK_)
      return attempts.filter(a => a.topicId && a.topicId.startsWith('MOCK_'));
  };

  const mockAttempts = getMockAttempts();

  // Export Excel Function
  const handleExportExcel = () => {
      const XLSX = (window as any).XLSX;
      if (!XLSX) {
          alert("Thư viện Excel chưa được tải. Vui lòng kiểm tra kết nối mạng.");
          return;
      }

      // Lọc dữ liệu: Admin thấy hết, Học sinh chỉ thấy của mình
      const attemptsToExport = isAdminOrTeacher 
          ? mockAttempts 
          : mockAttempts.filter(a => a.userId === currentUser?.id);

      if (attemptsToExport.length === 0) {
          alert("Không có dữ liệu thi thử để xuất.");
          return;
      }

      const exportData = attemptsToExport.map(a => {
          const user = users.find(u => u.id === a.userId);
          const parts = a.topicId?.split('_') || [];
          const examId = parts[1]; // e.g., TX1
          const grade = parts[2]?.replace('G', ''); // e.g., 10
          const examConfig = EXAM_CONFIGS.find(c => c.id === examId);

          return {
              'ID Lượt thi': a.id,
              'Họ và tên': user ? user.name : 'Unknown',
              'Email': user ? user.email : 'Unknown',
              'Đề thi': examConfig ? examConfig.title : examId,
              'Khối': grade,
              'Điểm số (Thang 10)': a.score,
              'Kết quả': a.passed ? 'Đạt' : 'Không đạt',
              'Ngày thi': new Date(a.date).toLocaleString('vi-VN')
          };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      // Auto-width columns
      const wscols = [
          { wch: 15 }, // ID
          { wch: 25 }, // Name
          { wch: 25 }, // Email
          { wch: 20 }, // Exam
          { wch: 10 }, // Grade
          { wch: 15 }, // Score
          { wch: 15 }, // Result
          { wch: 20 }, // Date
      ];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KetQuaThiThu");
      XLSX.writeFile(workbook, `KetQua_ThiThu_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // --- LOGIC: GENERATE EXAM ---
  const handleStartExam = (config: ExamConfig) => {
      // 1. Identify valid topics for this grade and specific months
      const validTopicIds = topics
          .filter(t => t.grade === selectedGrade && config.targetMonths.includes(t.month))
          .map(t => t.id);

      if (validTopicIds.length === 0) {
          alert(`Chưa có dữ liệu chủ đề cho ${config.title} Khối ${selectedGrade}.`);
          return;
      }

      // 2. Filter Questions belonging to these topics
      let validQuestions = questions.filter(q => 
          q.topicId && validTopicIds.includes(q.topicId) && 
          (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE)
      );

      // 3. Randomize and Slice
      if (validQuestions.length < 5) {
           alert("Ngân hàng câu hỏi chưa đủ để tạo đề thi này.");
           return;
      }

      const selectedQuestions = validQuestions.sort(() => 0.5 - Math.random()).slice(0, config.questionCount);

      setTestQuestions(selectedQuestions);
      setCurrentConfig(config);
      setAnswers({});
      setScore(0);
      setTimeLeft(config.duration * 60); // Set Timer
      setViolationCount(0); // Reset Anti-Cheat
      setMode('DOING');
  };

  const handleAnswerSelect = (qId: string, value: string) => {
      if (mode === 'DOING') {
          setAnswers(prev => ({ ...prev, [qId]: value }));
      }
  };

  const handleSubmit = (isAutoSubmit = false) => {
      if (!currentConfig) return;

      let rawScore = 0;
      testQuestions.forEach(q => {
          if (answers[q.id] === q.correctAnswer) {
              rawScore++;
          }
      });

      // Calculate score on 10 scale
      const finalScore = testQuestions.length > 0 ? Number(((rawScore / testQuestions.length) * 10).toFixed(2)) : 0;
      
      setScore(finalScore);
      setMode('RESULT'); // Immediately show result

      if (isAutoSubmit) {
          // Alert is handled in effect or time check
      }

      // Save History
      if (currentUser) {
          const attempt: Attempt = {
              id: Date.now().toString(),
              userId: currentUser.id,
              topicId: `MOCK_${currentConfig.id}_G${selectedGrade}`, // Custom ID for mock exams
              score: finalScore,
              maxScore: 10,
              passed: finalScore >= 5,
              date: new Date().toISOString()
          };
          saveAttempt(attempt); 
      }
  };

  // --- DOWNLOAD TXT ---
  const handleDownloadTxt = (withAnswers: boolean) => {
      if (!currentConfig) return;

      let content = `ĐỀ THI: ${currentConfig.title} - KHỐI ${selectedGrade}\n`;
      content += `Môn: Tin học\n`;
      content += `Thời gian làm bài: ${currentConfig.duration} phút\n`;
      content += `Ngày thi: ${new Date().toLocaleDateString()}\n`;
      content += `=================================================\n\n`;

      testQuestions.forEach((q, idx) => {
          content += `Câu ${idx + 1}: ${q.content}\n`;
          
          if (q.type === QuestionType.MULTIPLE_CHOICE) {
              q.options?.forEach((opt, i) => {
                  const label = String.fromCharCode(65 + i);
                  content += `   ${label}. ${opt}\n`;
              });
          } else if (q.type === QuestionType.TRUE_FALSE) {
              content += `   [ ] Đúng    [ ] Sai\n`;
          }

          if (withAnswers) {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              content += `\n   -> ĐÁP ÁN ĐÚNG: ${q.correctAnswer}`;
              content += `\n   -> BẠN CHỌN:    ${userAnswer || '(Bỏ trống)'} [${isCorrect ? 'ĐÚNG' : 'SAI'}]`;
          }
          
          content += `\n\n-------------------------------------------------\n\n`;
      });

      if (withAnswers) {
          content += `\nKẾT QUẢ TỔNG HỢP:\n`;
          content += `Điểm số: ${score}/10\n`;
          const correctCount = testQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
          content += `Số câu đúng: ${correctCount}/${testQuestions.length}\n`;
      }

      const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DeThi_${currentConfig.id}_Khoi${selectedGrade}_${withAnswers ? 'KetQua' : 'DeBai'}.txt`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const getGradeTheme = (grade: number) => {
      switch(grade) {
          case 10: return { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
          case 11: return { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
          case 12: return { bg: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
          default: return { bg: 'bg-gray-600', light: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
      }
  };
  
  const theme = getGradeTheme(selectedGrade);

  // --- RENDER: MENU VIEW ---
  if (mode === 'MENU') {
      return (
          <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
              {/* Header */}
              <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden ${theme.bg}`}>
                  <div className="relative z-10">
                      <h2 className="text-4xl font-black mb-2 flex items-center">
                          <i className="fas fa-file-signature mr-4"></i>
                          THI THỬ & KIỂM TRA
                      </h2>
                      <p className="text-white/90 text-lg">Hệ thống tạo đề tự động bám sát chương trình học</p>
                  </div>
                  <i className="fas fa-graduation-cap absolute right-0 bottom-0 text-9xl opacity-10 transform translate-x-4 translate-y-4"></i>
              </div>

              {/* Menu Tabs */}
              <div className="flex justify-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-fit mx-auto">
                  <button
                      onClick={() => setMenuTab('LIST')}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center ${menuTab === 'LIST' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                      <i className="fas fa-list-ul mr-2"></i> Danh sách đề thi
                  </button>
                  <button
                      onClick={() => setMenuTab('STATS')}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center ${menuTab === 'STATS' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                      <i className="fas fa-chart-bar mr-2"></i> Thống kê & Xếp hạng
                  </button>
              </div>

              {/* CONTENT: EXAM LIST */}
              {menuTab === 'LIST' && (
                  <div className="animate-fade-in-up">
                      {/* Grade Selector */}
                      <div className="flex justify-center space-x-4 mb-8">
                          {[10, 11, 12].map((g) => (
                              <button
                                  key={g}
                                  onClick={() => setSelectedGrade(g as any)}
                                  className={`px-8 py-3 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-1 ${
                                      selectedGrade === g 
                                      ? `${getGradeTheme(g).bg} text-white shadow-lg scale-105` 
                                      : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-200'
                                  }`}
                              >
                                  Khối {g}
                              </button>
                          ))}
                      </div>

                      {/* Exam Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Regular Exams */}
                          <div className="lg:col-span-3">
                              <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4 ml-1">Đánh giá thường xuyên</h3>
                          </div>
                          {EXAM_CONFIGS.filter(c => c.type === 'REGULAR').map(config => (
                              <div key={config.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-brand-300 transition-all group flex flex-col">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 bg-${config.color}-50 text-${config.color}-600 group-hover:scale-110 transition-transform`}>
                                      <i className={`fas ${config.icon}`}></i>
                                  </div>
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{config.title}</h4>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-6">
                                      {/* Duration Hidden in Menu */}
                                      <span className="flex items-center"><i className="fas fa-list-ul mr-1.5"></i> {config.questionCount} câu</span>
                                  </div>
                                  <div className="mt-auto">
                                      <button 
                                        onClick={() => handleStartExam(config)}
                                        className={`w-full py-3 rounded-xl font-bold text-white transition-colors bg-${config.color}-500 hover:bg-${config.color}-600 shadow-md`}
                                      >
                                          Bắt đầu làm bài
                                      </button>
                                  </div>
                              </div>
                          ))}

                          {/* Periodic Exams */}
                          <div className="lg:col-span-3 mt-4">
                              <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4 ml-1">Đánh giá định kỳ</h3>
                          </div>
                          {EXAM_CONFIGS.filter(c => c.type !== 'REGULAR').map(config => (
                              <div key={config.id} className={`bg-white p-6 rounded-2xl shadow-md border-2 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden ${config.type === 'FINAL_TERM' ? 'border-red-100' : 'border-orange-100'}`}>
                                  {/* Decorative Background */}
                                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${config.color}-50 rounded-bl-full -mr-10 -mt-10 opacity-50`}></div>
                                  
                                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 relative z-10 bg-${config.color}-100 text-${config.color}-600`}>
                                      <i className={`fas ${config.icon}`}></i>
                                  </div>
                                  <h4 className="text-2xl font-black text-gray-800 mb-2 relative z-10">{config.title}</h4>
                                  <p className="text-sm text-gray-500 mb-6 relative z-10">
                                      Tổng hợp kiến thức {config.targetMonths.map(m => `Tháng ${m}`).join(', ')}.
                                  </p>
                                  
                                  {/* Duration Hidden in Menu */}
                                  <div className="flex gap-4 mb-6 relative z-10">
                                      <div className="bg-gray-50 p-2 rounded-lg text-center flex-1">
                                          <p className="text-[10px] text-gray-400 uppercase font-bold">Số câu</p>
                                          <p className="font-bold text-gray-800">{config.questionCount}</p>
                                      </div>
                                  </div>

                                  <div className="mt-auto relative z-10">
                                      <button 
                                        onClick={() => handleStartExam(config)}
                                        className={`w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] bg-${config.color}-600 hover:bg-${config.color}-700 shadow-lg`}
                                      >
                                          Làm bài ngay
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* CONTENT: STATISTICS */}
              {menuTab === 'STATS' && (
                  <div className="animate-fade-in-up space-y-8">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {(() => {
                              // Filter attempts: Admin sees all, Student sees own
                              const myFilteredAttempts = isAdminOrTeacher ? mockAttempts : mockAttempts.filter(a => a.userId === currentUser?.id);
                              
                              const totalTaken = myFilteredAttempts.length;
                              const avgScore = totalTaken > 0 ? (myFilteredAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalTaken).toFixed(1) : 0;
                              const passed = myFilteredAttempts.filter(a => a.passed).length;
                              const highest = totalTaken > 0 ? Math.max(...myFilteredAttempts.map(a => a.score)) : 0;

                              return (
                                  <>
                                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                          <p className="text-gray-500 text-xs font-bold uppercase">Tổng lượt thi</p>
                                          <p className="text-3xl font-black text-gray-800 mt-1">{totalTaken}</p>
                                      </div>
                                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                          <p className="text-gray-500 text-xs font-bold uppercase">Điểm trung bình</p>
                                          <p className="text-3xl font-black text-blue-600 mt-1">{avgScore}</p>
                                      </div>
                                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                          <p className="text-gray-500 text-xs font-bold uppercase">Số lần đạt (>5)</p>
                                          <p className="text-3xl font-black text-green-600 mt-1">{passed}</p>
                                      </div>
                                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                          <p className="text-gray-500 text-xs font-bold uppercase">Điểm cao nhất</p>
                                          <p className="text-3xl font-black text-orange-500 mt-1">{highest}</p>
                                      </div>
                                  </>
                              )
                          })()}
                      </div>

                      {/* Export Button */}
                      <div className="flex justify-end">
                          <button 
                              onClick={handleExportExcel}
                              className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg flex items-center transition-transform hover:-translate-y-0.5"
                          >
                              <i className="fas fa-file-excel mr-2"></i> Xuất kết quả ra Excel
                          </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Leaderboard */}
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                              <div className="p-6 border-b border-gray-100 bg-yellow-50 flex justify-between items-center">
                                  <h3 className="font-bold text-gray-800 flex items-center">
                                      <i className="fas fa-trophy text-yellow-500 mr-2"></i> Bảng Xếp Hạng Thi Thử
                                  </h3>
                                  <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Top 10</span>
                              </div>
                              <div className="p-2">
                                  {(() => {
                                      // Calculate aggregate scores for leaderboard
                                      const userStats: Record<string, {name: string, totalScore: number, attempts: number}> = {};
                                      
                                      // Consider ALL mock attempts for leaderboard (Global ranking)
                                      mockAttempts.forEach(a => {
                                          if (!userStats[a.userId]) {
                                              const user = users.find(u => u.id === a.userId);
                                              userStats[a.userId] = { name: user?.name || 'Unknown', totalScore: 0, attempts: 0 };
                                          }
                                          userStats[a.userId].totalScore += a.score;
                                          userStats[a.userId].attempts += 1;
                                      });

                                      const leaderboard = Object.values(userStats)
                                          .sort((a, b) => b.totalScore - a.totalScore)
                                          .slice(0, 10);

                                      if (leaderboard.length === 0) return <p className="p-6 text-center text-gray-400 italic">Chưa có dữ liệu xếp hạng.</p>;

                                      return leaderboard.map((stat, idx) => (
                                          <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3 ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                  {idx + 1}
                                              </div>
                                              <div className="flex-1">
                                                  <p className="font-bold text-sm text-gray-800">{stat.name}</p>
                                                  <p className="text-[10px] text-gray-500">{stat.attempts} lần thi</p>
                                              </div>
                                              <div className="text-right">
                                                  <p className="font-black text-brand-600">{stat.totalScore.toFixed(1)}</p>
                                                  <p className="text-[9px] text-gray-400 uppercase">Tổng điểm</p>
                                              </div>
                                          </div>
                                      ));
                                  })()}
                              </div>
                          </div>

                          {/* Recent History Table */}
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                              <div className="p-6 border-b border-gray-100 bg-gray-50">
                                  <h3 className="font-bold text-gray-800 flex items-center">
                                      <i className="fas fa-history text-gray-500 mr-2"></i> Lịch sử thi gần đây
                                  </h3>
                              </div>
                              <div className="flex-1 overflow-y-auto max-h-[400px]">
                                  {(() => {
                                      // Get history list
                                      const historyList = (isAdminOrTeacher ? mockAttempts : mockAttempts.filter(a => a.userId === currentUser?.id))
                                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                          .slice(0, 20); // Show last 20

                                      if (historyList.length === 0) return <p className="p-6 text-center text-gray-400 italic">Chưa có lịch sử thi.</p>;

                                      return (
                                          <table className="w-full text-left border-collapse">
                                              <thead className="bg-gray-50 sticky top-0 text-xs font-bold text-gray-500 uppercase">
                                                  <tr>
                                                      <th className="p-4">Đề thi</th>
                                                      <th className="p-4">Điểm</th>
                                                      <th className="p-4">Ngày</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="text-sm">
                                                  {historyList.map(a => {
                                                      const parts = a.topicId?.split('_') || [];
                                                      const examId = parts[1];
                                                      const config = EXAM_CONFIGS.find(c => c.id === examId);
                                                      return (
                                                          <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                              <td className="p-4 font-medium text-gray-800">
                                                                  {config ? config.title : examId}
                                                                  {isAdminOrTeacher && <div className="text-[10px] text-gray-400 font-normal">{users.find(u => u.id === a.userId)?.name}</div>}
                                                              </td>
                                                              <td className="p-4">
                                                                  <span className={`font-bold ${a.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                                                      {a.score}
                                                                  </span>
                                                              </td>
                                                              <td className="p-4 text-gray-500 text-xs">
                                                                  {new Date(a.date).toLocaleDateString('vi-VN')}
                                                              </td>
                                                          </tr>
                                                      );
                                                  })}
                                              </tbody>
                                          </table>
                                      );
                                  })()}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- RENDER: DOING TEST ---
  if (mode === 'DOING' && currentConfig) {
      const answeredCount = Object.keys(answers).length;
      const progress = (answeredCount / testQuestions.length) * 100;

      return (
          <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-fade-in relative pt-4">
              
              {/* Left: Questions Area */}
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                  
                  {/* UPGRADED ANTI-CHEAT BAR - Sticky at top of the panel */}
                  {violationCount > 0 && (
                      <div className="w-full bg-red-600 text-white px-6 py-4 shadow-lg flex items-center justify-between animate-pulse border-b-4 border-red-800 z-50">
                          <div className="flex items-center">
                              <div className="w-12 h-12 bg-red-800 rounded-full flex items-center justify-center mr-4 shadow-inner border-2 border-red-500">
                                  <i className="fas fa-exclamation-triangle text-yellow-400 text-2xl"></i>
                              </div>
                              <div>
                                  <h4 className="font-black text-lg uppercase tracking-wide">Cảnh báo gian lận!</h4>
                                  <p className="text-sm text-red-100 font-medium">Hệ thống phát hiện bạn đã rời khỏi màn hình.</p>
                              </div>
                          </div>
                          <div className="text-right bg-red-800/50 px-4 py-2 rounded-lg border border-red-500/50">
                              <p className="text-[10px] uppercase font-bold text-red-200 mb-0.5">Số lần vi phạm</p>
                              <div className="text-3xl font-black leading-none">{violationCount}<span className="text-lg text-red-300">/3</span></div>
                          </div>
                      </div>
                  )}

                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg">{currentConfig.title} - Khối {selectedGrade}</h3>
                          <p className="text-xs text-gray-500">Môn Tin học</p>
                      </div>
                      <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleDownloadTxt(false)}
                            className="bg-white border border-brand-200 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors flex items-center shadow-sm"
                          >
                              <i className="fas fa-download mr-1.5"></i> Tải đề
                          </button>
                          
                          {/* COUNTDOWN TIMER */}
                          <div className={`text-xl font-black px-4 py-2 rounded-xl shadow-inner flex items-center transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              <i className={`fas fa-clock mr-2 ${timeLeft < 60 ? 'animate-spin' : ''}`}></i>
                              {formatTime(timeLeft)}
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      {testQuestions.map((q, idx) => (
                          <div key={q.id} id={`q-${idx}`} className="group">
                              <div className="flex gap-4">
                                  <span className="text-brand-600 font-black text-lg w-8 shrink-0">
                                      {idx + 1}.
                                  </span>
                                  <div className="flex-1">
                                      <p className="font-medium text-gray-800 text-base mb-4 leading-relaxed">{q.content}</p>
                                      
                                      {q.type === QuestionType.MULTIPLE_CHOICE && (
                                          <div className="grid grid-cols-1 gap-3">
                                              {q.options?.map((opt, i) => (
                                                  <label 
                                                      key={i} 
                                                      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                                                          answers[q.id] === opt 
                                                          ? 'border-brand-500 bg-brand-50' 
                                                          : 'border-gray-200'
                                                      }`}
                                                  >
                                                      <input 
                                                          type="radio" 
                                                          name={q.id} 
                                                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                                                          checked={answers[q.id] === opt}
                                                          onChange={() => handleAnswerSelect(q.id, opt)}
                                                      />
                                                      <span className="ml-3 text-sm text-gray-700">{opt}</span>
                                                  </label>
                                              ))}
                                          </div>
                                      )}

                                      {q.type === QuestionType.TRUE_FALSE && (
                                          <div className="flex gap-4">
                                              {['Đúng', 'Sai'].map(opt => (
                                                  <label 
                                                      key={opt}
                                                      className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all font-bold ${
                                                          answers[q.id] === opt 
                                                          ? (opt === 'Đúng' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                                                          : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                                      }`}
                                                  >
                                                      <input 
                                                          type="radio" 
                                                          name={q.id} 
                                                          className="hidden"
                                                          checked={answers[q.id] === opt}
                                                          onChange={() => handleAnswerSelect(q.id, opt)}
                                                      />
                                                      {opt}
                                                  </label>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Right: Answer Sheet & Controls */}
              <div className="w-full md:w-72 flex flex-col gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                      <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                          <i className="fas fa-th mr-2"></i> Phiếu trả lời
                      </h4>
                      <div className="grid grid-cols-5 gap-2 content-start flex-1 overflow-y-auto max-h-[400px]">
                          {testQuestions.map((q, idx) => (
                              <a 
                                  href={`#q-${idx}`}
                                  key={idx}
                                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                      answers[q.id] 
                                      ? 'bg-brand-600 text-white shadow-md' 
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                              >
                                  {idx + 1}
                              </a>
                          ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Tiến độ</span>
                              <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
                              <div className="h-full bg-brand-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                          </div>
                          
                          <button 
                              onClick={() => { if(window.confirm('Bạn có chắc chắn muốn nộp bài? Hệ thống sẽ tự động chấm điểm ngay.')) handleSubmit(); }}
                              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all"
                          >
                              Nộp bài & Chấm điểm
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: RESULT VIEW ---
  if (mode === 'RESULT' && currentConfig) {
      const correctCount = testQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
      const isPass = score >= 5;
      
      return (
          <div ref={resultRef} className="max-w-4xl mx-auto py-8 animate-fade-in-up space-y-8">
              {/* SUMMARY CARD */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center relative">
                  {/* Decorative Background */}
                  <div className={`absolute top-0 left-0 right-0 h-40 opacity-10 ${isPass ? 'bg-[radial-gradient(circle,rgba(34,197,94,1)_0%,rgba(255,255,255,0)_70%)]' : 'bg-[radial-gradient(circle,rgba(239,68,68,1)_0%,rgba(255,255,255,0)_70%)]'}`}></div>
                  
                  <div className="p-10 relative z-10">
                      <div className="mb-4">
                          {isPass ? (
                              <div className="inline-block p-4 rounded-full bg-yellow-100 shadow-inner">
                                  <i className="fas fa-trophy text-5xl text-yellow-500 animate-bounce"></i>
                              </div>
                          ) : (
                              <div className="inline-block p-4 rounded-full bg-gray-100 shadow-inner">
                                  <i className="fas fa-book-reader text-5xl text-gray-400"></i>
                              </div>
                          )}
                      </div>

                      <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase">
                          {score >= 8 ? 'Xuất sắc!' : score >= 5 ? 'Đạt yêu cầu' : 'Cần cố gắng hơn'}
                      </h2>
                      
                      {/* Score Circle */}
                      <div className="my-8 flex justify-center items-center">
                          <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl ring-8 ring-white transition-transform hover:scale-105 ${isPass ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                              <span className="text-6xl font-black text-white">{score}</span>
                              <span className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Thang điểm 10</span>
                          </div>
                      </div>

                      {/* Stats Bar */}
                      <div className="max-w-md mx-auto mb-8">
                          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                              <span>Kết quả chi tiết</span>
                              <span>{correctCount}/{testQuestions.length} câu đúng</span>
                          </div>
                          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${isPass ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${(correctCount / testQuestions.length) * 100}%` }}
                              ></div>
                          </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-4">
                          <button 
                              onClick={() => setMode('MENU')}
                              className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                              <i className="fas fa-arrow-left mr-2"></i> Danh sách
                          </button>
                          <button 
                              onClick={() => handleDownloadTxt(true)}
                              className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center transform hover:-translate-y-0.5"
                          >
                              <i className="fas fa-file-download mr-2"></i> Tải đáp án chi tiết
                          </button>
                          <button 
                              onClick={() => handleStartExam(currentConfig)}
                              className="px-6 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5"
                          >
                              <i className="fas fa-redo mr-2"></i> Làm lại đề này
                          </button>
                      </div>
                  </div>
              </div>

              {/* DETAILED REVIEW LIST */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 flex items-center text-lg">
                          <i className="fas fa-list-check mr-3 text-brand-600"></i>
                          Chi tiết bài làm
                      </h3>
                      <div className="flex space-x-3 text-xs font-bold">
                          <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full"><i className="fas fa-check mr-1.5"></i> Đúng</span>
                          <span className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full"><i className="fas fa-times mr-1.5"></i> Sai</span>
                      </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                      {testQuestions.map((q, idx) => {
                          const userAnswer = answers[q.id];
                          const isCorrect = userAnswer === q.correctAnswer;
                          
                          return (
                              <div key={q.id} className={`p-6 transition-colors ${isCorrect ? 'bg-white' : 'bg-red-50/40'}`}>
                                  <div className="flex gap-4">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border-2 ${isCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-red-500 text-red-700'}`}>
                                          {idx + 1}
                                      </div>
                                      <div className="flex-1">
                                          <p className="font-medium text-gray-800 mb-4 text-base">{q.content}</p>
                                          
                                          {/* Options Display */}
                                          {q.type === QuestionType.MULTIPLE_CHOICE && (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                  {q.options?.map((opt, i) => {
                                                      const isSelected = userAnswer === opt;
                                                      const isKey = q.correctAnswer === opt;
                                                      
                                                      let itemClass = "border-gray-200 text-gray-500 opacity-80 bg-white";
                                                      let icon = null;

                                                      if (isKey) {
                                                          itemClass = "border-green-500 bg-green-50 text-green-800 font-bold opacity-100 ring-1 ring-green-500";
                                                          icon = <i className="fas fa-check-circle text-green-600 ml-auto text-lg"></i>;
                                                      } else if (isSelected && !isKey) {
                                                          itemClass = "border-red-500 bg-white text-red-700 font-bold opacity-100 ring-1 ring-red-500";
                                                          icon = <i className="fas fa-times-circle text-red-600 ml-auto text-lg"></i>;
                                                      }

                                                      return (
                                                          <div key={i} className={`px-4 py-3 border rounded-xl text-sm flex items-center transition-all ${itemClass}`}>
                                                              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs mr-3 shrink-0">
                                                                  {String.fromCharCode(65+i)}
                                                              </span>
                                                              {opt}
                                                              {icon}
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          )}
                                          
                                          {/* True/False Display */}
                                          {q.type === QuestionType.TRUE_FALSE && (
                                               <div className="flex gap-4 mt-2">
                                                   {['Đúng', 'Sai'].map(opt => {
                                                       const isSelected = userAnswer === opt;
                                                       const isKey = q.correctAnswer === opt;
                                                       let itemClass = "bg-white border-gray-200 text-gray-400";
                                                       let icon = null;
                                                       
                                                       if (isKey) {
                                                           itemClass = "bg-green-100 border-green-500 text-green-800 font-bold shadow-sm";
                                                           icon = <i className="fas fa-check ml-2"></i>;
                                                       }
                                                       else if (isSelected && !isKey) {
                                                           itemClass = "bg-red-50 border-red-500 text-red-800 font-bold shadow-sm";
                                                           icon = <i className="fas fa-times ml-2"></i>;
                                                       }

                                                       return (
                                                           <div key={opt} className={`px-6 py-3 border rounded-xl text-sm min-w-[120px] text-center flex items-center justify-center ${itemClass}`}>
                                                               {opt}
                                                               {icon}
                                                           </div>
                                                       )
                                                   })}
                                               </div>
                                          )}
                                          
                                          {!isCorrect && (
                                              <div className="mt-4 text-xs font-bold text-red-600 flex items-center bg-red-100 w-fit px-3 py-1.5 rounded-lg">
                                                  <i className="fas fa-exclamation-triangle mr-2"></i>
                                                  Bạn chọn sai. Đáp án đúng là: {q.correctAnswer}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

export default MockExams;
