
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SurveyResponse, Role } from '../types';

const Survey = () => {
  const { currentUser, submitSurvey, surveyResponses } = useApp();
  // Standard Scores
  const [uiScore, setUiScore] = useState(0);
  const [uxScore, setUxScore] = useState(0);
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [lectureScore, setLectureScore] = useState(0);
  // Agreement Scores
  const [practicalScore, setPracticalScore] = useState(0);
  const [motivationScore, setMotivationScore] = useState(0);
  
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // View State for Admin/Teacher
  const [activeTab, setActiveTab] = useState<'FORM' | 'STATS'>('FORM');

  const isAdminOrTeacher = currentUser?.role === Role.ADMIN || currentUser?.role === Role.TEACHER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (uiScore === 0 || uxScore === 0 || knowledgeScore === 0 || lectureScore === 0 || practicalScore === 0 || motivationScore === 0) {
        alert("Vui lòng đánh giá tất cả các mục trước khi gửi.");
        return;
    }

    const response: SurveyResponse = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        uiScore,
        uxScore,
        knowledgeScore,
        lectureScore,
        practicalScore,
        motivationScore,
        comment,
        createdAt: new Date().toISOString()
    };

    submitSurvey(response);
    setSubmitted(true);
  };

  // --- STATISTICS CALCULATION ---
  const totalResponses = surveyResponses.length;
  
  const calculateAverage = (key: keyof SurveyResponse) => {
      if (totalResponses === 0) return 0;
      const sum = surveyResponses.reduce((acc, curr) => {
          const val = curr[key];
          return acc + (typeof val === 'number' ? val : 0);
      }, 0);
      return (sum / totalResponses).toFixed(1);
  };

  const avgUI = calculateAverage('uiScore');
  const avgUX = calculateAverage('uxScore');
  const avgKnowledge = calculateAverage('knowledgeScore');
  const avgLecture = calculateAverage('lectureScore');
  const avgPractical = calculateAverage('practicalScore');
  const avgMotivation = calculateAverage('motivationScore');

  const recentComments = surveyResponses
      .filter(r => r.comment && r.comment.trim().length > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const StarRating = ({ 
      score, 
      setScore, 
      label, 
      icon, 
      readOnly = false,
      type = 'QUALITY' // 'QUALITY' | 'AGREEMENT'
  }: { 
      score: number, 
      setScore?: (n: number) => void, 
      label: string, 
      icon: string, 
      readOnly?: boolean,
      type?: 'QUALITY' | 'AGREEMENT'
  }) => {
      const [hover, setHover] = useState(0);
      
      const getLabel = (val: number) => {
          if (type === 'AGREEMENT') {
              switch(val) {
                  case 1: return 'Rất không đồng ý';
                  case 2: return 'Không đồng ý';
                  case 3: return 'Trung lập';
                  case 4: return 'Đồng ý';
                  case 5: return 'Rất đồng ý';
                  default: return 'Chưa đánh giá';
              }
          }
          // Default QUALITY
          switch(val) {
              case 1: return 'Rất tệ';
              case 2: return 'Cần cải thiện';
              case 3: return 'Bình thường';
              case 4: return 'Tốt';
              case 5: return 'Tuyệt vời';
              default: return 'Chưa đánh giá';
          }
      };

      return (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
              <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full ${type === 'AGREEMENT' ? 'bg-purple-50 text-purple-600' : 'bg-brand-50 text-brand-600'} flex items-center justify-center mr-3 text-lg shrink-0`}>
                      <i className={`fas ${icon}`}></i>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg line-clamp-2">{label}</h4>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center px-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            disabled={readOnly}
                            className={`text-3xl transition-transform transform ${
                                star <= (hover || score) 
                                ? (type === 'AGREEMENT' ? 'text-purple-400 scale-110' : 'text-yellow-400 scale-110')
                                : 'text-gray-200'
                            } ${readOnly ? 'cursor-default' : 'focus:outline-none'}`}
                            onClick={() => !readOnly && setScore && setScore(star)}
                            onMouseEnter={() => !readOnly && setHover(star)}
                            onMouseLeave={() => !readOnly && setHover(score)}
                        >
                            <i className={`fas ${type === 'AGREEMENT' ? 'fa-check-circle' : 'fa-star'}`}></i>
                        </button>
                    ))}
                </div>
              </div>

              {!readOnly && (
                  <div className="text-center mt-3 text-xs font-bold text-gray-400 uppercase">
                      {score > 0 ? getLabel(score) : 'Chưa đánh giá'}
                  </div>
              )}
          </div>
      );
  };

  const StatCard = ({ label, score, icon, isAgreement = false }: { label: string, score: string | number, icon: string, isAgreement?: boolean }) => {
      const numScore = Number(score);
      const percentage = (numScore / 5) * 100;
      const color = isAgreement ? 'bg-purple-500' : (numScore >= 4 ? 'bg-green-500' : numScore >= 3 ? 'bg-yellow-400' : 'bg-red-500');
      const iconBg = isAgreement ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600';
      
      return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-lg`}>
                    <i className={`fas ${icon}`}></i>
                </div>
                <span className="text-2xl font-black text-gray-800">{score}<span className="text-sm text-gray-400 font-medium">/5</span></span>
            </div>
            <h4 className="font-bold text-gray-700 text-sm mb-3">{label}</h4>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${color}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
      );
  };

  if (submitted && activeTab === 'FORM') {
      return (
          <div className="max-w-2xl mx-auto mt-12 text-center animate-fade-in-up">
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-lg">
                      <i className="fas fa-check"></i>
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 mb-4">Cảm ơn bạn!</h2>
                  <p className="text-gray-500 text-lg mb-8">
                      Ý kiến đóng góp của bạn là động lực để LHP LMS ngày càng hoàn thiện hơn.
                  </p>
                  <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => { setSubmitted(false); setUiScore(0); setUxScore(0); setKnowledgeScore(0); setLectureScore(0); setPracticalScore(0); setMotivationScore(0); setComment(''); }} 
                        className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md"
                      >
                          Gửi phản hồi khác
                      </button>
                      {isAdminOrTeacher && (
                          <button 
                            onClick={() => setActiveTab('STATS')}
                            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                          >
                              Xem thống kê
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black mb-3">Phiếu Khảo Sát Ý Kiến</h2>
                <p className="text-brand-100 text-lg max-w-2xl">
                    Hãy giúp chúng tôi nâng cao chất lượng hệ thống bằng cách đánh giá trải nghiệm học tập của bạn.
                </p>
            </div>
            
            {/* View Toggle for Admin/Teacher */}
            {isAdminOrTeacher && (
                <div className="relative z-10 bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/30 flex">
                    <button
                        onClick={() => setActiveTab('FORM')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'FORM' 
                            ? 'bg-white text-brand-700 shadow-md' 
                            : 'text-white hover:bg-white/10'
                        }`}
                    >
                        Làm khảo sát
                    </button>
                    <button
                        onClick={() => setActiveTab('STATS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'STATS' 
                            ? 'bg-white text-brand-700 shadow-md' 
                            : 'text-white hover:bg-white/10'
                        }`}
                    >
                        Thống kê
                    </button>
                </div>
            )}
            
            <i className="fas fa-poll-h absolute right-0 bottom-0 text-9xl opacity-10 transform translate-x-4 translate-y-4"></i>
        </div>

        {activeTab === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {/* Section 1: Quality Rating */}
                <div>
                    <h3 className="font-bold text-gray-800 text-xl mb-4 border-l-4 border-brand-500 pl-3">I. Đánh giá chất lượng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StarRating 
                            score={uiScore} 
                            setScore={setUiScore} 
                            label="Giao diện (UI)" 
                            icon="fa-palette" 
                        />
                        <StarRating 
                            score={uxScore} 
                            setScore={setUxScore} 
                            label="Mức độ tiện lợi (UX)" 
                            icon="fa-mouse-pointer" 
                        />
                        <StarRating 
                            score={knowledgeScore} 
                            setScore={setKnowledgeScore} 
                            label="Chất lượng Kiến thức" 
                            icon="fa-book-reader" 
                        />
                        <StarRating 
                            score={lectureScore} 
                            setScore={setLectureScore} 
                            label="Bài giảng phù hợp" 
                            icon="fa-chalkboard-teacher" 
                        />
                    </div>
                </div>

                {/* Section 2: Agreement Rating */}
                <div>
                    <h3 className="font-bold text-gray-800 text-xl mb-4 border-l-4 border-purple-500 pl-3">II. Mức độ đồng ý & Tích cực</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StarRating 
                            score={practicalScore} 
                            setScore={setPracticalScore} 
                            label="Nội dung mang tính thực tiễn cao" 
                            icon="fa-briefcase"
                            type="AGREEMENT"
                        />
                        <StarRating 
                            score={motivationScore} 
                            setScore={setMotivationScore} 
                            label="Hệ thống tạo động lực tích cực" 
                            icon="fa-heart" 
                            type="AGREEMENT"
                        />
                    </div>
                </div>

                {/* Section 3: Comments */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-comment-dots text-brand-500 mr-2"></i>
                        Góp ý thêm (Tùy chọn)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow bg-gray-50 focus:bg-white resize-none"
                        placeholder="Bạn có đề xuất gì để cải thiện hệ thống không?"
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center"
                    >
                        <i className="fas fa-paper-plane mr-2"></i> Gửi Khảo Sát
                    </button>
                </div>
            </form>
        ) : (
            <div className="space-y-8 animate-fade-in">
                {/* 1. Overview Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center">
                            <i className="fas fa-chart-pie text-brand-500 mr-2"></i> Tổng quan đánh giá
                        </h3>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {totalResponses} lượt phản hồi
                        </span>
                    </div>
                    
                    {totalResponses === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <i className="fas fa-chart-bar text-4xl mb-3 opacity-30"></i>
                            <p>Chưa có dữ liệu thống kê.</p>
                        </div>
                    ) : (
                        <>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chất lượng</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatCard label="Giao diện (UI)" score={avgUI} icon="fa-palette" />
                                <StatCard label="Trải nghiệm (UX)" score={avgUX} icon="fa-mouse-pointer" />
                                <StatCard label="Chất lượng nội dung" score={avgKnowledge} icon="fa-book-reader" />
                                <StatCard label="Bài giảng" score={avgLecture} icon="fa-chalkboard-teacher" />
                            </div>

                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mức độ đồng ý</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard label="Tính thực tiễn" score={avgPractical} icon="fa-briefcase" isAgreement />
                                <StatCard label="Động lực tích cực" score={avgMotivation} icon="fa-heart" isAgreement />
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Feedback Feed */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center">
                            <i className="fas fa-comments text-brand-500 mr-2"></i> Ý kiến đóng góp
                        </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {recentComments.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">
                                <p>Chưa có ý kiến đóng góp nào.</p>
                            </div>
                        ) : (
                            recentComments.map((res) => (
                                <div key={res.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {res.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{res.userName}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(res.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            {/* Show mini summary of scores */}
                                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100" title="Giao diện">UI: {res.uiScore}</span>
                                            <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100" title="Nội dung">ND: {res.knowledgeScore}</span>
                                            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100" title="Động lực">ĐL: {res.motivationScore}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-11">
                                        "{res.comment}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Survey;
