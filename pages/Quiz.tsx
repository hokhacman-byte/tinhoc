
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Question, QuestionType, Level, LEVEL_LABELS, Attempt } from '../types';

// Only 3 levels for the Review System
const REVIEW_LEVELS = [Level.INTRO, Level.ELEMENTARY, Level.INTERMEDIATE];

const Quiz = () => {
  const { questions, topics, saveAttempt, currentUser } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [isEssayMode, setIsEssayMode] = useState(false);
  
  // Skip Functionality
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // Drag & Drop State (Transient state for the current question)
  const [dragSource, setDragSource] = useState<string | null>(null);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const handleStartLevel = (level: Level) => {
      if (!selectedTopicId) return;

      const levelQuestions = questions.filter(q => q.topicId === selectedTopicId && q.level === level);

      // Get 10 questions (1 point each). If not enough, duplicate to reach 10 for demo or take all.
      let quizQuestions = levelQuestions.sort(() => 0.5 - Math.random());
      
      if (quizQuestions.length > 10) {
        quizQuestions = quizQuestions.slice(0, 10);
      }

      if (quizQuestions.length === 0) {
          alert(`Chưa có câu hỏi cho cấp độ ${LEVEL_LABELS[level]} của chủ đề này.`);
          return;
      }

      setCurrentQuiz(quizQuestions);
      setActiveLevel(level);
      setIsEssayMode(false);
      setAnswers({});
      setShowResult(false);
      setScore(0);
      setSkipsLeft(3);
      setSkippedIds([]);
  };

  const handleStartEssay = () => {
      if (!selectedTopicId) return;

      // Filter only Essay questions for this topic
      const essayQuestions = questions.filter(q => 
          q.topicId === selectedTopicId && q.type === QuestionType.SHORT_ESSAY
      );

      if (essayQuestions.length === 0) {
          alert(`Chưa có câu hỏi tự luận cho chủ đề này.`);
          return;
      }

      // Shuffle and take max 5 for essay practice
      let quizQuestions = essayQuestions.sort(() => 0.5 - Math.random());
      if (quizQuestions.length > 5) {
        quizQuestions = quizQuestions.slice(0, 5);
      }

      setCurrentQuiz(quizQuestions);
      setActiveLevel(null); // No specific level context for generic essay mode, or treat as mixed
      setIsEssayMode(true);
      setAnswers({});
      setShowResult(false);
      setScore(0);
      setSkipsLeft(3);
      setSkippedIds([]);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    // Only allow changing answers if not showing results
    if (!showResult && !skippedIds.includes(questionId)) {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragClick = (item: string) => {
      setDragSource(item);
  };

  const handleDropClick = (qId: string, targetKey: string) => {
      if (!dragSource) return;
      
      // Get current matches for this question
      const currentMatches = JSON.parse(answers[qId] || '{}');
      
      // Update match
      const newMatches = { ...currentMatches, [targetKey]: dragSource };
      setAnswers(prev => ({ ...prev, [qId]: JSON.stringify(newMatches) }));
      setDragSource(null);
  };

  const handleClearDrop = (qId: string, targetKey: string) => {
      const currentMatches = JSON.parse(answers[qId] || '{}');
      const newMatches = { ...currentMatches };
      delete newMatches[targetKey];
      setAnswers(prev => ({ ...prev, [qId]: JSON.stringify(newMatches) }));
  };

  const handleSkip = (qId: string, idx: number) => {
      if (skipsLeft > 0 && !skippedIds.includes(qId)) {
          setSkippedIds(prev => [...prev, qId]);
          setSkipsLeft(prev => prev - 1);
          // Remove answer if any
          setAnswers(prev => {
              const next = { ...prev };
              delete next[qId];
              return next;
          });
          
          // Scroll to next question
          setTimeout(() => {
              const nextEl = document.getElementById(`q-${idx + 1}`);
              if (nextEl) {
                  nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }, 100);
      }
  };

  const handleSubmit = () => {
      let calculatedScore = 0;
      // Filter out skipped questions from total count
      const validQuestions = currentQuiz.filter(q => !skippedIds.includes(q.id));
      const maxScore = validQuestions.length;

      validQuestions.forEach(q => {
          const userAnswer = answers[q.id]?.trim() || '';
          
          if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.TRUE_FALSE) {
              const correct = q.correctAnswer?.trim().toLowerCase();
              if (userAnswer.toLowerCase() === correct) {
                  calculatedScore++;
              }
          } else if (q.type === QuestionType.SHORT_ESSAY) {
              // Check keywords for essay
              if (q.keywords && q.keywords.length > 0) {
                  const hasKeyword = q.keywords.some(k => userAnswer.toLowerCase().includes(k.toLowerCase()));
                  if (hasKeyword && userAnswer.length > 10) { 
                      calculatedScore++;
                  }
              } else {
                  if (userAnswer.length > 10) calculatedScore++;
              }
          } else if (q.type === QuestionType.DRAG_DROP) {
              // Check matching pairs
              try {
                  const userMatches = JSON.parse(userAnswer || '{}');
                  // Must match ALL pairs to get point
                  const allCorrect = q.matchingPairs?.every(pair => userMatches[pair.left] === pair.right);
                  if (allCorrect) calculatedScore++;
              } catch (e) {
                  // Invalid JSON or empty
              }
          }
      });

      setScore(calculatedScore);
      setShowResult(true);

      const isPass = maxScore > 0 ? calculatedScore >= (maxScore * 0.5) : false;

      if (currentUser && selectedTopicId) {
          const attempt: Attempt = {
              id: Date.now().toString(),
              userId: currentUser.id,
              topicId: selectedTopicId,
              level: activeLevel || Level.ADVANCED,
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
      setIsEssayMode(false);
      setShowResult(false);
      setAnswers({});
      setSkippedIds([]);
      setSkipsLeft(3);
  };

  // --- HELPER: GET OPTION STYLE ---
  const getOptionStyle = (q: Question, option: string) => {
      const isSelected = answers[q.id] === option;
      const isCorrect = q.correctAnswer === option;
      
      if (showResult) {
          if (isCorrect) return 'bg-green-100 border-green-500 text-green-700 shadow-sm'; 
          if (isSelected && !isCorrect) return 'bg-red-100 border-red-500 text-red-700 shadow-sm';
          return 'bg-white border-gray-200 text-gray-400 opacity-50';
      } else {
          if (isSelected) return 'bg-red-50 border-red-500 text-red-700 shadow-md ring-1 ring-red-200';
          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
      }
  };

  // Helper to check correctness for display badge
  const isAnswerCorrect = (q: Question) => {
      const userAnswer = answers[q.id]?.trim() || '';
      
      if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.TRUE_FALSE) {
          return userAnswer.toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      } else if (q.type === QuestionType.SHORT_ESSAY) {
          if (q.keywords && q.keywords.length > 0) {
              return q.keywords.some(k => userAnswer.toLowerCase().includes(k.toLowerCase())) && userAnswer.length > 10;
          }
          return userAnswer.length > 10;
      } else if (q.type === QuestionType.DRAG_DROP) {
          try {
              const userMatches = JSON.parse(userAnswer || '{}');
              return q.matchingPairs?.every(pair => userMatches[pair.left] === pair.right) ?? false;
          } catch { return false; }
      }
      return false;
  };

  // --- RENDER: RESULT SCREEN ---
  if (showResult && (activeLevel || isEssayMode)) {
      const validQuiz = currentQuiz.filter(q => !skippedIds.includes(q.id));
      const percentage = validQuiz.length > 0 ? Math.round((score / validQuiz.length) * 100) : 0;
      const titleLabel = isEssayMode ? 'Tự luận' : LEVEL_LABELS[activeLevel!];
      
      return (
          <div className="max-w-4xl mx-auto mt-4 px-4 pb-20 animate-fade-in">
              {/* Score Summary (Reuse existing logic) */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center relative overflow-hidden mb-8">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-xl ring-4 ring-white ${percentage >= 50 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      <i className={`fas ${percentage >= 50 ? 'fa-check' : 'fa-exclamation'}`}></i>
                  </div>
                  <h2 className="text-2xl font-black text-gray-800 mb-1">KẾT QUẢ BÀI LÀM</h2>
                  <p className="text-gray-500 mb-6 font-medium">Chủ đề: {selectedTopic?.name} - {titleLabel}</p>
                  
                  <div className="flex justify-center gap-12 mb-8">
                      <div className="text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Điểm số</p>
                          <p className="text-4xl font-black text-brand-600">{score}/{validQuiz.length}</p>
                      </div>
                      <div className="text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tỷ lệ đúng</p>
                          <p className="text-4xl font-black text-gray-800">{percentage}%</p>
                      </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                      <button onClick={closeQuiz} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                          <i className="fas fa-sign-out-alt mr-2"></i> Thoát
                      </button>
                      <button 
                        onClick={() => isEssayMode ? handleStartEssay() : handleStartLevel(activeLevel!)} 
                        className="bg-brand-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg"
                      >
                          <i className="fas fa-redo mr-2"></i> Làm lại
                      </button>
                  </div>
              </div>

              {/* Detailed Review */}
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-l-4 border-brand-500 pl-3">CHI TIẾT ĐÁP ÁN</h3>
                  {currentQuiz.map((q, idx) => {
                    if (skippedIds.includes(q.id)) return null;
                    const correct = isAnswerCorrect(q);
                    return (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                {correct ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><i className="fas fa-check mr-1"></i> ĐÚNG</span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><i className="fas fa-times mr-1"></i> SAI</span>
                                )}
                            </div>

                            <div className="flex gap-4 mb-4">
                                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                <div className="flex-1 pr-16">
                                    <div className="mb-4">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 bg-gray-100 text-gray-700`}>
                                            {q.type === QuestionType.DRAG_DROP ? 'Ghép nối' : q.type.replace('_', ' ')}
                                        </span>
                                        <h4 className="font-bold text-gray-800 text-lg">{q.content}</h4>
                                    </div>
                                    
                                    {/* --- Review Render: Multiple Choice --- */}
                                    {q.type === QuestionType.MULTIPLE_CHOICE && (
                                        <div className="grid grid-cols-1 gap-3">
                                            {q.options?.map((opt, i) => (
                                                <div key={i} className={`flex items-center p-3 rounded-xl border-2 ${getOptionStyle(q, opt)}`}>
                                                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold mr-3 opacity-80">{String.fromCharCode(65 + i)}</span>
                                                    <span className="font-medium">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* --- Review Render: True/False --- */}
                                    {q.type === QuestionType.TRUE_FALSE && (
                                        <div className="flex gap-4">
                                            {['Đúng', 'Sai'].map((opt) => (
                                                <div key={opt} className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-all font-bold ${getOptionStyle(q, opt)}`}>{opt}</div>
                                            ))}
                                        </div>
                                    )}

                                    {/* --- Review Render: Drag Drop --- */}
                                    {q.type === QuestionType.DRAG_DROP && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400 uppercase mb-1">
                                                <div>Khái niệm</div>
                                                <div>Ghép nối của bạn / Đáp án đúng</div>
                                            </div>
                                            {q.matchingPairs?.map((pair, idx) => {
                                                const userMatches = JSON.parse(answers[q.id] || '{}');
                                                const userVal = userMatches[pair.left];
                                                const isPairCorrect = userVal === pair.right;
                                                
                                                return (
                                                    <div key={idx} className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <div className="flex-1 font-medium text-gray-800">{pair.left}</div>
                                                        <i className="fas fa-arrow-right mx-3 text-gray-400"></i>
                                                        <div className="flex-1">
                                                            <div className={`p-2 rounded font-bold text-sm ${isPairCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                                {userVal || '(Trống)'}
                                                            </div>
                                                            {!isPairCorrect && (
                                                                <div className="text-xs text-green-600 mt-1">Đúng: {pair.right}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* --- Review Render: Text --- */}
                                    {(q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.SHORT_ESSAY) && (
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bài làm của bạn:</p>
                                                <p className={`font-medium ${answers[q.id] ? 'text-gray-800' : 'text-gray-400 italic'}`}>{answers[q.id] || '(Bỏ trống)'}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                                {q.type === QuestionType.SHORT_ANSWER ? (
                                                    <>
                                                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Đáp án đúng:</p>
                                                        <p className="font-bold text-green-800">{q.correctAnswer}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Từ khóa gợi ý:</p>
                                                        <p className="font-bold text-green-800">{q.keywords?.join(', ')}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                  })}
              </div>
          </div>
      );
  }

  // --- RENDER: DOING QUIZ ---
  if (selectedTopicId && (activeLevel || isEssayMode) && currentQuiz.length > 0) {
    const headerTitle = isEssayMode ? 'Tự luận' : LEVEL_LABELS[activeLevel!];
    
    return (
      <div className="max-w-3xl mx-auto mt-4 px-4 pb-24">
        {/* Quiz Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-200 sticky top-4 z-30 flex justify-between items-center mb-8">
            <div className="flex items-center">
                <button onClick={closeQuiz} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-500 transition-colors mr-3">
                    <i className="fas fa-times"></i>
                </button>
                <div>
                    <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">{isEssayMode ? 'Luyện tập' : 'Kiểm tra'}: {headerTitle}</p>
                    <p className="font-bold text-gray-800 line-clamp-1">{selectedTopic?.name}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-black text-2xl text-gray-800 leading-none">
                    {Object.keys(answers).length}<span className="text-gray-300 text-lg">/{currentQuiz.length - skippedIds.length}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold">Đã làm</span>
            </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
            {currentQuiz.map((q, idx) => {
                const isSkipped = skippedIds.includes(q.id);
                if (isSkipped) {
                    return (
                        <div key={q.id} id={`q-${idx}`} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center opacity-70">
                            <p className="text-gray-500 font-medium text-sm flex items-center justify-center">
                                <i className="fas fa-forward mr-2"></i> Câu hỏi {idx + 1} đã được bỏ qua
                            </p>
                        </div>
                    );
                }

                return (
                <div key={q.id} id={`q-${idx}`} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex justify-between gap-4 mb-4">
                        <div className="flex gap-4">
                            <span className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-black flex items-center justify-center text-lg shrink-0">{idx + 1}</span>
                            <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                                    q.type === QuestionType.MULTIPLE_CHOICE ? 'bg-blue-100 text-blue-700' :
                                    q.type === QuestionType.TRUE_FALSE ? 'bg-green-100 text-green-700' :
                                    q.type === QuestionType.DRAG_DROP ? 'bg-pink-100 text-pink-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                    {q.type === QuestionType.DRAG_DROP ? 'Ghép nối' : q.type.replace('_', ' ')}
                                </span>
                                <h3 className="font-bold text-gray-800 text-lg">{q.content}</h3>
                            </div>
                        </div>
                        {skipsLeft > 0 && (
                            <button 
                                onClick={() => handleSkip(q.id, idx)}
                                className="h-8 px-3 rounded-lg bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs font-bold hover:bg-yellow-100 transition-colors whitespace-nowrap"
                            >
                                <i className="fas fa-step-forward mr-1"></i> Bỏ qua ({skipsLeft})
                            </button>
                        )}
                    </div>

                    <div className="ml-14">
                        {/* 1. MULTIPLE CHOICE */}
                        {q.type === QuestionType.MULTIPLE_CHOICE && (
                            <div className="grid grid-cols-1 gap-3">
                                {q.options?.map((opt, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => handleAnswerChange(q.id, opt)}
                                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${getOptionStyle(q, opt)}`}
                                    >
                                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm mr-3 transition-colors">{String.fromCharCode(65 + i)}</span>
                                        <span className="font-medium text-gray-800">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. TRUE / FALSE */}
                        {q.type === QuestionType.TRUE_FALSE && (
                            <div className="flex gap-4">
                                {['Đúng', 'Sai'].map((opt) => (
                                    <button 
                                        key={opt}
                                        onClick={() => handleAnswerChange(q.id, opt)}
                                        className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all font-bold text-lg ${answers[q.id] === opt ? (opt === 'Đúng' ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-red-500 text-white border-red-600 shadow-md') : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 3. DRAG & DROP (Matching) */}
                        {q.type === QuestionType.DRAG_DROP && q.matchingPairs && (
                            <div className="space-y-6">
                                {/* Sources (Draggables) */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Kéo thả (Chọn mục bên dưới):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {q.matchingPairs.map(p => p.right)
                                            .sort(() => 0.5 - Math.random()) // Shuffle right items
                                            .map((item, i) => {
                                                const currentMatches = JSON.parse(answers[q.id] || '{}');
                                                // Check if item is already assigned
                                                const isAssigned = Object.values(currentMatches).includes(item);
                                                const isSelected = dragSource === item;

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => !isAssigned && handleDragClick(item)}
                                                        disabled={isAssigned}
                                                        className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm border-2 transition-all ${
                                                            isAssigned 
                                                            ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-default' 
                                                            : isSelected 
                                                                ? 'bg-brand-600 text-white border-brand-700 scale-105 ring-2 ring-brand-200' 
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                                                        }`}
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                {/* Targets (Drop Zones) */}
                                <div className="space-y-3">
                                    {q.matchingPairs.map((pair, idx) => {
                                        const currentMatches = JSON.parse(answers[q.id] || '{}');
                                        const assignedItem = currentMatches[pair.left];

                                        return (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium shadow-sm">
                                                    {pair.left}
                                                </div>
                                                <i className="fas fa-arrow-right text-gray-300"></i>
                                                <div 
                                                    onClick={() => !assignedItem ? handleDropClick(q.id, pair.left) : handleClearDrop(q.id, pair.left)}
                                                    className={`flex-1 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center text-sm font-bold min-h-[48px] ${
                                                        assignedItem 
                                                        ? 'bg-brand-50 border-brand-300 text-brand-700' 
                                                        : dragSource 
                                                            ? 'bg-yellow-50 border-yellow-400 text-yellow-600 animate-pulse' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {assignedItem || (dragSource ? 'Thả vào đây' : 'Trống')}
                                                    {assignedItem && <i className="fas fa-times-circle ml-2 text-brand-400 hover:text-red-500"></i>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 4. SHORT ANSWER */}
                        {q.type === QuestionType.SHORT_ANSWER && (
                            <div className="mt-2">
                                <input 
                                    type="text"
                                    placeholder="Nhập câu trả lời ngắn gọn..."
                                    className="w-full p-4 bg-purple-50 border border-purple-100 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all font-medium text-gray-800"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                            </div>
                        )}

                        {/* 5. SHORT ESSAY */}
                        {q.type === QuestionType.SHORT_ESSAY && (
                            <div className="mt-2">
                                <textarea 
                                    rows={4}
                                    placeholder="Viết câu trả lời tự luận của bạn (chú ý các từ khóa)..."
                                    className="w-full p-4 bg-orange-50 border border-orange-100 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all font-medium text-gray-800 resize-none"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-2 italic text-right">Câu hỏi tự luận sẽ được chấm điểm dựa trên từ khóa.</p>
                            </div>
                        )}
                    </div>
                </div>
            )})}
        </div>

        {/* Submit Bar */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
            <button
                onClick={handleSubmit}
                className="pointer-events-auto bg-brand-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-2xl hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all flex items-center ring-4 ring-white/50 backdrop-blur-sm"
            >
                <i className="fas fa-paper-plane mr-2"></i> NỘP BÀI
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: LEVEL SELECTION (DEFAULT) ---
  if (selectedTopicId) {
      return (
          <div className="max-w-5xl mx-auto space-y-8 pb-12">
              <button 
                onClick={() => setSelectedTopicId(null)}
                className="flex items-center text-gray-500 hover:text-brand-600 font-bold mb-4"
              >
                  <i className="fas fa-arrow-left mr-2"></i> Chọn chủ đề khác
              </button>

              <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-800">{selectedTopic?.name}</h2>
                  <p className="text-gray-500 mt-2">Vui lòng chọn hình thức ôn tập.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {REVIEW_LEVELS.map((level, index) => {
                       // Config for the 3 levels
                       const config = {
                           [Level.INTRO]: { color: 'blue', icon: 'fa-eye', desc: 'Nhận diện khái niệm, định nghĩa cơ bản.' },
                           [Level.ELEMENTARY]: { color: 'green', icon: 'fa-brain', desc: 'Hiểu rõ bản chất, so sánh và giải thích.' },
                           [Level.INTERMEDIATE]: { color: 'orange', icon: 'fa-bolt', desc: 'Áp dụng kiến thức, phân tích tình huống.' },
                       }[level];

                       return (
                           <div key={level} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
                               <div className={`w-20 h-20 rounded-full bg-${config.color}-50 text-${config.color}-600 flex items-center justify-center text-3xl mb-4 group-hover:bg-${config.color}-600 group-hover:text-white transition-colors`}>
                                   <i className={`fas ${config.icon}`}></i>
                               </div>
                               <h3 className="text-xl font-bold text-gray-800 mb-2">{LEVEL_LABELS[level]}</h3>
                               <p className="text-sm text-gray-500 mb-6 flex-1">{config.desc}</p>
                               <div className="w-full bg-gray-50 rounded-lg py-2 mb-4 border border-dashed border-gray-200">
                                   <span className="font-bold text-gray-600 text-sm">10 Câu hỏi / 10 Điểm</span>
                               </div>
                               <button
                                   onClick={() => handleStartLevel(level)}
                                   className={`w-full py-3 rounded-xl font-bold text-white shadow-md bg-${config.color}-600 hover:bg-${config.color}-700 active:scale-95 transition-all`}
                               >
                                   Bắt đầu làm bài
                               </button>
                           </div>
                       )
                  })}

                  {/* Essay Card */}
                   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
                       <div className={`w-20 h-20 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-3xl mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors`}>
                           <i className="fas fa-pen-nib"></i>
                       </div>
                       <h3 className="text-xl font-bold text-gray-800 mb-2">Tự luận</h3>
                       <p className="text-sm text-gray-500 mb-6 flex-1">Rèn luyện kỹ năng viết và diễn giải qua các câu hỏi mở.</p>
                       <div className="w-full bg-gray-50 rounded-lg py-2 mb-4 border border-dashed border-gray-200">
                           <span className="font-bold text-gray-600 text-sm">5 Câu hỏi mở</span>
                       </div>
                       <button
                           onClick={handleStartEssay}
                           className={`w-full py-3 rounded-xl font-bold text-white shadow-md bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all`}
                       >
                           Bắt đầu viết
                       </button>
                   </div>
              </div>
          </div>
      );
  }

  // --- RENDER: TOPIC SELECTION (DEFAULT) ---
  return (
    <div className="space-y-6">
      <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10">
           <h2 className="text-3xl font-black mb-2">HỆ THỐNG ÔN TẬP & KIỂM TRA</h2>
           <p className="text-brand-100 text-lg">Ngân hàng câu hỏi đa dạng: Trắc nghiệm, Đúng/Sai, Kéo thả & Tự luận.</p>
        </div>
        <i className="fas fa-clipboard-list absolute right-0 bottom-0 text-9xl opacity-10 transform translate-x-4 translate-y-4"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
           <div 
             key={topic.id} 
             onClick={() => setSelectedTopicId(topic.id)}
             className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all cursor-pointer group"
           >
               <div className="p-6">
                   <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 text-2xl shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-colors">
                           <i className={`fas ${topic.icon}`}></i>
                       </div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                           Tháng {topic.month}
                       </span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-brand-600 transition-colors">{topic.name}</h3>
                   <p className="text-gray-500 text-sm line-clamp-2">{topic.description}</p>
               </div>
               <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">4 Cấp độ ôn tập</span>
                   <i className="fas fa-chevron-right text-gray-300 group-hover:text-brand-600 transition-colors"></i>
               </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
