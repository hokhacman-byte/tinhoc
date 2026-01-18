
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Worksheet } from '../types';

const Worksheets = () => {
  const { worksheets, topics, currentUser, addWorksheet, deleteWorksheet, submitWorksheet } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(10);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');

  // Form State (Upload new worksheet - Teacher)
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopicId, setNewTopicId] = useState('');
  const [newFile, setNewFile] = useState(''); // Base64
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'PDF' | 'DOCX'>('PDF');

  // Submission State (Student)
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);

  const canEdit = currentUser?.role === Role.ADMIN || currentUser?.role === Role.TEACHER;

  // Filter Logic
  const gradeTopics = topics.filter(t => t.grade === selectedGrade);
  
  useEffect(() => {
      setSelectedTopicId('ALL');
  }, [selectedGrade]);

  const filteredWorksheets = worksheets.filter(w => {
      const topic = topics.find(t => t.id === w.topicId);
      if (!topic || topic.grade !== selectedGrade) return false;
      if (selectedTopicId !== 'ALL' && w.topicId !== selectedTopicId) return false;
      return true;
  });

  // Teacher Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.name.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF';
          setNewFileType(type);
          setNewFileName(file.name);
          const reader = new FileReader();
          reader.onload = (event) => setNewFile(event.target?.result as string || '');
          reader.readAsDataURL(file);
      }
  };

  const handleAddWorksheet = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle || !newTopicId || !newFile) return alert('Vui lòng điền đầy đủ thông tin');
      const worksheet: Worksheet = {
          id: Date.now().toString(),
          topicId: newTopicId,
          title: newTitle,
          description: newDesc,
          fileUrl: newFile,
          fileName: newFileName,
          fileType: newFileType,
          createdAt: new Date().toISOString()
      };
      addWorksheet(worksheet);
      setShowForm(false);
      // Reset fields...
      setNewTitle(''); setNewDesc(''); setNewTopicId(''); setNewFile(''); setNewFileName('');
      alert('Đã thêm phiếu bài tập!');
  };

  // Student Handlers
  const handleStudentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setStudentFile(e.target.files[0]);
      }
  };

  const handleSubmitWork = () => {
      if (!submissionId || !studentFile || !currentUser) return;
      
      // Simulate API call / storage
      setTimeout(() => {
          submitWorksheet(submissionId, currentUser.id);
          alert(`Nộp bài thành công! File: ${studentFile.name}`);
          setSubmissionId(null);
          setStudentFile(null);
      }, 1000);
  };

  // UI Helper: Grade Colors
  const getGradeTheme = (grade: number) => {
      switch(grade) {
          case 10: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', button: 'bg-blue-600 hover:bg-blue-700' };
          case 11: return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', button: 'bg-purple-600 hover:bg-purple-700' };
          case 12: return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', button: 'bg-orange-600 hover:bg-orange-700' };
          default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-500', button: 'bg-gray-600 hover:bg-gray-700' };
      }
  };

  const currentTheme = getGradeTheme(selectedGrade);

  return (
    <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-3xl font-black text-gray-800 flex items-center">
                    <i className="fas fa-file-alt text-brand-600 mr-3"></i> Kho Phiếu Bài Tập
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Tải về bài tập và nộp bài làm của bạn tại đây</p>
            </div>
            {canEdit && (
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center"
                >
                    <i className={`fas ${showForm ? 'fa-minus' : 'fa-plus'} mr-2`}></i> 
                    {showForm ? 'Đóng' : 'Thêm phiếu bài tập'}
                </button>
            )}
        </div>

        {/* Teacher Upload Form */}
        {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-brand-100 animate-fade-in-down">
                {/* ... existing form inputs ... */}
                <h3 className="font-bold text-lg mb-6 text-brand-700 uppercase tracking-wide">Tải lên phiếu bài tập mới</h3>
                <form onSubmit={handleAddWorksheet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tiêu đề</label>
                        <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chủ đề</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                            value={newTopicId}
                            onChange={(e) => setNewTopicId(e.target.value)}
                        >
                            <option value="">-- Chọn chủ đề --</option>
                            {gradeTopics.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">File</label>
                        <input type="file" onChange={handleFileUpload} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Lưu lại</button>
                    </div>
                </form>
            </div>
        )}

        {/* Grade Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[10, 11, 12].map((grade) => {
               const theme = getGradeTheme(grade);
               const isActive = selectedGrade === grade;
               return (
                   <button
                       key={grade}
                       onClick={() => setSelectedGrade(grade as any)}
                       className={`relative p-6 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden group ${
                           isActive 
                           ? `bg-white ${theme.border} shadow-xl scale-[1.02] ring-4 ring-offset-2 ring-${theme.text.split('-')[1]}-200` 
                           : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg opacity-80 hover:opacity-100'
                       }`}
                   >
                       <h3 className={`text-3xl font-black ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>Khối {grade}</h3>
                   </button>
               );
           })}
        </div>

        {/* Topic Filters */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex overflow-x-auto space-x-2 scrollbar-hide">
           <button onClick={() => setSelectedTopicId('ALL')} className="px-6 py-3 rounded-xl text-sm font-bold bg-gray-800 text-white">Tất cả</button>
        </div>

        {/* Worksheet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredWorksheets.map(ws => {
                const topic = topics.find(t => t.id === ws.topicId);
                const isPdf = ws.fileType === 'PDF';
                const isSubmitted = currentUser && ws.submittedBy?.includes(currentUser.id);
                
                return (
                    <div key={ws.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                        {/* Status Badge */}
                        {isSubmitted && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                <i className="fas fa-check mr-1"></i> Đã nộp
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${isPdf ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                <i className={`fas ${isPdf ? 'fa-file-pdf' : 'fa-file-word'}`}></i>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[56px] group-hover:text-brand-600 transition-colors">
                            {ws.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">
                            {ws.description}
                        </p>

                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-6">
                            <i className={`fas ${topic?.icon} mr-1`}></i>
                            {topic?.name.split(':')[0]}
                        </div>

                        <div className="mt-auto space-y-2">
                            <div className="flex items-center gap-3">
                                <a 
                                    href={ws.fileUrl} 
                                    download={ws.fileName}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm text-white shadow-md flex items-center justify-center transition-transform active:scale-95 ${currentTheme.button}`}
                                >
                                    <i className="fas fa-download mr-2"></i> Tải đề
                                </a>
                                {canEdit && (
                                    <button 
                                        onClick={() => deleteWorksheet(ws.id)}
                                        className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </div>
                            
                            {/* Student Submit Button */}
                            {!canEdit && (
                                <button 
                                    onClick={() => setSubmissionId(ws.id)}
                                    className={`w-full py-2 rounded-lg font-bold text-xs border transition-all ${isSubmitted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    disabled={!!isSubmitted}
                                >
                                    {isSubmitted ? 'Đã nộp bài' : 'Nộp bài làm'}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Submission Modal */}
        {submissionId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-800">Nộp bài tập</h3>
                        <button onClick={() => {setSubmissionId(null); setStudentFile(null);}} className="text-gray-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">Vui lòng tải lên file bài làm của bạn (Word, PDF, hoặc Ảnh chụp).</p>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-brand-400 transition-all bg-gray-50/50">
                            {studentFile ? (
                                <div className="text-center">
                                    <i className="fas fa-file-check text-green-500 text-2xl mb-2"></i>
                                    <p className="text-sm font-bold text-gray-800">{studentFile.name}</p>
                                    <p className="text-xs text-gray-500">{(studentFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                                    <p className="text-sm font-bold">Chọn file từ máy tính</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleStudentFileSelect} />
                        </label>
                    </div>
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <button onClick={() => {setSubmissionId(null); setStudentFile(null);}} className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-200 rounded-lg">Hủy</button>
                        <button 
                            onClick={handleSubmitWork}
                            disabled={!studentFile}
                            className={`px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-md transition-all ${!studentFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-700'}`}
                        >
                            Nộp bài
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Worksheets;
