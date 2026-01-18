
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Post, Role, PostCategory, POST_CATEGORY_LABELS } from '../types';

const Posts = () => {
  const { posts, submitPost, currentUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  // Create Post State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('GENERAL');
  const [grade, setGrade] = useState<number | ''>(''); // Grade selection
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<string>('');
  const [fileName, setFileName] = useState('');

  // Filter State
  const [activeTab, setActiveTab] = useState<'ALL' | 'OFFICIAL' | 'COMMUNITY'>('ALL');
  const [filterCategory, setFilterCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<number | 'ALL'>('ALL');

  const approvedPosts = posts.filter(p => p.status === 'APPROVED');
  
  const displayedPosts = approvedPosts.filter(p => {
    // Filter by Type
    const typeMatch = activeTab === 'ALL' || p.type === activeTab;
    // Filter by Category
    const categoryMatch = filterCategory === 'ALL' || p.category === filterCategory;
    // Filter by Grade
    const gradeMatch = filterGrade === 'ALL' || p.grade === filterGrade || !p.grade; 
    
    return typeMatch && categoryMatch && gradeMatch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        alert('Chỉ chấp nhận file PDF');
        return;
      }
      // Limit file size to ~5MB
      if (f.size > 5 * 1024 * 1024) {
          alert('File quá lớn (Tối đa 5MB).');
          return;
      }
      setFileName(f.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFile(event.target?.result as string || '');
      };
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title || !content) {
        alert("Vui lòng nhập tiêu đề và nội dung bài viết.");
        return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      title,
      content,
      status: 'PENDING', // Posts usually require approval or can be auto-approved based on role
      type: 'COMMUNITY', // Default to community post
      category: category,
      grade: grade ? (grade as 10 | 11 | 12) : undefined,
      attachmentUrl: file,
      attachmentName: fileName,
      linkUrl: linkUrl || undefined,
      createdAt: new Date().toISOString()
    };
    submitPost(newPost);
    alert('Bài viết đã được gửi thành công!');
    
    // Reset Form
    setShowForm(false);
    setTitle('');
    setContent('');
    setCategory('GENERAL');
    setGrade('');
    setLinkUrl('');
    setFile('');
    setFileName('');
  };

  const CategoryBadge = ({ category }: { category: PostCategory }) => {
     const colorMap: Record<PostCategory, string> = {
         GENERAL: 'bg-gray-100 text-gray-700 border-gray-200',
         PYTHON: 'bg-yellow-50 text-yellow-700 border-yellow-200',
         NETWORK: 'bg-blue-50 text-blue-700 border-blue-200',
         DATA_STRUCTURE: 'bg-purple-50 text-purple-700 border-purple-200',
         ALGORITHMS: 'bg-red-50 text-red-700 border-red-200',
         SECURITY: 'bg-green-50 text-green-700 border-green-200'
     };
     return (
         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${colorMap[category] || 'bg-gray-100'}`}>
             {POST_CATEGORY_LABELS[category]}
         </span>
     );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
            <h2 className="text-3xl font-bold text-gray-800">Tin tức & Bài viết</h2>
            <p className="text-gray-500 mt-1">Cập nhật kiến thức mới và chia sẻ tài liệu học tập</p>
            </div>
            
            <button
                onClick={() => setShowForm(!showForm)}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center whitespace-nowrap transition-all transform active:scale-95 w-fit ${
                    showForm ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
            >
                <i className={`fas ${showForm ? 'fa-times' : 'fa-pen'} mr-2`}></i> 
                {showForm ? 'Đóng Form' : 'Viết bài mới'}
            </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
             {/* Type Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'OFFICIAL', label: 'Chính thức' },
                    { id: 'COMMUNITY', label: 'Cộng đồng' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id 
                            ? 'bg-white text-brand-600 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                        }`}
                    >
                    {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                 {/* Grade Filter */}
                 <div className="flex items-center bg-gray-50 rounded-xl px-2 border border-gray-200">
                    <span className="text-xs font-bold text-gray-400 uppercase mr-2 ml-1">Lọc Khối:</span>
                    {[
                        { id: 'ALL', label: 'Tất cả' },
                        { id: 10, label: '10' },
                        { id: 11, label: '11' },
                        { id: 12, label: '12' }
                    ].map(g => (
                        <button
                            key={g.id}
                            onClick={() => setFilterGrade(g.id as any)}
                            className={`px-3 py-1.5 my-1 rounded-lg text-xs font-bold transition-all ${
                                filterGrade === g.id
                                ? 'bg-brand-600 text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {g.label}
                        </button>
                    ))}
                 </div>

                 {/* Category Select */}
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer hover:border-brand-300 transition-colors h-[42px]"
                >
                    <option value="ALL">-- Tất cả chủ đề --</option>
                    {Object.entries(POST_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-brand-100 animate-fade-in-down relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 to-purple-500"></div>
          
          <h3 className="font-bold text-xl mb-6 text-brand-800 flex items-center">
              <span className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mr-3 text-brand-600 text-lg shadow-sm">
                  <i className="fas fa-edit"></i>
              </span>
              Soạn bài viết mới
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="Nhập tiêu đề rõ ràng, ngắn gọn..."
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 focus:outline-none transition-all bg-white font-bold text-lg text-gray-800 placeholder-gray-400"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Chủ đề <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as PostCategory)}
                            className="w-full p-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow bg-gray-50 focus:bg-white cursor-pointer appearance-none font-medium"
                        >
                            {Object.entries(POST_CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Khối lớp</label>
                    <div className="relative">
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
                            className="w-full p-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow bg-gray-50 focus:bg-white cursor-pointer appearance-none font-medium"
                        >
                            <option value="">-- Chọn khối (Tùy chọn) --</option>
                            <option value="10">Khối 10</option>
                            <option value="11">Khối 11</option>
                            <option value="12">Khối 12</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Liên kết ngoài (URL)</label>
                    <div className="relative">
                        <i className="fas fa-link absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow bg-gray-50 focus:bg-white font-medium"
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nội dung chi tiết <span className="text-red-500">*</span></label>
               <textarea
                placeholder="Chia sẻ kiến thức, câu hỏi hoặc nội dung chính của bài viết..."
                rows={8}
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 focus:outline-none transition-shadow bg-gray-50 focus:bg-white resize-y text-base leading-relaxed"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Đính kèm tài liệu (PDF)</label>
                <label className={`cursor-pointer group flex items-center justify-between p-4 border-2 border-dashed rounded-2xl transition-all ${fileName ? 'border-brand-300 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-brand-400'}`}>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${fileName ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fas fa-file-pdf text-xl"></i>
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${fileName ? 'text-brand-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {fileName || 'Nhấn để chọn file PDF'}
                            </p>
                            <p className="text-xs text-gray-400">{fileName ? 'Đã chọn file' : 'Hỗ trợ định dạng .pdf (Tối đa 5MB)'}</p>
                        </div>
                    </div>
                    {fileName && (
                        <button type="button" onClick={(e) => {e.preventDefault(); setFile(''); setFileName('')}} className="text-gray-400 hover:text-red-500 p-2">
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                  Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center"
              >
                 <i className="fas fa-paper-plane mr-2"></i> Đăng bài viết
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6">
        {displayedPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-newspaper text-gray-400 text-4xl"></i>
             </div>
             <h4 className="text-lg font-bold text-gray-700">Chưa có bài viết nào</h4>
             <p className="text-gray-500 mt-1">Hãy là người đầu tiên chia sẻ kiến thức!</p>
          </div>
        ) : (
          displayedPosts.map(post => (
            <article key={post.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
               {/* Top Accent Line for Official Posts */}
               {post.type === 'OFFICIAL' && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>}
               
               <div className="flex items-start justify-between mb-5 mt-1">
                   <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md text-lg shrink-0 ${post.type === 'OFFICIAL' ? 'bg-gradient-to-br from-red-500 to-red-600 ring-2 ring-red-100' : 'bg-gradient-to-br from-brand-500 to-brand-600 ring-2 ring-brand-100'}`}>
                        {post.type === 'OFFICIAL' ? <i className="fas fa-shield-alt"></i> : post.authorName.charAt(0)}
                      </div>
                      
                      {/* Author Info */}
                      <div>
                        <div className="flex items-center">
                            <h4 className="font-bold text-gray-900 text-base mr-2 group-hover:text-brand-700 transition-colors">
                                {post.authorName}
                            </h4>
                            {post.type === 'OFFICIAL' && (
                                <i className="fas fa-check-circle text-blue-500 text-sm" title="Official Account"></i>
                            )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="flex items-center mr-3">
                                <i className="far fa-clock mr-1.5"></i>
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            
                            {post.type === 'OFFICIAL' && (
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-bold uppercase tracking-wider text-[10px] mr-2">
                                    Thông báo
                                </span>
                            )}
                            {post.type === 'COMMUNITY' && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold uppercase tracking-wider text-[10px] mr-2">
                                    Cộng đồng
                                </span>
                            )}
                             {post.grade && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-bold uppercase tracking-wider text-[10px]">
                                    Khối {post.grade}
                                </span>
                            )}
                        </div>
                      </div>
                   </div>
                   
                   {/* Category Badge */}
                   <div className="hidden sm:block">
                       <CategoryBadge category={post.category || 'GENERAL'} />
                   </div>
               </div>
               
               {/* Mobile Category Badge (Visible only on small screens) */}
               <div className="sm:hidden mb-4">
                   <CategoryBadge category={post.category || 'GENERAL'} />
               </div>
               
               <div className="flex-1">
                   <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-brand-600 transition-colors cursor-pointer">
                       {post.title}
                   </h3>
                   
                   {/* Display Link if available */}
                   {post.linkUrl && (
                        <a 
                            href={post.linkUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors mb-4 group/link max-w-fit"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-500 mr-3 shrink-0">
                                <i className="fas fa-external-link-alt text-xs"></i>
                            </div>
                            <div className="min-w-0 overflow-hidden">
                                <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">Liên kết tham khảo</p>
                                <p className="font-bold text-sm truncate group-hover/link:underline max-w-[200px] sm:max-w-md">{post.linkUrl}</p>
                            </div>
                        </a>
                   )}

                   {post.attachmentName && (
                       <div className="text-xs text-gray-500 mb-3 flex items-center bg-gray-50 w-fit px-2 py-1 rounded border border-gray-100">
                           <i className="fas fa-paperclip mr-2 text-gray-400"></i>
                           <span className="mr-1">Đính kèm:</span>
                           <a 
                               href={post.attachmentUrl}
                               download={post.attachmentName || 'document.pdf'}
                               onClick={(e) => e.stopPropagation()}
                               className="font-bold text-brand-600 hover:text-brand-800 hover:underline truncate max-w-[150px] sm:max-w-xs"
                           >
                               {post.attachmentName}
                           </a>
                       </div>
                   )}
                   <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-6 text-base">
                       {post.content}
                   </p>
               </div>
               
               {/* Attachment Section */}
               {post.attachmentUrl && (
                   <div className="mt-auto pt-5 border-t border-gray-100 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group-hover:bg-brand-50/30 transition-colors">
                       <div className="flex items-center min-w-0">
                           <div className="w-12 h-12 bg-white text-red-500 border border-red-100 rounded-xl flex items-center justify-center mr-4 shadow-sm shrink-0">
                               <i className="fas fa-file-pdf text-2xl"></i>
                           </div>
                           <div className="min-w-0">
                               <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Tài liệu đính kèm</p>
                               <p className="text-sm font-bold text-gray-800 truncate pr-4" title={post.attachmentName}>
                                   {post.attachmentName || 'document.pdf'}
                               </p>
                           </div>
                       </div>
                       <a 
                         href={post.attachmentUrl} 
                         download={post.attachmentName || 'document.pdf'}
                         className="flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all font-bold shadow-sm whitespace-nowrap text-sm group/btn"
                       >
                           <i className="fas fa-download mr-2 group-hover/btn:animate-bounce"></i> Tải về
                       </a>
                   </div>
               )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
