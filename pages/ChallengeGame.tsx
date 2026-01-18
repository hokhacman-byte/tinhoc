
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Question, QuestionType, Level, LEVEL_LABELS, Attempt } from '../types';

// Full 5 Levels for the Challenge Game
const LEVEL_ORDER = [Level.INTRO, Level.ELEMENTARY, Level.INTERMEDIATE, Level.ADVANCED, Level.EXPERT];

const ChallengeGame = () => {
  const { questions, topics, saveAttempt, currentUser, attempts } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  
  // Swap/Skip Lifeline
  const [swapsLeft, setSwapsLeft] = useState(2); // 2 swaps per game session

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  // --- LOGIC: GAME PROGRESSION ---
  const isLevelUnlocked = (level: Level) => {
      if (!currentUser) return false;
      if (level === Level.INTRO) return true; // Level 1 always open
      
      const prevLevelIndex = LEVEL_ORDER.indexOf(level) - 1;
      const prevLevel = LEVEL_ORDER[prevLevelIndex];
      
      // Must have passed previous level
      return currentUser.completedLevels.includes(prevLevel);
  };

  const handleStartLevel = (level: Level) => {
      if (!selectedTopicId) return;

      const levelQuestions = questions.filter(q => q.topicId === selectedTopicId && q.level === level);

      // Randomly select 5 questions
      const quizQuestions = levelQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);

      if (quizQuestions.length === 0) {
          alert(`Chưa có đủ câu hỏi cho cấp độ ${LEVEL_LABELS[level]} của chủ đề này.`);
          return;
      }

      setCurrentQuiz(quizQuestions);
      setActiveLevel(level);
      setAnswers({});
      setShowResult(false);
      setScore(0);
      setSwapsLeft(2); // Reset swaps for new game
  };

  const handleSwap = (qId: string) => {
      if (swapsLeft <= 0 || !activeLevel || !selectedTopicId) return;

      // Find available replacements: Same Topic, Same Level, NOT in current list
      const currentIds = currentQuiz.map(q => q.id);
      const candidates = questions.filter(q => 
          q.topicId === selectedTopicId && 
          q.level === activeLevel && 
          !currentIds.includes(q.id)
      );

      if (candidates.length === 0) {
          alert("Hết câu hỏi dự phòng để đổi!");
          return;
      }

      // Pick random
      const newQuestion = candidates[Math.floor(Math.random() * candidates.length)];

      // Replace
      setCurrentQuiz(prev => prev.map(q => q.id === qId ? newQuestion : q));
      
      // Decrement swaps
      setSwapsLeft(prev => prev - 1);
      
      // Clear answer for this slot if any (keyed by Question ID, so naturally cleared since ID changes)
      setAnswers(prev => {
          const next = {...prev};
          delete next[qId];
          return next;
      });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
      let calculatedScore = 0;
      const maxScore = currentQuiz.length;

      currentQuiz.forEach(q => {
          const userAnswer = answers[q.id]?.trim().toLowerCase();
          const correct = q.correctAnswer?.trim().toLowerCase();

          if (q.type === QuestionType.MULTIPLE_CHOICE) {
              if (userAnswer === correct) calculatedScore++;
          } else if (q.type === QuestionType.SHORT_ANSWER) {
              if (userAnswer === correct) calculatedScore++;
          } else if (q.type === QuestionType.SHORT_ESSAY) {
              if (q.keywords && q.keywords.length > 0) {
                  const foundKeywords = q.keywords.filter(k => userAnswer?.includes(k.toLowerCase()));
                  if (foundKeywords.length >= 1) {
                      calculatedScore++;
                  }
              }
          } else if (q.type === QuestionType.TRUE_FALSE) {
              if (userAnswer === correct) calculatedScore++;
          }
      });

      setScore(calculatedScore);
      setShowResult(true);

      // Requirement: Pass if >= 2/5 (Updated from 4)
      const isPass = calculatedScore >= 2;

      if (currentUser && selectedTopicId && activeLevel) {
          const attempt: Attempt = {
              id: Date.now().toString(),
              userId: currentUser.id,
              topicId: selectedTopicId,
              level: activeLevel,
              score: calculatedScore,
              maxScore: maxScore,
              passed: isPass,
              date: new Date().toISOString()
          };
          saveAttempt(attempt);
      }
  };

  const closeQuiz = () => {
      setCurrentQuiz([]);
      setActiveLevel(null);
      setShowResult(false);
      setAnswers({});
  };

  // --- RENDER: RESULT SCREEN ---
  if (showResult && activeLevel) {
      const isPass = score >= 2;
      const nextLevelIndex = LEVEL_ORDER.indexOf(activeLevel) + 1;
      
      return (
          <div className="max-w-4xl mx-auto mt-8 px-4 pb-20 animate-fade-in-up">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-4 ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-xl ring-4 ring-white ${isPass ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-gradient-to-br from-red-400 to-red-600 text-white'}`}>
                      <i className={`fas ${isPass ? 'fa-crown' : 'fa-heart-broken'}`}></i>
                  </div>
                  
                  <h2 className="text-3xl font-black text-gray-800 mb-2">{isPass ? 'CHINH PHỤC THÀNH CÔNG!' : 'CHƯA VƯỢT QUA'}</h2>
                  <p className="text-gray-500 mb-8 text-lg">
                      {isPass 
                        ? `Tuyệt vời! Bạn đã vượt qua cấp độ ${LEVEL_LABELS[activeLevel]}` 
                        : `Bạn cần đạt ít nhất 2/5 điểm để qua màn. Hãy thử lại nhé!`}
                  </p>
                  
                  <div className="flex justify-center gap-6 mb-8">
                      <div className="text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Điểm số</p>
                          <p className={`text-4xl font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>{score}/5</p>
                      </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                      <button onClick={closeQuiz} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                          <i className="fas fa-map mr-2"></i> Về bản đồ
                      </button>
                      <button 
                        onClick={() => handleStartLevel(activeLevel!)} 
                        className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg"
                      >
                          <i className="fas fa-redo mr-2"></i> Làm lại
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: DOING QUIZ ---
  if (selectedTopicId && activeLevel && currentQuiz.length > 0) {
    return (
      <div className="max-w-3xl mx-auto mt-4 px-4 pb-24">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg sticky top-4 z-30 flex justify-between items-center mb-8">
            <div className="flex items-center">
                <button onClick={closeQuiz} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors mr-3">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                    <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Cấp độ: {LEVEL_LABELS[activeLevel]}</p>
                    <p className="font-bold text-lg leading-none">Thử thách 5 câu</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-black text-2xl leading-none">
                    {Object.keys(answers).length}<span className="text-white/60 text-lg">/5</span>
                </span>
            </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
            {currentQuiz.map((q, idx) => (
                <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 relative group">
                    {/* Swap Button */}
                    {swapsLeft > 0 && (
                        <div className="absolute top-4 right-4">
                            <button 
                                onClick={() => handleSwap(q.id)}
                                className="bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors shadow-sm flex items-center"
                                title="Đổi sang câu hỏi khác (Nếu bạn thấy câu này quá khó)"
                            >
                                <i className="fas fa-exchange-alt mr-1.5"></i> Đổi câu ({swapsLeft})
                            </button>
                        </div>
                    )}

                    <div className="flex gap-4 mb-4 pr-20">
                        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-black flex items-center justify-center shrink-0 text-sm">
                            {idx + 1}
                        </span>
                        <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                                q.type === QuestionType.MULTIPLE_CHOICE ? 'bg-blue-100 text-blue-700' :
                                q.type === QuestionType.TRUE_FALSE ? 'bg-green-100 text-green-700' :
                                q.type === QuestionType.SHORT_ANSWER ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                {q.type === QuestionType.MULTIPLE_CHOICE ? 'Trắc nghiệm' : 
                                 q.type === QuestionType.TRUE_FALSE ? 'Đúng/Sai' :
                                 q.type === QuestionType.SHORT_ANSWER ? 'Trả lời ngắn' : 'Tự luận'}
                            </span>
                            <h3 className="font-bold text-gray-800">{q.content}</h3>
                        </div>
                    </div>

                    <div className="ml-12">
                        {q.type === QuestionType.MULTIPLE_CHOICE && (
                            <div className="grid grid-cols-1 gap-2">
                                {q.options?.map((opt, i) => {
                                    const isSelected = answers[q.id] === opt;
                                    return (
                                        <div 
                                            key={i}
                                            onClick={() => handleAnswerChange(q.id, opt)}
                                            className={`
                                                flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all
                                                ${isSelected 
                                                    ? 'border-brand-500 bg-brand-50' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                                                {isSelected && <i className="fas fa-check text-white text-[10px]"></i>}
                                            </div>
                                            <span className={`font-medium text-sm ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{opt}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {q.type === QuestionType.SHORT_ANSWER && (
                            <input 
                                type="text"
                                placeholder="Nhập câu trả lời..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                        )}

                        {q.type === QuestionType.SHORT_ESSAY && (
                            <textarea 
                                rows={3}
                                placeholder="Viết câu trả lời..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                        )}
                        
                        {q.type === QuestionType.TRUE_FALSE && (
                            <div className="flex gap-4">
                                {['Đúng', 'Sai'].map((opt) => {
                                    const isSelected = answers[q.id] === opt;
                                    return (
                                        <button 
                                            key={opt}
                                            onClick={() => handleAnswerChange(q.id, opt)}
                                            className={`
                                                flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm
                                                ${isSelected 
                                                    ? (opt === 'Đúng' ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-red-500 text-white border-red-600 shadow-md') 
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {opt}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40">
            <button
                onClick={handleSubmit}
                className="bg-brand-600 text-white px-10 py-3 rounded-full font-black text-lg shadow-2xl hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all"
            >
                Hoàn thành
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: LEVEL MAP ---
  if (selectedTopicId) {
      return (
          <div className="max-w-4xl mx-auto space-y-8 pb-12">
              <button 
                onClick={() => setSelectedTopicId(null)}
                className="flex items-center text-gray-500 hover:text-brand-600 font-bold mb-4"
              >
                  <i className="fas fa-arrow-left mr-2"></i> Chọn chủ đề khác
              </button>

              <div className="text-center mb-10">
                  <span className="text-purple-600 font-bold uppercase tracking-widest text-xs mb-2 block">Game Mode</span>
                  <h2 className="text-3xl font-black text-gray-800">CON ĐƯỜNG CHINH PHỤC</h2>
                  <p className="text-gray-500 mt-2">Đạt 2/5 điểm để mở khóa cấp độ tiếp theo!</p>
              </div>

              <div className="relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-100 -translate-x-1/2 rounded-full hidden md:block"></div>
                  
                  <div className="space-y-8 relative z-10">
                      {LEVEL_ORDER.map((level, index) => {
                          const unlocked = isLevelUnlocked(level);
                          const passed = currentUser?.completedLevels.includes(level);
                          
                          // Calculate Best Score for this level/topic
                          const levelAttempts = attempts.filter(a => 
                              a.userId === currentUser?.id && 
                              a.topicId === selectedTopicId && 
                              a.level === level
                          );
                          const bestScore = levelAttempts.length > 0 
                              ? Math.max(...levelAttempts.map(a => a.score)) 
                              : null;

                          // Config
                          const config = {
                              [Level.INTRO]: { color: 'blue', icon: 'fa-baby', label: 'Nhập môn' },
                              [Level.ELEMENTARY]: { color: 'green', icon: 'fa-seedling', label: 'Sơ cấp' },
                              [Level.INTERMEDIATE]: { color: 'yellow', icon: 'fa-bolt', label: 'Trung cấp' },
                              [Level.ADVANCED]: { color: 'orange', icon: 'fa-fire', label: 'Siêu cấp' }, // Advanced
                              [Level.EXPERT]: { color: 'purple', icon: 'fa-dragon', label: 'Chuyên gia' }, // Expert
                          }[level];
                          
                          const isSpecial = level === Level.ADVANCED || level === Level.EXPERT;

                          return (
                              <div key={level} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8 group`}>
                                  
                                  <div className={`flex-1 w-full md:w-auto p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                      unlocked 
                                      ? `bg-white ${isSpecial ? `border-${config.color}-300 ring-2 ring-${config.color}-100` : 'border-gray-100'} shadow-lg hover:-translate-y-1` 
                                      : 'bg-gray-50 border-dashed border-gray-300 opacity-60 grayscale'
                                  }`}>
                                      {/* Special Background for High Levels */}
                                      {isSpecial && unlocked && (
                                          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-${config.color}-100 to-transparent rounded-bl-full opacity-50`}></div>
                                      )}

                                      <div className="flex justify-between items-start mb-2 relative z-10">
                                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                              unlocked ? `bg-${config.color}-100 text-${config.color}-700` : 'bg-gray-200 text-gray-500'
                                          }`}>
                                              Level {index + 1}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                              {bestScore !== null && (
                                                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                      Best: {bestScore}/5
                                                  </span>
                                              )}
                                              {passed && <i className="fas fa-check-circle text-green-500 text-xl"></i>}
                                              {!unlocked && <i className="fas fa-lock text-gray-400 text-xl"></i>}
                                          </div>
                                      </div>
                                      <h3 className={`text-xl font-bold mb-2 ${isSpecial ? `text-${config.color}-700` : 'text-gray-800'}`}>
                                          {config.label}
                                      </h3>
                                      
                                      <button
                                        onClick={() => unlocked && handleStartLevel(level)}
                                        disabled={!unlocked}
                                        className={`w-full py-2 rounded-lg font-bold transition-all ${
                                            unlocked 
                                            ? `bg-${config.color}-600 text-white hover:bg-${config.color}-700 shadow-md` 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                      >
                                          {passed ? 'Chơi lại (Cải thiện điểm)' : (unlocked ? 'Bắt đầu thử thách' : 'Đang khóa')}
                                      </button>
                                  </div>

                                  <div className="shrink-0 relative">
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 relative z-10 transition-transform duration-500 ${
                                          unlocked 
                                          ? `bg-white border-${config.color}-500 text-${config.color}-500 shadow-xl scale-110` 
                                          : 'bg-gray-100 border-gray-300 text-gray-300'
                                      }`}>
                                          <i className={`fas ${config.icon}`}></i>
                                      </div>
                                  </div>

                                  <div className="flex-1 hidden md:block"></div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: TOPIC SELECTION ---
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10">
           <h2 className="text-3xl font-black mb-2">GAME THỬ THÁCH</h2>
           <p className="text-purple-100 text-lg">Chinh phục 5 cấp độ (bao gồm Siêu Cấp & Chuyên Gia) để nhận huy chương!</p>
        </div>
        <i className="fas fa-gamepad absolute right-0 bottom-0 text-9xl opacity-10 transform translate-x-4 translate-y-4"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
           <div 
             key={topic.id} 
             onClick={() => setSelectedTopicId(topic.id)}
             className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all cursor-pointer group"
           >
               <div className="p-6">
                   <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 text-2xl shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors">
                           <i className={`fas ${topic.icon}`}></i>
                       </div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                           Tháng {topic.month}
                       </span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{topic.name}</h3>
                   <p className="text-sm text-gray-500">Bao gồm các cấp độ khó: Siêu cấp, Chuyên gia.</p>
               </div>
               <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">5 Level Game</span>
                   <i className="fas fa-play text-purple-300 group-hover:text-purple-600 transition-colors"></i>
               </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeGame;
