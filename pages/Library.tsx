
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Library = () => {
  const { documents } = useApp();
  const [activeTab, setActiveTab] = useState<'DOCS' | 'BOOKS'>('BOOKS');

  // Mock Textbooks
  const textbooks = [
      { id: 'b1', title: 'Tin học 10 - Cánh Diều', cover: 'https://via.placeholder.com/150x200/3b82f6/ffffff?text=Tin+10', grade: 10 },
      { id: 'b2', title: 'Chuyên đề học tập Tin 10', cover: 'https://via.placeholder.com/150x200/8b5cf6/ffffff?text=CD+Tin+10', grade: 10 },
      { id: 'b3', title: 'Tài liệu lập trình Python', cover: 'https://via.placeholder.com/150x200/f59e0b/ffffff?text=Python', grade: 10 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-black text-gray-800">Thư Viện Số</h2>
                <p className="text-gray-500 mt-2">Kho tài liệu tham khảo và sách giáo khoa điện tử</p>
            </div>
            <div className="relative z-10 flex bg-gray-100 p-1 rounded-xl mt-4 md:mt-0">
                <button 
                    onClick={() => setActiveTab('BOOKS')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'BOOKS' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Sách giáo khoa
                </button>
                <button 
                    onClick={() => setActiveTab('DOCS')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'DOCS' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tài liệu tham khảo
                </button>
            </div>
            <i className="fas fa-book-reader absolute -bottom-4 -right-4 text-9xl text-gray-100 opacity-50"></i>
        </div>

        {activeTab === 'BOOKS' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {textbooks.map(book => (
                    <div key={book.id} className="group cursor-pointer">
                        <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all border border-gray-200">
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-xs hover:bg-brand-50 transition-colors">
                                    Đọc ngay
                                </button>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm text-center group-hover:text-brand-600 transition-colors">{book.title}</h4>
                        <p className="text-xs text-gray-500 text-center mt-1">Khối {book.grade}</p>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'DOCS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                    <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-2xl shrink-0 group-hover:bg-red-100 transition-colors">
                                <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 truncate mb-1">{doc.title}</h4>
                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                    <span><i className="fas fa-user mr-1"></i> {doc.uploadedBy}</span>
                                    <span>•</span>
                                    <span>{doc.content.length > 1000 ? (doc.content.length / 1024).toFixed(1) + ' KB (Text)' : doc.content.length + ' chars'}</span>
                                </div>
                            </div>
                            {doc.fileUrl ? (
                                <a 
                                    href={doc.fileUrl} 
                                    download={doc.fileName}
                                    className="text-gray-400 hover:text-brand-600 transition-colors p-2"
                                    title="Tải về"
                                >
                                    <i className="fas fa-download"></i>
                                </a>
                            ) : (
                                <button className="text-gray-300 cursor-not-allowed p-2" title="Chỉ xem (Không có file gốc)">
                                    <i className="fas fa-eye"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-400">
                        Chưa có tài liệu nào được tải lên.
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Library;
