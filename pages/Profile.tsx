
import React from 'react';
import { useApp } from '../context/AppContext';
import { LEVEL_LABELS, Level } from '../types';

const Profile = () => {
  const { currentUser, attempts, topics, lectures } = useApp();
  
  if (!currentUser) return null;

  const myAttempts = attempts
    .filter(a => a.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- HELPER: GET ACHIEVEMENT DATA ---
  const getAchievementData = (level: Level) => {
      switch(level) {
          case Level.ELEMENTARY: 
            return { 
                medal: 'Đồng',
                medalColor: 'text-orange-600',
                medalBg: 'bg-orange-100',
                borderColor: 'border-orange-200',
                title: 'Giấy khen Thông hiểu',
                desc: 'Đã nắm vững kiến thức cơ bản',
                certColor: 'border-orange-500'
            };
          case Level.INTERMEDIATE: 
            return { 
                medal: 'Bạc',
                medalColor: 'text-gray-500',
                medalBg: 'bg-gray-100',
                borderColor: 'border-gray-200',
                title: 'Giấy khen Vận dụng',
                desc: 'Có khả năng giải quyết vấn đề tốt',
                certColor: 'border-gray-500'
            };
          case Level.ADVANCED: 
            return { 
                medal: 'Vàng',
                medalColor: 'text-yellow-600',
                medalBg: 'bg-yellow-100',
                borderColor: 'border-yellow-200',
                title: 'Giấy khen Xuất sắc',
                desc: 'Thành thạo kiến thức nâng cao',
                certColor: 'border-yellow-500'
            };
          case Level.EXPERT: 
            return { 
                medal: 'Kim cương',
                medalColor: 'text-cyan-600',
                medalBg: 'bg-cyan-100',
                borderColor: 'border-cyan-200',
                title: 'Chứng nhận Chuyên gia',
                desc: 'Đạt đỉnh cao tri thức môn học',
                certColor: 'border-cyan-500'
            };
          default: return null;
      }
  };

  const completedLevelsData = currentUser.completedLevels
    .map(l => ({ level: l, ...getAchievementData(l) }))
    .filter(d => d && d.medal) as any[];

  // Topic Certificates / Badges (Quiz Based)
  const topicBadges = currentUser.completedTopics.map(topicId => {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return null;
      return {
          id: topicId,
          title: topic.name,
          month: topic.month,
          icon: topic.icon,
          grade: topic.grade,
          color: 'text-brand-600',
          bg: 'bg-brand-50',
          border: 'border-brand-200'
      };
  }).filter(t => t !== null) as any[];

  // Lecture Progress Calculation
  const lectureStats = topics.map(t => {
      const topicLectures = lectures.filter(l => l.topicId === t.id);
      const total = topicLectures.length;
      const completed = topicLectures.filter(l => currentUser.completedLectureIds?.includes(l.id)).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { topic: t, total, completed, percent };
  }).filter(stat => stat.total > 0);

  // --- STATS CALCULATION FOR CHARTS ---
  // 1. Level Mastery Stats
  const levelOrder = [Level.INTRO, Level.ELEMENTARY, Level.INTERMEDIATE, Level.ADVANCED, Level.EXPERT];
  const levelStats = levelOrder.map(level => {
      const levelAttempts = myAttempts.filter(a => a.level === level);
      const totalAttempts = levelAttempts.length;
      const passedAttempts = levelAttempts.filter(a => a.passed).length;
      // Calculate mastery percentage (based on pass rate, defaulting to 0 if no attempts)
      const mastery = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
      // Find short label
      const shortLabel = LEVEL_LABELS[level].split(' ').pop(); 
      return { level, label: LEVEL_LABELS[level], shortLabel, mastery, count: totalAttempts };
  });

  // 2. Overall Completion
  const totalTopicProgress = lectureStats.reduce((acc, curr) => acc + curr.percent, 0);
  const avgCompletion = lectureStats.length > 0 ? Math.round(totalTopicProgress / lectureStats.length) : 0;
  
  // SVG Circle calculation
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (avgCompletion / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
       {/* Header Card */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 bg-gradient-to-br from-white to-gray-50">
           <div className="relative">
               <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-5xl font-bold shadow-lg ring-4 ring-brand-100">
                   {currentUser.name.charAt(0)}
               </div>
               {/* Show highest medal on avatar */}
               {completedLevelsData.length > 0 && (
                   <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                       <i className={`fas fa-medal text-2xl ${completedLevelsData[completedLevelsData.length-1]?.medalColor}`}></i>
                   </div>
               )}
           </div>
           
           <div className="text-center md:text-left flex-1">
               <h2 className="text-3xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
               <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start">
                   <i className="fas fa-envelope mr-2"></i> {currentUser.email}
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                   <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
                       <i className="fas fa-layer-group text-brand-600 mr-2"></i>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Cấp độ hiện tại</p>
                           <p className="font-bold text-gray-800">{LEVEL_LABELS[currentUser.currentLevel]}</p>
                       </div>
                   </div>
                   <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
                       <i className="fas fa-star text-yellow-500 mr-2"></i>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Tổng điểm</p>
                           <p className="font-bold text-gray-800">{currentUser.totalScore} XP</p>
                       </div>
                   </div>
                   <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
                       <i className="fas fa-trophy text-orange-500 mr-2"></i>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Tổng danh hiệu</p>
                           <p className="font-bold text-gray-800">{completedLevelsData.length + topicBadges.length} Huy chương</p>
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {/* NEW: ANALYTICS SECTION */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Chart 1: Level Mastery Bar Chart */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center">
                            <i className="fas fa-chart-bar text-brand-500 mr-2"></i> Phân bổ năng lực
                        </h3>
                        <p className="text-xs text-gray-500">Tỷ lệ hoàn thành bài kiểm tra theo cấp độ</p>
                    </div>
                </div>
                
                <div className="flex items-end justify-between h-48 gap-2 pt-4 pb-2 px-2">
                    {levelStats.map((stat, idx) => {
                        // Dynamic styling based on mastery %
                        const height = Math.max(10, stat.mastery); // Min height 10%
                        let colorClass = 'bg-gray-200';
                        if (stat.mastery >= 80) colorClass = 'bg-green-500';
                        else if (stat.mastery >= 50) colorClass = 'bg-brand-500';
                        else if (stat.count > 0) colorClass = 'bg-yellow-400';

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-10 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {stat.mastery}% ({stat.count} lượt thi)
                                </div>
                                
                                <div className="w-full bg-gray-50 rounded-t-lg relative flex items-end h-full overflow-hidden">
                                    <div 
                                        className={`w-full ${colorClass} rounded-t-lg transition-all duration-1000 ease-out relative hover:opacity-90`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase text-center truncate w-full" title={stat.label}>
                                    {stat.shortLabel || stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chart 2: Overall Progress Donut */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                 <h3 className="font-bold text-gray-800 text-lg mb-1">Tổng quan Tiến độ</h3>
                 <p className="text-xs text-gray-500 mb-6">Dựa trên bài giảng & bài tập</p>
                 
                 <div className="relative w-40 h-40">
                     {/* SVG Circle Chart */}
                     <svg className="w-full h-full transform -rotate-90">
                         {/* Background Circle */}
                         <circle
                             cx="50%"
                             cy="50%"
                             r={radius}
                             stroke="#f3f4f6"
                             strokeWidth="8"
                             fill="transparent"
                         />
                         {/* Progress Circle */}
                         <circle
                             cx="50%"
                             cy="50%"
                             r={radius}
                             stroke="currentColor"
                             strokeWidth="8"
                             fill="transparent"
                             strokeDasharray={circumference}
                             strokeDashoffset={strokeDashoffset}
                             strokeLinecap="round"
                             className="text-brand-500 transition-all duration-1000 ease-out"
                         />
                     </svg>
                     {/* Center Text */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-600">
                         <span className="text-3xl font-black">{avgCompletion}%</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Hoàn thành</span>
                     </div>
                 </div>

                 <div className="mt-6 w-full space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-gray-500 font-bold">Bài giảng đã xem</span>
                         <span className="font-bold text-gray-800">{currentUser.completedLectureIds?.length || 0} bài</span>
                     </div>
                     <div className="flex justify-between text-xs">
                         <span className="text-gray-500 font-bold">Chủ đề hoàn tất</span>
                         <span className="font-bold text-gray-800">{currentUser.completedTopics.length} chủ đề</span>
                     </div>
                 </div>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* LEFT COLUMN: Achievements Wall */}
           <div className="lg:col-span-2 space-y-8">
               
               {/* 1. MEDAL COLLECTION */}
               <div>
                   <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center">
                        <i className="fas fa-crown text-yellow-500 mr-2"></i> Bộ sưu tập Huy chương & Danh hiệu
                   </h3>
                   {completedLevelsData.length === 0 && topicBadges.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                            Chưa có huy chương nào. Hãy hoàn thành các bài học và bài kiểm tra để nhận thưởng!
                        </div>
                   ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Level Medals */}
                            {completedLevelsData.map((item, idx) => (
                                <div key={`lvl-${idx}`} className={`bg-white p-4 rounded-xl border ${item.borderColor} shadow-sm flex flex-col items-center justify-center hover:-translate-y-1 transition-transform relative overflow-hidden group`}>
                                    <div className={`absolute top-0 right-0 p-1.5 rounded-bl-lg ${item.medalBg} text-[10px] font-bold ${item.medalColor} opacity-70`}>
                                        CẤP ĐỘ
                                    </div>
                                    <div className={`w-16 h-16 rounded-full ${item.medalBg} flex items-center justify-center text-3xl mb-3 shadow-inner`}>
                                        <i className={`fas fa-medal ${item.medalColor} drop-shadow-sm`}></i>
                                    </div>
                                    <h4 className={`font-bold text-sm text-center ${item.medalColor.replace('text', 'text-opacity-90')}`}>Huy chương {item.medal}</h4>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">{LEVEL_LABELS[item.level]}</p>
                                </div>
                            ))}

                            {/* Topic Badges */}
                            {topicBadges.map((item, idx) => (
                                <div key={`topic-${idx}`} className={`bg-white p-4 rounded-xl border ${item.border} shadow-sm flex flex-col items-center justify-center hover:-translate-y-1 transition-transform relative overflow-hidden group`}>
                                    <div className={`absolute top-0 right-0 p-1.5 rounded-bl-lg ${item.bg} text-[10px] font-bold ${item.color} opacity-70`}>
                                        CHỦ ĐỀ
                                    </div>
                                    <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center text-3xl mb-3 shadow-inner`}>
                                        <i className={`fas ${item.icon} ${item.color} drop-shadow-sm`}></i>
                                    </div>
                                    <h4 className={`font-bold text-xs text-center text-gray-800 line-clamp-1 w-full px-1`} title={item.title}>
                                        {item.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center">Hoàn thành Tháng {item.month}</p>
                                </div>
                            ))}

                            {/* Placeholder for visual balance if needed */}
                            {[...Array(Math.max(0, (3 - (completedLevelsData.length + topicBadges.length) % 3) % 3))].map((_, i) => (
                                <div key={`lock-${i}`} className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center opacity-40">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-3 text-gray-300">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold">Chưa mở khóa</p>
                                </div>
                            ))}
                        </div>
                   )}
               </div>

               {/* 2. CERTIFICATES OF MERIT (GIẤY KHEN) */}
               <div>
                   <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center">
                        <i className="fas fa-scroll text-brand-600 mr-2"></i> Bảng vàng thành tích
                   </h3>
                   <div className="grid grid-cols-1 gap-6">
                       {completedLevelsData.map((item, idx) => (
                           <div key={idx} className="relative bg-[#fffdf5] p-6 rounded-lg shadow-md border-4 border-double border-yellow-200 group hover:shadow-xl transition-shadow overflow-hidden">
                               {/* Decorative Corner */}
                               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-100 to-transparent"></div>
                               
                               <div className="relative z-10 text-center border-2 border-dashed border-gray-200 p-6 h-full flex flex-col justify-center">
                                   <div className="mb-4">
                                       <i className={`fas fa-certificate text-5xl ${item.medalColor}`}></i>
                                   </div>
                                   <h4 className="font-serif text-2xl font-bold text-gray-800 uppercase tracking-widest mb-1">Giấy Khen</h4>
                                   <p className="text-sm text-gray-500 font-serif italic mb-6">Chứng nhận thành tích học tập</p>
                                   
                                   <div className="mb-6">
                                       <p className="text-lg text-gray-600 mb-1">Trao tặng cho học sinh:</p>
                                       <p className="text-2xl font-bold text-brand-700 font-serif">{currentUser.name}</p>
                                   </div>

                                   <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
                                       Đã xuất sắc vượt qua các bài kiểm tra và hoàn thành cấp độ <br/> 
                                       <strong className="uppercase text-lg text-gray-800">{LEVEL_LABELS[item.level]}</strong>
                                       <br/>
                                       <span className="text-sm italic text-gray-500">"{item.desc}"</span>
                                   </p>
                                   
                                   <div className="mt-auto pt-6 border-t border-gray-200 flex justify-between items-end px-4">
                                       <div className="text-left">
                                           <div className="w-16 h-16 opacity-10 absolute bottom-6 left-6">
                                               <i className="fas fa-award text-6xl text-brand-900"></i>
                                           </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Ngày cấp</p>
                                            <p className="text-xs font-bold text-gray-600">{new Date().toLocaleDateString()}</p>
                                       </div>
                                       <div className="text-right">
                                           <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Xác nhận bởi</p>
                                           <p className="font-dancing-script text-xl text-brand-600 font-bold" style={{fontFamily: 'cursive'}}>LHP LMS System</p>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       ))}
                       {completedLevelsData.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                                <i className="fas fa-file-contract text-4xl mb-3 opacity-30"></i>
                                <p>Chưa có giấy khen nào.</p>
                            </div>
                       )}
                   </div>
               </div>
           </div>

           {/* RIGHT COLUMN: Sidebar Stats */}
           <div className="space-y-6">

                {/* Lecture Progress Summary (Existing) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                        <h4 className="font-bold text-blue-800 flex items-center">
                            <i className="fas fa-book-reader mr-2"></i> Tiến độ Bài giảng
                        </h4>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {lectureStats.length > 0 ? (
                            <div className="space-y-4">
                                {lectureStats.map((stat) => (
                                    <div key={stat.topic.id} className="group">
                                        <div className="flex justify-between items-end mb-1">
                                            <div className="flex items-center gap-2 max-w-[70%]">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${stat.percent === 100 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <i className={`fas ${stat.topic.icon}`}></i>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 truncate" title={stat.topic.name}>
                                                    {stat.topic.name}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                                                {stat.completed}/{stat.total} ({stat.percent}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    stat.percent === 100 ? 'bg-green-500' : 'bg-brand-500'
                                                }`} 
                                                style={{ width: `${stat.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400 text-xs">
                                Chưa có dữ liệu bài giảng.
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Topic Completion List (Existing) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-brand-50 border-b border-brand-100">
                        <h4 className="font-bold text-brand-800 flex items-center">
                            <i className="fas fa-clipboard-check mr-2"></i> Chủ đề đã hoàn thành (Quiz)
                        </h4>
                    </div>
                    <div className="p-4">
                        {topicBadges.length > 0 ? (
                            <ul className="space-y-3">
                                {topicBadges.map(topic => (
                                    <li key={topic.id} className="flex items-center text-sm text-gray-700 p-2 hover:bg-gray-50 rounded transition-colors">
                                        <div className={`w-8 h-8 rounded-full ${topic.bg} flex items-center justify-center text-brand-600 mr-3 shrink-0`}>
                                            <i className={`fas ${topic.icon} text-xs`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs truncate">{topic.title}</p>
                                            <p className="text-[10px] text-gray-400">Tháng {topic.month}</p>
                                        </div>
                                        <i className="fas fa-check-circle text-green-500"></i>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 italic mb-2">Chưa hoàn thành chủ đề nào.</p>
                                <a href="#/lectures" className="text-xs font-bold text-brand-600 hover:underline">Đến bài học ngay</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent History (Existing) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[500px]">
                   <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
                       <h3 className="font-bold text-gray-800 text-sm">
                         <i className="fas fa-history mr-2 text-gray-500"></i>
                         Lịch sử kiểm tra
                       </h3>
                   </div>
                   <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                       {myAttempts.length === 0 ? (
                           <div className="p-6 text-center text-gray-400 text-sm">
                               Chưa có hoạt động nào.
                           </div>
                       ) : (
                           <div className="divide-y divide-gray-100">
                               {myAttempts.map(attempt => {
                                   // Find topic name if available
                                   const t = topics.find(tp => tp.id === attempt.topicId);
                                   const topicName = t ? t.name : 'Bài kiểm tra';
                                   
                                   return (
                                       <div key={attempt.id} className="p-3 hover:bg-gray-50 transition-colors flex items-center group">
                                           <div className={`w-1.5 h-10 rounded-full mr-3 ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                           <div className="flex-1 min-w-0">
                                               <p className="text-sm font-bold text-gray-800 truncate group-hover:text-brand-600 transition-colors">{topicName}</p>
                                               <p className="text-xs text-gray-500">
                                                   {attempt.level ? LEVEL_LABELS[attempt.level] : 'Tổng hợp'} • {new Date(attempt.date).toLocaleDateString()}
                                               </p>
                                           </div>
                                           <div className="text-right">
                                               <span className={`text-sm font-black ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                   {attempt.score}/{attempt.maxScore}
                                               </span>
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       )}
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default Profile;
