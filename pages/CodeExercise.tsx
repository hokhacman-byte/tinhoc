
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { gradeStudentCode, explainCodeSnippet, analyzeCodeStyle, getAiTutorHintStream } from '../services/geminiService';
import { CodeProblem } from '../types';
import { GenerateContentResponse } from '@google/genai';

// Mock Problem Data (Fallback)
const MOCK_PROBLEM: CodeProblem = {
    id: 'p1',
    title: 'Bài thực hành: Tính tổng các số chẵn',
    description: 'Viết chương trình nhận vào một danh sách các số nguyên. Hãy tính tổng của tất cả các số chẵn trong danh sách đó và in kết quả ra màn hình.',
    inputFormat: 'Dòng đầu tiên chứa số nguyên n (số lượng phần tử).\nDòng thứ hai chứa n số nguyên cách nhau bởi dấu cách.',
    outputFormat: 'Một số nguyên duy nhất là tổng các số chẵn.',
    examples: [
        {
            input: '5\n1 2 3 4 5',
            output: '6',
            explanation: 'Các số chẵn là 2 và 4. Tổng = 2 + 4 = 6.'
        },
        {
            input: '4\n10 20 15 30',
            output: '60',
            explanation: 'Các số chẵn là 10, 20, 30. Tổng = 60.'
        }
    ],
    template: {
        python: '# Viết code của bạn ở đây\n\ndef solve():\n    # Nhập dữ liệu\n    n = int(input())\n    arr = list(map(int, input().split()))\n    \n    # Xử lý\n    result = 0\n    \n    # In kết quả\n    print(result)\n\nsolve()',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code của bạn ở đây\n    return 0;\n}'
    },
    difficulty: 'EASY',
    createdAt: new Date().toISOString()
};

interface ChatMessage {
    role: 'AI' | 'USER';
    text: string;
}

const CodeExercise = () => {
  const navigate = useNavigate();
  const { currentUser, codeProblems } = useApp();
  
  // Combine Mock + System Problems
  const allProblems = [MOCK_PROBLEM, ...codeProblems];
  const [currentProblemId, setCurrentProblemId] = useState(allProblems[0].id);
  
  const currentProblem = allProblems.find(p => p.id === currentProblemId) || MOCK_PROBLEM;

  // Layout State
  const [activeTab, setActiveTab] = useState<'PROBLEM' | 'HISTORY'>('PROBLEM');
  
  // Editor State
  const [language, setLanguage] = useState<'python' | 'cpp'>('python');
  const [code, setCode] = useState(currentProblem.template?.python || '');
  const [lines, setLines] = useState(10); 
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference for file input

  // Execution State
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'WA'>('IDLE'); 
  const [consoleContent, setConsoleContent] = useState<any>(null); // Store AI JSON response
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [submissionHistory, setSubmissionHistory] = useState<{id: number, status: string, score: number, time: string}[]>([]);
  const [gradingStep, setGradingStep] = useState(''); // New state for visualizing steps
  
  // AI Feature States
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [styleCheck, setStyleCheck] = useState<{suspicious: boolean, msg: string} | null>(null);

  // AI Tutor Chat State
  const [aiChatMode, setAiChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isStreamingAi, setIsStreamingAi] = useState(false);

  // Timer logic
  const [timeLeft, setTimeLeft] = useState(1800); 

  useEffect(() => {
      const timer = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  // Update Code when problem changes
  useEffect(() => {
      setCode(currentProblem.template?.python || '# Write your code here\n');
      setSubmissionHistory([]);
      setStatus('IDLE');
      setConsoleContent(null);
      setExplanation('');
      setStyleCheck(null);
      setGradingStep('');
      setChatHistory([]); // Reset chat
      setAiChatMode(false);
  }, [currentProblemId]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Update line numbers
  useEffect(() => {
      const lineCount = code.split('\n').length;
      setLines(Math.max(lineCount, 15)); 
  }, [code]);

  const handleReset = () => {
      if(window.confirm('Bạn có chắc muốn đặt lại code về mặc định?')) {
          setCode(currentProblem.template?.python || '');
          setStatus('IDLE');
          setConsoleContent(null);
          setExplanation('');
          setStyleCheck(null);
          setGradingStep('');
          setChatHistory([]);
      }
  };

  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
              setCode(content);
              // Auto detect language roughly based on extension
              if (file.name.endsWith('.cpp') || file.name.endsWith('.c')) setLanguage('cpp');
              if (file.name.endsWith('.py')) setLanguage('python');
              alert(`Đã tải nội dung từ file ${file.name}`);
          }
      };
      reader.readAsText(file);
      // Reset input
      e.target.value = '';
  };

  const handleExplainCode = async () => {
      const textarea = textAreaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = code.substring(start, end);
      
      const targetCode = selectedText.trim() ? selectedText : code; // If no selection, explain all

      setIsExplaining(true);
      setConsoleOpen(true);
      setAiChatMode(false); // Force switch to regular console to show explanation
      setExplanation('Đang phân tích code...');
      
      const result = await explainCodeSnippet(targetCode);
      setExplanation(result);
      setIsExplaining(false);
  };

  // New: AI Tutor Chat Function
  const handleAskAiTutor = async () => {
      // 1. Setup UI
      setConsoleOpen(true);
      setAiChatMode(true);
      
      // 2. Add placeholder message for AI
      setChatHistory(prev => [
          ...prev, 
          { role: 'USER', text: 'Gợi ý giúp em lỗi trong code với ạ!' },
          { role: 'AI', text: '' } // Placeholder for streaming
      ]);
      
      setIsStreamingAi(true);

      // 3. Call Streaming Service
      try {
          const streamResult = await getAiTutorHintStream(
              currentProblem.description,
              code,
              status === 'ERROR' ? "Có lỗi biên dịch/runtime" : ""
          );

          let fullText = '';
          
          for await (const chunk of streamResult) {
              const text = chunk.text; // Access text property directly
              if (text) {
                  fullText += text;
                  // Update the last message (AI's message) with new chunk
                  setChatHistory(prev => {
                      const newHistory = [...prev];
                      const lastIdx = newHistory.length - 1;
                      newHistory[lastIdx] = { ...newHistory[lastIdx], text: fullText };
                      return newHistory;
                  });
              }
          }
      } catch (error) {
          setChatHistory(prev => {
              const newHistory = [...prev];
              newHistory[newHistory.length - 1] = { role: 'AI', text: 'Xin lỗi, thầy đang gặp chút trục trặc kết nối. Em thử lại sau nhé!' };
              return newHistory;
          });
      } finally {
          setIsStreamingAi(false);
      }
  };

  const handleSubmit = async () => {
      if(status === 'RUNNING') return;
      
      setStatus('RUNNING');
      setConsoleOpen(true);
      setAiChatMode(false); // Switch to standard console
      setStyleCheck(null);
      setConsoleContent(null);

      // --- SIMULATE BACKEND STEPS VISUALLY ---
      setGradingStep('1. Đang kiểm tra cú pháp (Syntax Check)...');
      await new Promise(r => setTimeout(r, 800)); // Fake delay for UX

      // 1. Check Plagiarism / Style
      const styleResult = await analyzeCodeStyle(code, [currentProblem.template?.python || '']);
      if (styleResult.isSuspicious) {
          setStyleCheck({ suspicious: true, msg: styleResult.reason });
      }

      setGradingStep('2. Đang kiểm tra logic thuật toán (Logic Check)...');
      await new Promise(r => setTimeout(r, 800)); // Fake delay for UX

      // 2. Grade Code
      const result = await gradeStudentCode(
          currentProblem.description, 
          currentProblem.inputFormat, 
          currentProblem.outputFormat, 
          code, 
          language
      );

      setGradingStep(''); // Done

      if (result) {
          if (result.score === 100) setStatus('SUCCESS');
          else if (result.status === 'Syntax Error' || result.status === 'Logic Error') setStatus('ERROR');
          else setStatus('WA');

          setConsoleContent(result);
          
          setSubmissionHistory(prev => [{
              id: Date.now(), 
              status: result.status, 
              score: result.score, 
              time: new Date().toLocaleTimeString()
          }, ...prev]);
      } else {
          setStatus('ERROR');
          setConsoleContent('Lỗi hệ thống chấm điểm.');
      }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      
      {/* 1. HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                  <i className="fas fa-arrow-left"></i>
              </button>
              
              {/* Problem Selector */}
              <div className="relative">
                  <select 
                      value={currentProblemId}
                      onChange={(e) => setCurrentProblemId(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer max-w-[300px] truncate"
                  >
                      {allProblems.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg bg-gray-100 font-mono font-bold text-gray-700 flex items-center ${timeLeft < 300 ? 'text-red-600 bg-red-50 animate-pulse' : ''}`}>
                  <i className="fas fa-clock mr-2"></i>
                  {formatTime(timeLeft)}
              </div>
              <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser?.name.charAt(0)}
                  </div>
              </div>
          </div>
      </header>

      {/* 2. MAIN BODY */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL (Problem) */}
          <div className="w-2/5 flex flex-col border-r border-gray-200 bg-white">
              <div className="flex border-b border-gray-200">
                  <button 
                    onClick={() => setActiveTab('PROBLEM')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PROBLEM' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                      <i className="fas fa-book mr-2"></i> Đề bài
                  </button>
                  <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                      <i className="fas fa-history mr-2"></i> Lịch sử & Nhận xét
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {activeTab === 'PROBLEM' ? (
                      <div className="space-y-6">
                          <div>
                              <h3 className="text-xl font-black text-gray-800 mb-2">{currentProblem.title}</h3>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                  currentProblem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                  currentProblem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>
                                  {currentProblem.difficulty}
                              </span>
                              <p className="text-gray-600 leading-relaxed text-sm mt-3">{currentProblem.description}</p>
                          </div>

                          <div>
                              <h4 className="font-bold text-gray-800 text-sm mb-2 uppercase">Dữ liệu đầu vào (Input)</h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono">
                                  {currentProblem.inputFormat}
                              </p>
                          </div>

                          <div>
                              <h4 className="font-bold text-gray-800 text-sm mb-2 uppercase">Kết quả đầu ra (Output)</h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono">
                                  {currentProblem.outputFormat}
                              </p>
                          </div>

                          <div>
                              <h4 className="font-bold text-gray-800 text-sm mb-2 uppercase">Ví dụ mẫu</h4>
                              {currentProblem.examples.map((ex, idx) => (
                                  <div key={idx} className="mb-4 last:mb-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                      <div className="flex border-b border-gray-200">
                                          <div className="w-1/2 p-3 border-r border-gray-200">
                                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Input</p>
                                              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ex.input}</pre>
                                          </div>
                                          <div className="w-1/2 p-3">
                                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Output</p>
                                              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ex.output}</pre>
                                          </div>
                                      </div>
                                      {ex.explanation && (
                                          <div className="p-3 bg-yellow-50/50 border-t border-gray-200">
                                              <p className="text-xs text-gray-500 italic"><strong className="not-italic">Giải thích:</strong> {ex.explanation}</p>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {submissionHistory.length === 0 ? (
                              <p className="text-gray-400 text-center text-sm py-10">Chưa có bài nộp nào.</p>
                          ) : (
                              submissionHistory.map((sub, idx) => (
                                  <div key={sub.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                      <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-gray-400">#{submissionHistory.length - idx}</span>
                                              <span className="text-xs text-gray-500">{sub.time}</span>
                                          </div>
                                          <div className={`text-xs font-bold px-2 py-1 rounded ${sub.status === 'Passed' || sub.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {sub.status}
                                          </div>
                                      </div>
                                      <div className="flex justify-between items-end">
                                          <p className="text-xs text-gray-600">Đã chấm tự động bởi AI</p>
                                          <div className="text-right">
                                              <span className="block font-black text-2xl text-gray-800">{sub.score}/100</span>
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT PANEL (Editor & Console) */}
          <div className="w-3/5 flex flex-col bg-[#1e1e1e]">
              
              {/* Toolbar */}
              <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-black">
                  <div className="flex items-center gap-3">
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-[#3c3c3c] text-gray-200 text-xs py-1.5 px-3 rounded border border-gray-600 focus:outline-none focus:border-brand-500"
                      >
                          <option value="python">Python 3.10</option>
                          <option value="cpp">C++ 17</option>
                      </select>
                      
                      {/* FILE UPLOAD BUTTON */}
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          accept=".py,.cpp,.c,.txt" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-[#444] hover:bg-[#555] text-gray-200 px-3 py-1.5 rounded flex items-center transition-colors border border-gray-600"
                      >
                          <i className="fas fa-file-upload mr-1.5"></i> Tải file code
                      </button>

                      <button 
                        onClick={handleExplainCode}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded flex items-center transition-colors"
                      >
                          <i className="fas fa-magic mr-1.5"></i> Giải thích Code
                      </button>
                  </div>
                  <div className="flex items-center gap-3">
                      <button onClick={handleReset} className="text-gray-400 hover:text-white" title="Reset Code"><i className="fas fa-undo"></i></button>
                  </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex overflow-hidden relative group">
                  {/* Line Numbers */}
                  <div className="w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 font-mono text-sm leading-6 select-none border-r border-[#333]">
                      {Array.from({length: lines}).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                      ))}
                  </div>
                  
                  {/* Textarea */}
                  <textarea
                      ref={textAreaRef}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 bg-[#1e1e1e] text-gray-200 font-mono text-sm leading-6 p-4 outline-none resize-none border-none custom-scrollbar"
                      spellCheck="false"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                  ></textarea>
              </div>

              {/* Console / Test Result Area */}
              <div className={`transition-all duration-300 flex flex-col bg-[#252526] border-t border-[#333] ${consoleOpen ? 'h-[45%]' : 'h-10'}`}>
                  <div 
                    className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 cursor-pointer hover:bg-[#333]"
                    onClick={() => setConsoleOpen(!consoleOpen)}
                  >
                      <div className="flex items-center gap-3">
                          <button 
                            className={`text-xs font-bold px-3 py-1 rounded transition-colors ${!aiChatMode ? 'bg-[#333] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            onClick={(e) => { e.stopPropagation(); setAiChatMode(false); setConsoleOpen(true); }}
                          >
                              <i className="fas fa-terminal mr-2"></i>Kết quả & Nhận xét
                          </button>
                          <button 
                            className={`text-xs font-bold px-3 py-1 rounded transition-colors ${aiChatMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-indigo-400'}`}
                            onClick={(e) => { e.stopPropagation(); setAiChatMode(true); setConsoleOpen(true); }}
                          >
                              <i className="fas fa-robot mr-2"></i>Chat với AI Tutor
                          </button>
                          
                          {!aiChatMode && status === 'SUCCESS' && <span className="w-2 h-2 rounded-full bg-green-500 ml-2"></span>}
                          {!aiChatMode && (status === 'ERROR' || status === 'WA') && <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span>}
                      </div>
                      <i className={`fas fa-chevron-${consoleOpen ? 'down' : 'up'} text-gray-500 text-xs`}></i>
                  </div>
                  
                  {consoleOpen && (
                      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar relative">
                          
                          {/* AI TUTOR CHAT MODE */}
                          {aiChatMode ? (
                              <div className="flex flex-col h-full space-y-4">
                                  {chatHistory.length === 0 && (
                                      <div className="text-center text-gray-500 py-10">
                                          <i className="fas fa-robot text-4xl mb-3 opacity-50"></i>
                                          <p>Em gặp khó khăn? Hãy bấm nút <b>"Gợi ý lỗi"</b> ở góc dưới để thầy AI giúp nhé!</p>
                                      </div>
                                  )}
                                  
                                  {chatHistory.map((msg, i) => (
                                      <div key={i} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                                              msg.role === 'USER' 
                                              ? 'bg-blue-600 text-white rounded-br-none' 
                                              : 'bg-[#333] text-gray-200 border border-gray-600 rounded-tl-none'
                                          }`}>
                                              {msg.role === 'AI' && <strong className="block text-xs text-yellow-500 mb-1">AI Tutor</strong>}
                                              <div style={{whiteSpace: 'pre-wrap'}}>{msg.text}</div>
                                          </div>
                                      </div>
                                  ))}
                                  {isStreamingAi && chatHistory[chatHistory.length-1]?.role === 'AI' && (
                                      <div className="flex justify-start">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce ml-2"></div>
                                      </div>
                                  )}
                              </div>
                          ) : (
                              /* STANDARD CONSOLE MODE */
                              <>
                                  {/* Explain Code Section */}
                                  {explanation && (
                                      <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded text-purple-200 whitespace-pre-wrap">
                                          <strong className="block mb-2 text-purple-300"><i className="fas fa-glasses mr-2"></i>Giải thích từ AI:</strong>
                                          {explanation}
                                      </div>
                                  )}

                                  {/* Style Check Warning */}
                                  {styleCheck && (
                                      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-200">
                                          <strong className="block mb-1 text-yellow-400"><i className="fas fa-exclamation-triangle mr-2"></i>Cảnh báo phong cách:</strong>
                                          {styleCheck.msg}
                                      </div>
                                  )}

                                  {/* Grader Output */}
                                  {status === 'IDLE' && !explanation && <span className="text-gray-500 italic">Nhấn 'Nộp bài' để nhận đánh giá hoặc 'Gợi ý lỗi' để chat với AI Tutor...</span>}
                                  
                                  {status === 'RUNNING' && (
                                      <div className="flex flex-col gap-2 text-gray-300">
                                          <p><i className="fas fa-terminal mr-2"></i> Kết nối hệ thống chấm bài...</p>
                                          {gradingStep && (
                                              <p className="text-yellow-400 animate-pulse">
                                                  <i className="fas fa-cog fa-spin mr-2"></i> {gradingStep}
                                              </p>
                                          )}
                                      </div>
                                  )}

                                  {consoleContent && typeof consoleContent === 'object' && (
                                      <div className="space-y-4 animate-fade-in-up">
                                          {/* Score Banner */}
                                          {!consoleContent.isHint && (
                                              <div className={`p-4 rounded-lg border flex justify-between items-center ${consoleContent.score >= 50 ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                                                  <div>
                                                      <h4 className={`font-bold text-lg ${consoleContent.score >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                                          {consoleContent.status}
                                                      </h4>
                                                      <p className="text-gray-300 text-xs mt-1">Kết quả đánh giá từ Giáo viên AI</p>
                                                  </div>
                                                  <div className="text-3xl font-black text-white">
                                                      {consoleContent.score}/100
                                                  </div>
                                              </div>
                                          )}

                                          {/* Checks Detail */}
                                          {!consoleContent.isHint && (
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div className="p-3 bg-[#333] rounded border border-gray-600">
                                                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Kiểm tra Cú pháp</p>
                                                      <p className="text-gray-200">{consoleContent.syntaxCheck || 'Chưa có thông tin'}</p>
                                                  </div>
                                                  <div className="p-3 bg-[#333] rounded border border-gray-600">
                                                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Kiểm tra Logic</p>
                                                      <p className="text-gray-200">{consoleContent.logicCheck || 'Chưa có thông tin'}</p>
                                                  </div>
                                              </div>
                                          )}

                                          {/* Feedback Text */}
                                          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed p-3 bg-blue-900/10 border border-blue-800/30 rounded">
                                              <strong className="text-blue-400 block mb-1"><i className="fas fa-comment-dots mr-2"></i>Nhận xét của giáo viên:</strong> 
                                              {consoleContent.feedback}
                                          </div>

                                          {/* Hints */}
                                          {consoleContent.hints && consoleContent.hints.length > 0 && (
                                              <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded">
                                                  <p className="text-yellow-500 font-bold text-xs mb-2 uppercase flex items-center">
                                                      <i className="fas fa-lightbulb mr-2"></i> Gợi ý sửa bài (Không giải hộ):
                                                  </p>
                                                  <ul className="list-disc list-inside text-yellow-200/80 text-xs space-y-1 ml-1">
                                                      {consoleContent.hints.map((h: string, i: number) => <li key={i}>{h}</li>)}
                                                  </ul>
                                              </div>
                                          )}

                                          {/* Test Cases */}
                                          {consoleContent.testCases && (
                                              <div className="grid grid-cols-1 gap-2 mt-2">
                                                  <p className="text-xs font-bold text-gray-500 uppercase">Test Cases mẫu:</p>
                                                  {consoleContent.testCases.map((tc: any, i: number) => (
                                                      <div key={i} className={`p-2 rounded border text-xs flex justify-between ${tc.passed ? 'bg-green-900/10 border-green-800' : 'bg-red-900/10 border-red-800'}`}>
                                                          <span className="text-gray-400">Input: {tc.input}</span>
                                                          <span className={tc.passed ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                                              {tc.passed ? 'PASS' : `FAIL (Expected: ${tc.expected}, Got: ${tc.actual})`}
                                                          </span>
                                                      </div>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  )}
                                  
                                  {/* Plain string error fallback */}
                                  {typeof consoleContent === 'string' && status !== 'RUNNING' && (
                                      <div className="text-red-400 whitespace-pre-wrap">{consoleContent}</div>
                                  )}
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* 3. FOOTER ACTIONS */}
      <footer className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center text-sm text-gray-500">
              <i className="fas fa-info-circle mr-2"></i>
              Sử dụng Gemini AI để chấm bài và phân tích code.
          </div>
          <div className="flex gap-3">
              {/* New AI Tutor Button */}
              <button 
                  onClick={handleAskAiTutor}
                  disabled={status === 'RUNNING' || isStreamingAi}
                  className="px-5 py-2.5 rounded-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md flex items-center disabled:opacity-50"
              >
                  {isStreamingAi ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-robot mr-2"></i>}
                  Gợi ý lỗi / Tại sao code sai?
              </button>

              <button 
                  onClick={handleSubmit}
                  disabled={status === 'RUNNING' || isStreamingAi}
                  className="px-8 py-2.5 rounded-lg font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                  {status === 'RUNNING' ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
                  Nộp bài & Xem nhận xét
              </button>
          </div>
      </footer>
    </div>
  );
};

export default CodeExercise;
