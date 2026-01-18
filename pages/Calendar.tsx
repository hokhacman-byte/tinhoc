import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { exams, worksheets } = useApp();

  // Mock Events data (In real app, merge exams and worksheet deadlines)
  const events = [
    { date: 15, month: 8, type: 'EXAM', title: 'Thi Giữa Kỳ 1', color: 'bg-red-100 text-red-700 border-red-200' },
    { date: 20, month: 8, type: 'HOMEWORK', title: 'Hạn nộp bài Python', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { date: 5, month: 9, type: 'EVENT', title: 'Khai giảng', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { date: 28, month: 8, type: 'HOMEWORK', title: 'Bài tập SQL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const days = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCalendarDays = () => {
    const calendarDays = [];
    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
    }
    // Days of current month
    for (let i = 1; i <= days; i++) {
      const dayEvents = events.filter(e => e.date === i && e.month === month);
      const isToday = i === new Date().getDate() && month === new Date().getMonth();

      calendarDays.push(
        <div key={i} className={`h-24 border border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-brand-50' : 'bg-white'}`}>
          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-700'}`}>
            {i}
          </span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[50px] custom-scrollbar">
            {dayEvents.map((ev, idx) => (
              <div key={idx} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border truncate ${ev.color}`}>
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return calendarDays;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
            <h2 className="text-2xl font-black text-gray-800">Lịch Học Tập</h2>
            <p className="text-gray-500 text-sm">Theo dõi lịch thi và hạn nộp bài tập</p>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <i className="fas fa-chevron-left"></i>
            </button>
            <span className="text-xl font-bold text-gray-800 min-w-[150px] text-center">
                Tháng {month + 1}, {year}
            </span>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                      <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7">
                  {renderCalendarDays()}
              </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-bell text-yellow-500 mr-2"></i> Sắp diễn ra
                  </h3>
                  <div className="space-y-3">
                      {events.filter(e => e.month === month && e.date >= new Date().getDate()).map((ev, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white border shadow-sm font-bold text-xs`}>
                                  <span className="text-gray-400 text-[8px]">T{ev.month + 1}</span>
                                  <span className="text-lg leading-none">{ev.date}</span>
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{ev.title}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase">{ev.type === 'EXAM' ? 'Lịch thi' : 'Bài tập'}</p>
                              </div>
                          </div>
                      ))}
                      {events.filter(e => e.month === month && e.date >= new Date().getDate()).length === 0 && (
                          <p className="text-gray-400 text-xs italic text-center">Không có sự kiện sắp tới.</p>
                      )}
                  </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Mẹo nhỏ</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                      Hãy đặt nhắc nhở trước 1 ngày để không bỏ lỡ các bài kiểm tra quan trọng nhé!
                  </p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                      Thêm nhắc nhở
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Calendar;