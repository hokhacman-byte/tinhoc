import React, { useState } from 'react';

const CodeLab = () => {
  const [code, setCode] = useState('print("Xin chào EduLMS!")\n# Viết code Python của bạn ở đây\n\nfor i in range(5):\n    print(f"Lần lặp thứ {i + 1}")');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Đang chạy...');
    
    // Simulate execution delay
    setTimeout(() => {
        // Simple mock interpretation for demo purposes
        let result = '';
        if (code.includes('print')) {
            const lines = code.split('\n');
            lines.forEach(line => {
                if (line.trim().startsWith('print')) {
                    // Very basic extraction of string inside print
                    const match = line.match(/print\s*\((.*)\)/);
                    if (match && match[1]) {
                        // Remove quotes roughly
                        let content = match[1].replace(/["']/g, '');
                        // Handle f-string mock
                        if (match[1].startsWith('f')) {
                             content = content.replace(/^f/, '');
                             // Mock specific loop case
                             if (content.includes('Lần lặp')) {
                                 for(let i=0; i<5; i++) result += `Lần lặp thứ ${i+1}\n`;
                                 return; 
                             }
                        }
                        result += content + '\n';
                    }
                }
            });
        }
        
        if (!result) result = "Chương trình đã chạy xong (Không có output).";
        
        setOutput(result);
        setIsRunning(false);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
                <h2 className="text-xl font-black text-gray-800 flex items-center">
                    <i className="fas fa-code text-brand-600 mr-2"></i> Phòng Code Lab
                </h2>
                <p className="text-xs text-gray-500">Môi trường thực hành Python (Sandbox)</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setCode('')}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold text-sm transition-colors"
                >
                    Xóa hết
                </button>
                <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-lg text-white font-bold text-sm shadow-md flex items-center transition-all ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'}`}
                >
                    {isRunning ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-play mr-2"></i>}
                    Chạy Code
                </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-xl shadow-inner overflow-hidden border border-gray-700">
                <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-gray-400 font-mono border-b border-gray-700 flex justify-between">
                    <span>main.py</span>
                    <span>Python 3.10</span>
                </div>
                <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 w-full bg-[#1e1e1e] text-gray-200 font-mono text-sm p-4 focus:outline-none resize-none"
                    spellCheck="false"
                ></textarea>
            </div>

            {/* Output Pane */}
            <div className="h-48 md:h-auto md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 flex justify-between items-center">
                    <span>Terminal / Output</span>
                    <button onClick={() => setOutput('')} className="hover:text-red-500"><i className="fas fa-ban"></i></button>
                </div>
                <div className="flex-1 bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto whitespace-pre-wrap">
                    {output || <span className="text-gray-600 italic">...Kết quả sẽ hiện ở đây...</span>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CodeLab;