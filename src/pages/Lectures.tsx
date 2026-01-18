import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lecture, Role } from '../types';

const Lectures = () => {
  const { lectures, topics, currentUser, addLecture, deleteLecture, toggleLectureCompletion } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(10);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopicId, setNewTopicId] = useState('');
  const [newFile, setNewFile] = useState(''); // Base64 or URL
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'PDF' | 'IMAGE'>('PDF');

  const canEdit = currentUser?.role === Role.ADMIN || currentUser?.role === Role.TEACHER;

  // Filter Logic
  const gradeTopics = topics.filter(t => t.grade === selectedGrade);
  
  // Update topic filter when grade changes
  useEffect(() => {
      setSelectedTopicId('ALL');
  }, [selectedGrade]);

  const filteredLectures = lectures.filter(l => {
      const topic = topics.find(t => t.id === l.topicId);
      if (!topic || topic.grade !== selectedGrade) return false;
      if (selectedTopicId !== 'ALL' && l.topicId !== selectedTopicId) return false;
      return true;
  });

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.type.startsWith('image/') ? 'IMAGE' : 'PDF';
          if (type !== 'PDF' && type !== 'IMAGE') {
              alert('Chỉ chấp nhận file PDF hoặc Hình ảnh');
              return;
          }
          setNewFileType(type);
          setNewFileName(file.name);
          
          const reader = new FileReader();
          reader.onload = (event) => {
              setNewFile(event.target?.result as string || '');
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddLecture = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle || !newTopicId || !newFile) {
          alert('Vui lòng điền đầy đủ thông tin');
          return;
      }

      const lecture: Lecture = {
          id: Date.now().toString(),
          topicId: newTopicId,
          title: newTitle,
          description: newDesc,
          fileUrl: newFile,
          fileName: newFileName,
          fileType: newFileType,
          createdAt: new Date().toISOString()
      };

      addLecture(lecture);
      setShowForm(false);
      setNewTitle('');
      setNewDesc('');
      setNewTopicId('');
      setNewFile('');
      setNewFileName('');
      alert('Đã thêm bài giảng!');
  };

  // UI Helper: Grade Colors
  const getGradeTheme = (grade: number) => {
      switch(grade) {
          case 10: return { bg: 'bg-blue-600', text: 'text-blue-100', border: 'border-blue-500', icon: 'text-blue-200', gradient: 'from-blue-400 to-blue-600' };
          case 11: return { bg: 'bg-purple-600', text: 'text-purple-100', border: 'border-purple-500', icon: 'text-purple-200', gradient: 'from-purple-400 to-purple-600' };
          case 12: return { bg: 'bg-orange-600', text: 'text-orange-100', border: 'border-orange-500', icon: 'text-orange-200', gradient: 'from-orange-400 to-orange-600' };
          default: return { bg: 'bg-gray-600', text: 'text-gray-100', border: 'border-gray-500', icon: 'text-gray-200', gradient: 'from-gray-400 to-gray-600' };
      }
  };

  const currentTheme = getGradeTheme(selectedGrade);

  return (
    <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-3xl font-black text-gray-800 flex items-center">
                    <i className="fas fa-chalkboard-teacher text-brand-600 mr-3"></i> Thư Viện Bài Giảng
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Truy cập tài liệu và bài giảng điện tử theo chương trình</p>
            </div>
            {canEdit && (
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center"
                >
                    <i className={`fas ${showForm ? 'fa-minus' : 'fa-plus'} mr-2`}></i> 
                    {showForm ? 'Đóng' : 'Thêm bài giảng'}
                </button>
            )}
        </div>

        {/* Form */}
        {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-brand-100 animate-fade-in-down">
                <h3 className="font-bold text-lg mb-6 text-brand-700 uppercase tracking-wide">Tải lên bài giảng mới</h3>
                <form onSubmit={handleAddLecture} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tiêu đề bài giảng</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Ví dụ: Bài 1 - Thông tin và dữ liệu"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chủ đề (Khối {selectedGrade})</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                            value={newTopicId}
                            onChange={(e) => setNewTopicId(e.target.value)}
                        >
                            <option value="">-- Chọn chủ đề --</option>
                            {gradeTopics.map(t => (
                                <option key={t.id} value={t.id}>Tháng {t.month}: {t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">File bài giảng (PDF/Ảnh)</label>
                        <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white hover:border-brand-400 transition-all h-[50px] flex items-center justify-center text-gray-600 font-bold text-sm px-4 truncate">
                            {newFileName || (<span><i className="fas fa-cloud-upload-alt mr-2"></i> Chọn file</span>)}
                            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mô tả ngắn</label>
                        <textarea 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            rows={2}
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Tóm tắt nội dung..."
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 font-bold px-6 py-3 hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
                        <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-brand-700 transition-all">Lưu lại</button>
                    </div>
                </form>
            </div>
        )}

        {/* Grade Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[10, 11, 12].map((grade) => {
               const theme = getGradeTheme(grade);
               const isActive = selectedGrade === grade;
               
               // Calculate Progress (UI logic from the snippet)
               const gradeLectures = lectures.filter(l => {
                   const t = topics.find(topic => topic.id === l.topicId);
                   return t?.grade === grade;
               });
               const total = gradeLectures.length;
               const completed = gradeLectures.filter(l => currentUser?.completedLectureIds?.includes(l.id)).length;
               const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

               return (
                   <button
                       key={grade}
                       onClick={() => setSelectedGrade(grade as any)}
                       className={`relative p-6 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden group flex flex-col justify-between h-48 ${
                           isActive 
                           ? `${theme.bg} ${theme.border} text-white shadow-xl scale-[1.02] ring-4 ring-offset-2 ring-gray-200` 
                           : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg opacity-80 hover:opacity-100'
                       }`}
                   >
                       <div className="flex justify-between items-start mb-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                               <i className="fas fa-book-reader"></i>
                           </div>
                           {isActive && <i className="fas fa-check-circle text-2xl text-white/50"></i>}
                       </div>
                       
                       <h3 className={`text-3xl font-black ${isActive ? 'text-white' : 'text-gray-800'}`}>
                           Khối {grade}
                       </h3>
                       
                       {/* Logic from snippet */}
                       <div className="w-full mt-auto">
                              <div className={`flex justify-between items-end mb-2 transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase opacity-80 mb-1">Tiến độ</span>
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg w-fit ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                          {completed}/{total} bài
                                      </span>
                                  </div>
                                  <span className="text-3xl font-black leading-none">{percent}<span className="text-sm align-top font-bold">%</span></span>
                              </div>

                              <div className={`w-full h-4 rounded-full overflow-hidden ${isActive ? 'bg-black/20 shadow-inner' : 'bg-gray-100 border border-gray-200'}`}>
                                  <div 
                                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                          isActive 
                                          ? 'bg-white/90' 
                                          : `bg-gradient-to-r ${theme.gradient}`
                                      }`}
                                      style={{ width: `${percent}%` }}
                                  >
                                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')] opacity-30"></div>
                                  </div>
                              </div>
                              
                              <div className={`flex justify-between items-center mt-2 text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                                  <span>{percent === 100 ? 'Hoàn tất' : 'Đang học'}</span>
                                  <span>{percent < 100 ? `${total - completed} bài chưa xem` : 'Xuất sắc!'}</span>
                              </div>
                          </div>
                   </button>
               );
           })}
        </div>

        {/* Topic Filters */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex overflow-x-auto space-x-2 scrollbar-hide">
           <button
                onClick={() => setSelectedTopicId('ALL')}
                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedTopicId === 'ALL' 
                    ? `bg-gray-800 text-white shadow-md` 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
                Tất cả chủ đề
            </button>
            {gradeTopics.map(t => (
                <button
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center ${
                        selectedTopicId === t.id 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                    <i className={`fas ${t.icon} mr-2 opacity-70`}></i>
                    Tháng {t.month}: {t.name.split(':')[0]}
                </button>
            ))}
        </div>

        {/* Lectures List */}
        {filteredLectures.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <i className="fas fa-chalkboard text-4xl text-gray-300"></i>
               </div>
               <h4 className="font-bold text-xl text-gray-700">Chưa có bài giảng nào</h4>
               <p className="text-gray-500 mt-2">Nội dung đang được cập nhật.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
                {filteredLectures.map(lecture => {
                    const topic = topics.find(t => t.id === lecture.topicId);
                    const isCompleted = currentUser?.completedLectureIds?.includes(lecture.id);
                    const isPdf = lecture.fileType === 'PDF';
                    
                    return (
                        <div key={lecture.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:shadow-lg transition-all">
                            
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                <i className={`fas ${isCompleted ? 'fa-check-circle' : (isPdf ? 'fa-file-pdf' : 'fa-image')}`}></i>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-brand-600 transition-colors">{lecture.title}</h3>
                                <p className="text-gray-500 text-sm mb-2">{lecture.description}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">
                                        {topic?.name}
                                    </span>
                                    {isCompleted && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center"><i className="fas fa-check mr-1"></i> Đã học</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                <a 
                                    href={lecture.fileUrl}
                                    download={lecture.fileName}
                                    className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
                                >
                                    <i className="fas fa-download mr-2"></i> Tải về
                                </a>
                                
                                <button
                                    onClick={() => toggleLectureCompletion(lecture.id)}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all text-white shadow-md ${isCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-600 hover:bg-brand-700'}`}
                                >
                                    {isCompleted ? 'Đã xong' : 'Đánh dấu xong'}
                                </button>
                                
                                {canEdit && (
                                    <button 
                                        onClick={() => { if(window.confirm('Xóa bài giảng này?')) deleteLecture(lecture.id); }}
                                        className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors flex items-center justify-center"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default Lectures;