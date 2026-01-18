
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { askDocumentChatbot, generateQuizFromContent } from '../services/geminiService';
import { ChatMessage, Role } from '../types';

const Chatbot = () => {
  const { documents, currentUser, addDocument } = useApp();
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFileUrl, setNewFileUrl] = useState(''); // Store Base64 for downloading
  const [isParsing, setIsParsing] = useState(false);

  // Quiz Interaction State
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, string>>({}); // format: "msgIndex-questionIndex": "USER_CHOICE"

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleSend = async () => {
    if (!input.trim() || !selectedDoc) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const reply = await askDocumentChatbot(selectedDoc.content, input);

    const botMsg: ChatMessage = { role: 'model', text: reply };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleGenerateQuiz = async () => {
      if (!selectedDoc) return;
      
      const userMsg: ChatMessage = { role: 'user', text: 'Hãy tạo cho tôi 5 câu hỏi Đúng/Sai từ tài liệu này.' };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const quizData = await generateQuizFromContent(selectedDoc.content);
      
      if (quizData && quizData.length > 0) {
          const botMsg: ChatMessage = { 
              role: 'model', 
              text: 'Dưới đây là 5 câu hỏi Đúng/Sai để bạn ôn tập:',
              quizData: quizData
          };
          setMessages(prev => [...prev, botMsg]);
      } else {
          const errorMsg: ChatMessage = { role: 'model', text: 'Xin lỗi, tôi không thể tạo câu hỏi từ tài liệu này. Vui lòng thử lại.' };
          setMessages(prev => [...prev, errorMsg]);
      }
      setIsLoading(false);
  };

  const handleQuizAnswer = (msgIndex: number, qIndex: number, choice: string) => {
      setRevealedAnswers(prev => ({
          ...prev,
          [`${msgIndex}-${qIndex}`]: choice
      }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newTitle) {
      setNewTitle(file.name);
    }

    setIsParsing(true);
    setNewContent('');
    setNewFileUrl('');

    // 1. Read as Data URL for storing the file download (Base64)
    const urlReader = new FileReader();
    urlReader.onload = (event) => {
        setNewFileUrl(event.target?.result as string || '');
    };
    urlReader.readAsDataURL(file);

    try {
        let text = '';
        
        // 2. Parse content for Chatbot
        if (file.type === 'application/pdf') {
            const pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib) {
                alert("Thư viện đọc PDF chưa sẵn sàng. Vui lòng tải lại trang.");
                setIsParsing(false);
                return;
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                text += pageText + '\n\n';
            }
        } 
        // Handle DOCX using Mammoth.js
        else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.name.toLowerCase().endsWith('.docx')
        ) {
            const mammoth = (window as any).mammoth;
            if (!mammoth) {
                alert("Thư viện đọc Word (Mammoth.js) chưa được tải. Vui lòng kiểm tra kết nối mạng.");
                setIsParsing(false);
                return;
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            text = result.value;
            
            if (result.messages && result.messages.length > 0) {
                console.warn("Mammoth messages:", result.messages);
            }
        } 
        // Handle Plain Text
        else if (file.type === 'text/plain') {
            text = await file.text();
        } 
        else {
            alert("Định dạng file không hỗ trợ tự động đọc. Vui lòng chọn file .pdf, .docx hoặc .txt.");
            setIsParsing(false);
            return;
        }

        if (text.trim().length === 0) {
            alert("Không tìm thấy nội dung văn bản trong file (File có thể là ảnh scan). Vui lòng nhập thủ công.");
        } else {
            setNewContent(text);
            alert(`Đã trích xuất thành công nội dung từ file: ${file.name}`);
        }

    } catch (error) {
        console.error("Error reading file:", error);
        alert("Đã xảy ra lỗi khi đọc file. Vui lòng thử lại hoặc copy nội dung thủ công.");
    } finally {
        setIsParsing(false);
        // Reset input value to allow re-uploading the same file if needed (e.g. after edit)
        e.target.value = '';
    }
  };

  const handleUpload = () => {
    if (newTitle && newContent) {
        addDocument({
            id: Date.now().toString(),
            title: newTitle,
            content: newContent,
            fileUrl: newFileUrl, // Save the base64 file
            fileName: newTitle.endsWith('.pdf') ? newTitle : (newTitle.endsWith('.docx') ? newTitle : newTitle + '.txt'),
            uploadedBy: currentUser?.name || 'Unknown'
        });
        setNewTitle('');
        setNewContent('');
        setNewFileUrl('');
        setShowUpload(false);
        alert("Lưu tài liệu thành công!");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar: Document List */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Tài liệu Tin học</h3>
            {currentUser?.role === Role.TEACHER && (
                <button onClick={() => setShowUpload(!showUpload)} className="text-brand-600 hover:bg-brand-50 p-2 rounded">
                    <i className={`fas ${showUpload ? 'fa-minus' : 'fa-plus'} mr-1`}></i>
                </button>
            )}
        </div>
        
        {showUpload && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 animate-fade-in">
                <div className="p-4 border-2 border-dashed border-brand-300 bg-brand-50 rounded-lg text-center hover:bg-brand-100 transition-colors relative">
                    {isParsing ? (
                        <div className="flex flex-col items-center justify-center text-brand-600">
                            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                            <span className="text-sm font-bold">Đang đọc tài liệu...</span>
                        </div>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                accept=".txt,.pdf,.docx"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-brand-600 flex flex-col items-center">
                                <div className="flex space-x-3 mb-2">
                                    <i className="fas fa-file-pdf text-2xl text-red-500"></i>
                                    <i className="fas fa-file-word text-2xl text-blue-600"></i>
                                    <i className="fas fa-file-alt text-2xl text-gray-500"></i>
                                </div>
                                <p className="text-sm font-bold">Chọn file tài liệu</p>
                                <p className="text-[10px] opacity-70 mt-1">Hỗ trợ PDF, Word (.docx), TXT</p>
                            </div>
                        </>
                    )}
                </div>

                <input 
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-brand-500" 
                    placeholder="Tiêu đề tài liệu"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
                <textarea 
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-brand-500 font-mono text-xs" 
                    placeholder="Nội dung văn bản (được trích xuất tự động hoặc nhập tay)..."
                    rows={6}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    readOnly={isParsing}
                />
                <button 
                    onClick={handleUpload} 
                    className={`w-full bg-brand-600 text-white text-sm py-2 rounded font-semibold hover:bg-brand-700 transition-colors shadow-md ${(!newTitle || !newContent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!newTitle || !newContent}
                >
                    <i className="fas fa-save mr-2"></i>Lưu tài liệu
                </button>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
            {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <i className="fas fa-folder-open text-2xl mb-2"></i>
                    <p>Chưa có tài liệu nào.</p>
                </div>
            ) : (
                documents.map(doc => (
                    <div 
                        key={doc.id}
                        onClick={() => { setSelectedDocId(doc.id); setMessages([]); }}
                        className={`p-3 rounded-lg mb-2 cursor-pointer transition-all border ${selectedDocId === doc.id ? 'bg-brand-50 border-brand-200 shadow-sm transform scale-[1.02]' : 'border-transparent hover:bg-gray-50'}`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`mt-1 ${selectedDocId === doc.id ? 'text-brand-600' : 'text-gray-400'}`}>
                                <i className="fas fa-file-alt text-lg"></i>
                            </div>
                            <div className="overflow-hidden">
                                <h4 className={`font-bold text-sm truncate ${selectedDocId === doc.id ? 'text-brand-800' : 'text-gray-700'}`}>{doc.title}</h4>
                                <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                                    <span><i className="fas fa-user-circle mr-1"></i>{doc.uploadedBy}</span>
                                    <span>•</span>
                                    <span>{doc.content.length > 1000 ? Math.round(doc.content.length/1024) + ' KB' : doc.content.length + ' chars'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
        {!selectedDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <i className="fas fa-robot text-4xl text-brand-200"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-600">AI Tutor Assistant</h3>
                <p className="text-sm">Chọn một tài liệu bên trái để bắt đầu hỏi đáp</p>
            </div>
        ) : (
            <>
                <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Đang xem tài liệu</p>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center">
                            <i className="fas fa-book-open text-brand-500 mr-2"></i> {selectedDoc.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedDoc.fileUrl && (
                            <a 
                                href={selectedDoc.fileUrl} 
                                download={selectedDoc.fileName}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs px-3 py-1.5 rounded-full font-bold transition-colors flex items-center shadow-sm"
                            >
                                <i className="fas fa-download mr-1.5"></i> Tải file gốc
                            </a>
                        )}
                        <button 
                            onClick={handleGenerateQuiz}
                            disabled={isLoading}
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs px-3 py-1.5 rounded-full font-bold transition-colors flex items-center shadow-sm"
                        >
                            <i className="fas fa-tasks mr-1.5"></i> Tạo câu hỏi Đ/S
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
                    {/* ... (Existing Chat Messages rendering) */}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3'} animate-fade-in-up`}>
                             {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center text-white shrink-0 shadow-md mt-1">
                                    <i className="fas fa-robot text-xs"></i>
                                </div>
                             )}
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                            }`}>
                                {msg.role === 'model' && <p className="text-[10px] font-bold text-brand-600 uppercase mb-1 tracking-wider">AI Tutor</p>}
                                
                                {msg.quizData ? (
                                    <div className="space-y-4 mt-2">
                                        <div className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">{msg.text}</div>
                                        {msg.quizData.map((q, idx) => {
                                            const userChoice = revealedAnswers[`${i}-${idx}`];
                                            const isRevealed = !!userChoice;
                                            const isCorrect = userChoice === q.correctAnswer;

                                            return (
                                                <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <p className="font-medium text-gray-800 mb-2">{idx + 1}. {q.content}</p>
                                                    
                                                    {!isRevealed ? (
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleQuizAnswer(i, idx, 'Đúng')}
                                                                className="flex-1 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors shadow-sm"
                                                            >
                                                                Đúng
                                                            </button>
                                                            <button 
                                                                onClick={() => handleQuizAnswer(i, idx, 'Sai')}
                                                                className="flex-1 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
                                                            >
                                                                Sai
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={`mt-2 p-2 rounded-lg text-xs ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            <div className="flex items-center font-bold mb-1">
                                                                <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} mr-1.5`}></i>
                                                                {isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
                                                            </div>
                                                            <p>Đáp án: <strong>{q.correctAnswer}</strong></p>
                                                            {q.explanation && <p className="mt-1 italic opacity-90">{q.explanation}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="markdown-body" style={{whiteSpace: 'pre-wrap'}}>{msg.text}</div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 mt-1">
                                    <i className="fas fa-user text-xs"></i>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center text-white shrink-0 shadow-md mt-1">
                                <i className="fas fa-robot text-xs"></i>
                             </div>
                             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center space-x-2">
                                <span className="text-xs font-bold text-gray-500">Đang suy nghĩ</span>
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập câu hỏi của bạn..."
                            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all shadow-inner"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <i className="fas fa-paper-plane text-xs"></i>
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        <i className="fas fa-shield-alt mr-1"></i>
                        Câu trả lời được tạo từ nội dung tài liệu. Hãy kiểm chứng thông tin quan trọng.
                    </p>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
