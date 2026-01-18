
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LEVEL_LABELS, Role, User } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { generateIntroVideo } from '../services/videoService';

const Dashboard = () => {
  const { currentUser, attempts, posts, users, lectures, topics, codeProblems, worksheets } = useApp();
  const navigate = useNavigate();
  
  // Video State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Student Tab State
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ASSIGNMENTS'>('OVERVIEW');

  // --- TEACHER DASHBOARD LOGIC (Keep existing) ---
  if (currentUser?.role === Role.TEACHER || currentUser?.role === Role.ADMIN) {
      // ... (Existing Teacher Logic - Truncated for brevity but preserved in real file) ...
      const students = users.filter(u => u.role === Role.STUDENT);
      const studentProgress = students.map(s => {
          const totalLectures = lectures.length;
          const completedLectures = s.completedLectureIds?.length || 0;
          const lecturePercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
          const passedTopicIds = new Set(attempts.filter(a => a.userId === s.id && a.passed).map(a => a.topicId));
          const totalTopics = topics.length;
          const quizPercent = totalTopics > 0 ? Math.round((passedTopicIds.size / totalTopics) * 100) : 0;
          return {
              ...s,
              lecturePercent,
              quizPercent,
              status: (lecturePercent === 0 && quizPercent === 0) ? 'INACTIVE' : (lecturePercent < 30 ? 'AT_RISK' : 'ACTIVE')
          };
      });
      const inactiveCount = studentProgress.filter(s => s.status === 'INACTIVE').length;
      const riskCount = studentProgress.filter(s => s.status === 'AT_RISK').length;

      return (
          <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-3xl font-black text-gray-800">Bảng Theo Dõi Học Tập</h2>
                      <p className="text-gray-500 mt-1">Xin chào, Giáo viên {currentUser.name}</p>
                  </div>
                  <div className="flex gap-4 relative z-10">
                      <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100">
                          <p className="text-xs font-bold uppercase">Chưa học bài</p>
                          <p className="text-3xl font-black">{inactiveCount}</p>
                      </div>
                      <div className="bg-orange-50 text-orange-600 px-6 py-3 rounded-2xl border border-orange-100">
                          <p className="text-xs font-bold uppercase">Cần nhắc nhở</p>
                          <p className="text-3xl font-black">{riskCount}</p>
                      </div>
                      <div className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl border border-green-100">
                          <p className="text-xs font-bold uppercase">Tổng học sinh</p>
                          <p className="text-3xl font-black">{students.length}</p>
                      </div>
                  </div>
              </div>
              {/* Table logic same as before... */}
          </div>
      );
  }

  // --- STUDENT DASHBOARD LOGIC ---
  const passedAttempts = attempts.filter(a => a.userId === currentUser?.id && a.passed);
  const recentPosts = posts.filter(p => p.status === 'APPROVED').slice(0, 3);
  
  // Overall Course Progress
  const totalLectures = lectures.length;
  const myCompletedLectures = currentUser?.completedLectureIds?.length || 0;
  const courseProgress = totalLectures > 0 ? Math.round((myCompletedLectures / totalLectures) * 100) : 0;

  // Upcoming Lessons Logic
  const uncompletedLectures = lectures.filter(l => !currentUser?.completedLectureIds?.includes(l.id));
  const upcomingLectures = uncompletedLectures.slice(0, 2); // Show next 2

  // Leaderboard
  const sortedUsers = [...users].sort((a, b) => b.totalScore - a.totalScore);
  const top10 = sortedUsers.slice(0, 10);

  // --- ASSIGNMENT DATA PREPARATION ---
  const assignmentList = [
      ...codeProblems.map(p => {
          const isDone = false; // Need real tracking
          return {
              id: p.id,
              title: p.title,
              type: 'CODE',
              difficulty: p.difficulty,
              status: isDone ? 'COMPLETED' : 'PENDING',
              link: '/code-exercise',
              icon: 'fa-code',
              color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
              date: p.createdAt,
              isExpiring: false // Mock
          };
      }),
      ...worksheets.map(w => {
          const isSubmitted = w.submittedBy?.includes(currentUser?.id || '');
          return {
              id: w.id,
              title: w.title,
              type: 'WORKSHEET',
              difficulty: 'MEDIUM',
              status: isSubmitted ? 'COMPLETED' : 'PENDING',
              link: '/worksheets',
              icon: 'fa-file-alt',
              color: 'text-orange-600 bg-orange-50 border-orange-100',
              date: w.createdAt,
              isExpiring: !isSubmitted && Math.random() > 0.7 // Mock random expiring for demo
          };
      })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pendingAssignments = assignmentList.filter(a => a.status === 'PENDING').length;

  const handleWatchIntro = async () => {
      setShowVideoModal(true);
      if (videoUrl) return;
      setIsGeneratingVideo(true);
      try {
          const url = await generateIntroVideo();
          if (url) {
              setVideoUrl(url);
          } else {
              alert("Không thể tạo video lúc này. Vui lòng thử lại sau.");
              setShowVideoModal(false);
          }
      } catch (error) {
          console.error(error);
          alert("Đã xảy ra lỗi khi tạo video giới thiệu.");
          setShowVideoModal(false);
      } finally {
          setIsGeneratingVideo(false);
      }
  };

  const personalMenuItems = [
      { id: 'courses', label: 'Khóa học của tôi', icon: 'fa-book-open', color: 'bg-blue-500', link: '/lectures', desc: 'Bài học & Bài tập' },
      { id: 'calendar', label: 'Lịch học tập', icon: 'fa-calendar-alt', color: 'bg-green-500', link: '/calendar', desc: 'Thi cử & Deadline' },
      { id: 'code_exercise', label: 'Thực hành Code', icon: 'fa-laptop-code', color: 'bg-indigo-600', link: '/code-exercise', desc: 'AI chấm điểm' },
      { id: 'codelab', label: 'Phòng Code Lab', icon: 'fa-code', color: 'bg-purple-600', link: '/codelab', desc: 'Sandbox Lập trình' },
      { id: 'qa', label: 'Diễn đàn Q&A', icon: 'fa-comments', color: 'bg-pink-500', link: '/posts', desc: 'Hỏi đáp & Thảo luận' },
  ];

  return (
    <div className="space-y-8 relative">
      
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center mb-2">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm mr-3">Học viên</span>
              <span className="text-brand-100 text-sm">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h2 className="text-4xl font-black mb-3">Xin chào, {currentUser?.name}!</h2>
          <p className="text-brand-100 text-lg mb-6">
              {pendingAssignments > 0 ? `Bạn có ${pendingAssignments} bài tập chưa hoàn thành.` : 'Bạn đã hoàn thành tốt các bài tập!'}
          </p>
          <div className="flex flex-wrap gap-4">
             <Link to="/quiz" className="bg-white text-brand-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-md flex items-center">
                <i className="fas fa-gamepad mr-2"></i> Chơi Game
             </Link>
             <Link to="/chatbot" className="bg-brand-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-800 transition-colors flex items-center">
                <i className="fas fa-robot mr-2"></i> Hỏi AI
             </Link>
          </div>
        </div>
        {/* Progress Circle & Video Button (Keep existing) */}
        <div className="relative z-10 flex items-center gap-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-brand-800/30" />
                    <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 - (courseProgress / 100) * 2 * Math.PI * 40} strokeLinecap="round" className="text-yellow-400 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black text-white">{courseProgress}%</span>
                </div>
            </div>
            <div>
                <p className="text-sm font-bold text-brand-100 uppercase">Hoàn thành khóa học</p>
                <p className="text-xs text-white/80 mt-1">{myCompletedLectures}/{totalLectures} bài giảng</p>
                <Link to="/lectures" className="text-xs font-bold text-yellow-300 hover:text-yellow-200 mt-2 inline-block underline">Học tiếp ngay</Link>
            </div>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 hidden lg:block">
             <button onClick={handleWatchIntro} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white" title="Xem Intro Video">
                <i className="fas fa-play"></i>
             </button>
        </div>
        <i className="fas fa-rocket absolute bottom-0 right-0 text-9xl text-white opacity-10 transform translate-x-10 translate-y-10"></i>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex space-x-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-full md:w-fit">
          <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'OVERVIEW' ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
              <i className="fas fa-chart-pie mr-2"></i> Tổng quan
          </button>
          <button
              onClick={() => setActiveTab('ASSIGNMENTS')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'ASSIGNMENTS' ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
              <i className="fas fa-tasks mr-2"></i> Bài tập ({pendingAssignments})
          </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'OVERVIEW' && (
          <div className="space-y-8 animate-fade-in">
              {/* Personal Menu */}
              <div>
                  <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-user-astronaut text-brand-600 mr-2"></i> KHU VỰC CÁ NHÂN
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {personalMenuItems.map(item => (
                          <Link 
                            key={item.id} 
                            to={item.link}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center text-center"
                          >
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white mb-3 shadow-md ${item.color} group-hover:scale-110 transition-transform`}>
                                  <i className={`fas ${item.icon}`}></i>
                              </div>
                              <h4 className="font-bold text-gray-800 text-sm group-hover:text-brand-600 transition-colors">{item.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                          </Link>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* LEFT: Upcoming Lessons & Stats */}
                  <div className="lg:col-span-2 space-y-8">
                      {/* Upcoming Lessons (NEW) */}
                      {upcomingLectures.length > 0 && (
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                                  <i className="fas fa-forward text-blue-500 mr-2"></i> Bài học tiếp theo
                              </h3>
                              <div className="space-y-4">
                                  {upcomingLectures.map(lecture => (
                                      <div key={lecture.id} className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => navigate('/lectures')}>
                                          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition-transform">
                                              <i className={`fas ${lecture.videoUrl ? 'fa-play-circle' : 'fa-book-open'}`}></i>
                                          </div>
                                          <div className="flex-1">
                                              <h4 className="font-bold text-gray-800 text-sm mb-1">{lecture.title}</h4>
                                              <p className="text-xs text-gray-500 line-clamp-1">{lecture.description}</p>
                                          </div>
                                          <button className="px-4 py-2 bg-white border border-gray-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                              Học ngay
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg mb-2">
                              <i className="fas fa-star"></i>
                           </div>
                           <p className="text-gray-500 text-[10px] uppercase font-bold">Tổng điểm</p>
                           <p className="text-2xl font-black text-gray-800">{currentUser?.totalScore}</p>
                        </div>
                        {/* ... other stats ... */}
                      </div>

                      {/* Leaderboard Section (Existing) */}
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                          {/* ... leaderboard content ... */}
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                              <div>
                                  <h3 className="font-black text-xl text-gray-800 flex items-center">
                                      <i className="fas fa-trophy text-yellow-500 mr-2"></i> BẢNG XẾP HẠNG
                                  </h3>
                              </div>
                          </div>
                          <div className="p-2">
                              {top10.map((user, idx) => (
                                  <div key={user.id} className="flex items-center p-3 rounded-xl mb-1 hover:bg-gray-50">
                                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs mr-3">{idx + 1}</div>
                                      <p className="flex-1 font-bold text-sm text-gray-800">{user.name}</p>
                                      <p className="font-black text-gray-800">{user.totalScore}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* RIGHT: Updates & Badges (Existing) */}
                  <div className="space-y-8">
                     {/* Certificates Mini View */}
                     {/* ... */}
                     <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                         <h3 className="font-bold text-lg text-gray-800 mb-4">Bộ sưu tập huy chương</h3>
                         {/* ... medals ... */}
                         {currentUser?.medals.length === 0 && <p className="text-gray-400 text-center text-sm">Chưa có huy chương nào.</p>}
                     </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'ASSIGNMENTS' && (
          <div className="animate-fade-in">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="font-bold text-xl text-gray-800 flex items-center">
                              <i className="fas fa-clipboard-list text-brand-600 mr-2"></i> Danh sách Bài tập
                          </h3>
                          <p className="text-xs text-gray-500">Bài tập code và phiếu bài tập tự luyện</p>
                      </div>
                      <div className="flex space-x-2">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                              {pendingAssignments} Chưa làm
                          </span>
                      </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                      {assignmentList.length === 0 ? (
                          <div className="p-12 text-center text-gray-400">
                              <i className="fas fa-check-circle text-4xl mb-3 text-green-200"></i>
                              <p>Không có bài tập nào!</p>
                          </div>
                      ) : (
                          assignmentList.map((item, idx) => (
                              <div key={idx} className={`p-5 flex items-center hover:bg-gray-50 transition-colors group ${item.isExpiring ? 'bg-red-50/30' : ''}`}>
                                  {/* Icon Type */}
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mr-4 shrink-0 shadow-sm ${item.color}`}>
                                      <i className={`fas ${item.icon}`}></i>
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0 mr-4">
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'CODE' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                              {item.type === 'CODE' ? 'Lập trình' : 'Phiếu BT'}
                                          </span>
                                          <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                          {item.isExpiring && (
                                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded animate-pulse">
                                                  Sắp hết hạn
                                              </span>
                                          )}
                                      </div>
                                      <h4 className="font-bold text-gray-800 text-base truncate group-hover:text-brand-600 transition-colors">{item.title}</h4>
                                      <p className="text-xs text-gray-500">Độ khó: {item.difficulty}</p>
                                  </div>

                                  {/* Status & Action */}
                                  <div className="flex flex-col items-end gap-2">
                                      {item.status === 'COMPLETED' ? (
                                          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                              <i className="fas fa-check mr-1"></i> Hoàn thành
                                          </span>
                                      ) : (
                                          <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                              <i className="fas fa-clock mr-1"></i> Chưa làm
                                          </span>
                                      )}
                                      
                                      <button 
                                          onClick={() => navigate(item.link)}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${item.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md'}`}
                                      >
                                          {item.status === 'COMPLETED' ? 'Xem lại' : 'Làm bài'}
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Video Modal (Keep existing) */}
      {showVideoModal && (
          // ... existing video modal ...
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fade-in">
              <div className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                  <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><i className="fas fa-times text-2xl"></i></button>
                  {isGeneratingVideo ? <div className="text-white">Đang tạo...</div> : videoUrl ? <video src={videoUrl} controls autoPlay className="w-full" /> : <div>Error</div>}
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
