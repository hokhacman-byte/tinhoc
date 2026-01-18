
import { Level, Question, QuestionType, Role, User, Post, Document, Topic, Infographic, Lecture, Worksheet, PostCategory, CodeProblem } from './types';

// ... (Keep MOCK_ADMIN, MOCK_TOPICS, and helper functions as they are)

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@example.com',
  password: '123456', 
  role: Role.ADMIN,
  totalScore: 0,
  currentLevel: Level.EXPERT,
  medals: [],
  completedLevels: [],
  completedTopics: [],
  completedLectureIds: ['l10_f_02'],
};

export const MOCK_TOPICS: Topic[] = [
  { id: 't_10_A', name: 'Chủ đề A: Máy tính & Xã hội tri thức', grade: 10, month: 9, description: 'Thông tin, dữ liệu, hệ đếm, phần cứng, phần mềm và pháp luật.', icon: 'fa-database' },
  { id: 't_10_B', name: 'Chủ đề B: Mạng máy tính & Internet', grade: 10, month: 10, description: 'Kiến trúc mạng, IoT, Cloud Computing và An ninh mạng.', icon: 'fa-cloud' },
  { id: 't_10_D', name: 'Chủ đề D: Đạo đức, pháp luật & Văn hóa số', grade: 10, month: 11, description: 'Bản quyền, danh tính số và văn hóa ứng xử.', icon: 'fa-gavel' },
  { id: 't_10_F', name: 'Chủ đề F: Lập trình cơ bản (Python)', grade: 10, month: 1, description: 'Ngôn ngữ Python: Biến, Lệnh, Rẽ nhánh, Lặp, Danh sách.', icon: 'fa-code' },
];

const createQ = (topic: string, level: Level, content: string, ans: string, opts: string[] = [], type: QuestionType = QuestionType.MULTIPLE_CHOICE): Question => ({
    id: `q_${topic}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
    topicId: topic, level, content, correctAnswer: ans, options: opts, type
});

const MANUAL_QUESTIONS: Question[] = [
    // ... (Keep existing manual questions)
    createQ('t_10_A', Level.INTRO, 'Thông tin là gì?', 'Những hiểu biết có được từ dữ liệu', ['Các con số và văn bản', 'Những hiểu biết có được từ dữ liệu', 'Tín hiệu điện trong máy tính', 'File lưu trong ổ cứng']),
    createQ('t_10_A', Level.INTRO, 'Đơn vị nhỏ nhất để biểu diễn thông tin trong máy tính là gì?', 'Bit', ['Byte', 'Bit', 'Hz', 'Pixel']),
    createQ('t_10_A', Level.INTRO, '1 Byte bằng bao nhiêu Bit?', '8', ['2', '8', '10', '16']),
    createQ('t_10_A', Level.ELEMENTARY, 'Hệ đếm dùng trong máy tính là hệ đếm nào?', 'Nhị phân', ['Thập phân', 'Nhị phân', 'La Mã', 'Hệ 60']),
    createQ('t_10_A', Level.ELEMENTARY, 'Quá trình chuyển đổi dữ liệu thành dãy bit gọi là gì?', 'Số hóa', ['Mã hóa', 'Giải mã', 'Số hóa', 'Lập trình']),
    createQ('t_10_A', Level.INTERMEDIATE, 'Thiết bị nào sau đây là thiết bị THÔNG MINH?', 'Robot hút bụi tự động', ['Máy tính bỏ túi casio', 'Đồng hồ cơ', 'Robot hút bụi tự động', 'Quạt điện cơ']),
    createQ('t_10_A', Level.INTERMEDIATE, 'Đặc điểm chính của Big Data (Dữ liệu lớn) là gì?', 'V, V, V (Volume, Velocity, Variety)', ['Dung lượng nhỏ', 'Tốc độ xử lý chậm', 'V, V, V (Volume, Velocity, Variety)', 'Chỉ chứa văn bản']),
    createQ('t_10_A', Level.ELEMENTARY, 'CPU là viết tắt của từ gì?', 'Central Processing Unit', ['Central Power Unit', 'Control Processing Unit', 'Central Processing Unit', 'Computer Personal Unit']),
    createQ('t_10_A', Level.ELEMENTARY, 'RAM là loại bộ nhớ gì?', 'Bộ nhớ truy cập ngẫu nhiên, mất dữ liệu khi tắt máy', ['Bộ nhớ chỉ đọc', 'Bộ nhớ truy cập ngẫu nhiên, mất dữ liệu khi tắt máy', 'Bộ nhớ lưu trữ lâu dài', 'Bộ nhớ ngoài']),
    createQ('t_10_A', Level.ADVANCED, 'Phép toán logic: 1 AND 0 bằng bao nhiêu?', '0', ['1', '0', 'Null', 'True']),
    createQ('t_10_A', Level.ADVANCED, 'Phép toán logic: 1 OR 0 bằng bao nhiêu?', '1', ['1', '0', 'Null', 'False']),
    
    createQ('t_10_A', Level.ELEMENTARY, 'ROM là bộ nhớ chỉ đọc, dữ liệu không bị mất khi tắt máy.', 'Đúng', [], QuestionType.TRUE_FALSE),
    createQ('t_10_A', Level.INTERMEDIATE, 'Hệ điều hành Windows là phần mềm mã nguồn mở.', 'Sai', [], QuestionType.TRUE_FALSE),
    createQ('t_10_A', Level.INTRO, 'Máy tính chỉ hiểu được ngôn ngữ máy (dãy bit 0 và 1).', 'Đúng', [], QuestionType.TRUE_FALSE),

    createQ('t_10_B', Level.INTRO, 'Internet of Things (IoT) là gì?', 'Mạng lưới vạn vật kết nối', ['Mạng nội bộ', 'Mạng lưới vạn vật kết nối', 'Internet tốc độ cao', 'Phần mềm diệt virus']),
    createQ('t_10_B', Level.INTRO, 'Thiết bị nào dùng để kết nối các mạng khác nhau (VD: mạng gia đình với Internet)?', 'Router', ['Switch', 'Hub', 'Router', 'Repeater']),
    createQ('t_10_B', Level.ELEMENTARY, 'Mạng LAN là gì?', 'Mạng cục bộ, phạm vi nhỏ', ['Mạng diện rộng', 'Mạng cục bộ, phạm vi nhỏ', 'Mạng toàn cầu', 'Mạng không dây']),
    createQ('t_10_B', Level.ELEMENTARY, 'Điện toán đám mây (Cloud Computing) cho phép làm gì?', 'Lưu trữ và xử lý dữ liệu trên Internet', ['Tăng tốc độ CPU máy cá nhân', 'Lưu trữ và xử lý dữ liệu trên Internet', 'Làm mát máy tính', 'Tạo ra mưa nhân tạo']),
    createQ('t_10_B', Level.INTERMEDIATE, 'Malware là tên gọi chung của cái gì?', 'Phần mềm độc hại', ['Phần mềm diệt virus', 'Phần cứng máy tính', 'Phần mềm độc hại', 'Hệ điều hành']),
    createQ('t_10_B', Level.INTERMEDIATE, 'Trojan là gì?', 'Phần mềm độc hại ngụy trang thành phần mềm hợp pháp', ['Virus tự nhân bản', 'Sâu máy tính', 'Phần mềm độc hại ngụy trang thành phần mềm hợp pháp', 'Phần mềm gián điệp']),
    createQ('t_10_B', Level.ADVANCED, 'Giao thức nào là nền tảng của Internet?', 'TCP/IP', ['HTTP', 'FTP', 'TCP/IP', 'SMTP']),

    createQ('t_10_B', Level.ELEMENTARY, 'Địa chỉ IP giúp định danh thiết bị trên mạng Internet.', 'Đúng', [], QuestionType.TRUE_FALSE),
    createQ('t_10_B', Level.INTERMEDIATE, 'Mạng xã hội luôn đảm bảo an toàn tuyệt đối cho thông tin cá nhân.', 'Sai', [], QuestionType.TRUE_FALSE),
    createQ('t_10_B', Level.ADVANCED, 'Virus máy tính có thể lây lan qua email.', 'Đúng', [], QuestionType.TRUE_FALSE),

    createQ('t_10_D', Level.INTRO, 'Hành vi nào bị cấm trên không gian mạng?', 'Phát tán tin giả, xuyên tạc', ['Chia sẻ kiến thức học tập', 'Gửi email công việc', 'Phát tán tin giả, xuyên tạc', 'Mua bán hàng online hợp pháp']),
    createQ('t_10_D', Level.ELEMENTARY, 'Bản quyền phần mềm thuộc về ai?', 'Tác giả hoặc nhà sản xuất', ['Người mua phần mềm', 'Người sử dụng', 'Tác giả hoặc nhà sản xuất', 'Cộng đồng mạng']),
    createQ('t_10_D', Level.INTERMEDIATE, 'Giấy phép Creative Commons (CC) dùng để làm gì?', 'Cho phép chia sẻ tác phẩm với một số điều kiện nhất định', ['Bảo mật thông tin', 'Cho phép chia sẻ tác phẩm với một số điều kiện nhất định', 'Cấm sao chép tuyệt đối', 'Thu phí bản quyền']),
    
    createQ('t_10_D', Level.INTRO, 'Hành vi quay lén và phát tán hình ảnh người khác lên mạng là vi phạm pháp luật.', 'Đúng', [], QuestionType.TRUE_FALSE),
    createQ('t_10_D', Level.ELEMENTARY, 'Phần mềm miễn phí (Freeware) đồng nghĩa với phần mềm mã nguồn mở.', 'Sai', [], QuestionType.TRUE_FALSE),

    createQ('t_10_F', Level.INTRO, 'Để in ra màn hình trong Python, dùng lệnh gì?', 'print()', ['input()', 'write()', 'print()', 'scan()']),
    createQ('t_10_F', Level.INTRO, 'Ký hiệu nào dùng để chú thích (comment) trong Python?', '#', ['//', '/*', '#', '--']),
    createQ('t_10_F', Level.ELEMENTARY, 'Kiểu dữ liệu "int" trong Python là gì?', 'Số nguyên', ['Số thực', 'Xâu ký tự', 'Số nguyên', 'Danh sách']),
    createQ('t_10_F', Level.ELEMENTARY, 'Kết quả của 10 % 3 là?', '1', ['3', '1', '3.33', '0']),
    createQ('t_10_F', Level.ELEMENTARY, 'Kết quả của 2 ** 3 là?', '8', ['6', '5', '8', '9']),
    createQ('t_10_F', Level.INTERMEDIATE, 'Lệnh range(5) tạo ra dãy số nào?', '0, 1, 2, 3, 4', ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '0, 1, 2, 3, 4, 5', '1, 2, 3, 4']),
    createQ('t_10_F', Level.INTERMEDIATE, 'Cấu trúc rẽ nhánh dạng thiếu trong Python?', 'if <điều kiện>:', ['if <điều kiện> then', 'if <điều kiện>:', 'switch case', 'check <điều kiện>']),
    createQ('t_10_F', Level.ADVANCED, 'Cho A = [1, 2, 3]. Lệnh A.append(4) làm gì?', 'Thêm số 4 vào cuối danh sách', ['Thêm số 4 vào đầu', 'Xóa số 4', 'Thêm số 4 vào cuối danh sách', 'Thay thế phần tử cuối bằng 4']),
    createQ('t_10_F', Level.ADVANCED, 'Hàm len() dùng để làm gì?', 'Trả về độ dài (số phần tử)', ['Trả về giá trị lớn nhất', 'Trả về độ dài (số phần tử)', 'Trả về kiểu dữ liệu', 'Sắp xếp danh sách']),

    createQ('t_10_F', Level.INTRO, 'Trong Python, tên biến không được bắt đầu bằng số.', 'Đúng', [], QuestionType.TRUE_FALSE),
    createQ('t_10_F', Level.ELEMENTARY, 'Lệnh input() luôn trả về giá trị kiểu số nguyên.', 'Sai', [], QuestionType.TRUE_FALSE),
    createQ('t_10_F', Level.INTERMEDIATE, 'Danh sách (List) trong Python sử dụng dấu ngoặc nhọn {}.', 'Sai', [], QuestionType.TRUE_FALSE),
    createQ('t_10_F', Level.ADVANCED, 'Hàm int("123") sẽ chuyển chuỗi "123" thành số nguyên 123.', 'Đúng', [], QuestionType.TRUE_FALSE),

    {
        id: 'q_dd_1', topicId: 't_10_A', level: Level.ELEMENTARY, type: QuestionType.DRAG_DROP,
        content: 'Ghép nối các đơn vị lưu trữ:',
        matchingPairs: [
            { left: '1 KB', right: '1024 Byte' }, { left: '1 MB', right: '1024 KB' },
            { left: '1 GB', right: '1024 MB' }, { left: '1 TB', right: '1024 GB' }
        ]
    },
    {
        id: 'q_dd_2', topicId: 't_10_B', level: Level.INTERMEDIATE, type: QuestionType.DRAG_DROP,
        content: 'Phân loại các mối nguy hại mạng:',
        matchingPairs: [
            { left: 'Virus', right: 'Lây lan qua file' }, { left: 'Worm', right: 'Tự lây lan qua mạng' },
            { left: 'Trojan', right: 'Ngụy trang phần mềm' }, { left: 'Spyware', right: 'Đánh cắp thông tin' }
        ]
    },
    {
        id: 'q_dd_3', topicId: 't_10_F', level: Level.ELEMENTARY, type: QuestionType.DRAG_DROP,
        content: 'Ghép nối toán tử Python:',
        matchingPairs: [
            { left: '//', right: 'Chia lấy nguyên' }, { left: '%', right: 'Chia lấy dư' },
            { left: '==', right: 'So sánh bằng' }, { left: '!=', right: 'Khác nhau' }
        ]
    },
    {
        id: 'q_dd_4', topicId: 't_10_F', level: Level.INTERMEDIATE, type: QuestionType.DRAG_DROP,
        content: 'Ghép nối kiểu dữ liệu Python:',
        matchingPairs: [
            { left: 'int', right: 'Số nguyên' }, { left: 'float', right: 'Số thực' },
            { left: 'str', right: 'Xâu ký tự' }, { left: 'bool', right: 'Logic (True/False)' }
        ]
    },
    {
        id: 'q_dd_5', topicId: 't_10_A', level: Level.INTERMEDIATE, type: QuestionType.DRAG_DROP,
        content: 'Phân loại phần mềm:',
        matchingPairs: [
            { left: 'Hệ điều hành', right: 'Windows, Linux' },
            { left: 'Phần mềm ứng dụng', right: 'Word, Excel' },
            { left: 'Phần mềm lập trình', right: 'Python, VS Code' },
            { left: 'Phần mềm độc hại', right: 'Virus, Spyware' }
        ]
    },
    {
        id: 'q_dd_6', topicId: 't_10_B', level: Level.ADVANCED, type: QuestionType.DRAG_DROP,
        content: 'Ghép nối các tầng trong mô hình TCP/IP:',
        matchingPairs: [
            { left: 'Application', right: 'HTTP, FTP, DNS' },
            { left: 'Transport', right: 'TCP, UDP' },
            { left: 'Internet', right: 'IP, ICMP' },
            { left: 'Network Access', right: 'Ethernet, Wi-Fi' }
        ]
    },
    {
        id: 'q_dd_7', topicId: 't_10_F', level: Level.INTERMEDIATE, type: QuestionType.DRAG_DROP,
        content: 'Ghép lỗi thường gặp trong Python:',
        matchingPairs: [
            { left: 'SyntaxError', right: 'Lỗi cú pháp' },
            { left: 'IndentationError', right: 'Lỗi thụt lề' },
            { left: 'NameError', right: 'Chưa định nghĩa biến' },
            { left: 'TypeError', right: 'Sai kiểu dữ liệu' }
        ]
    },
    {
        id: 'q_dd_8', topicId: 't_10_F', level: Level.ADVANCED, type: QuestionType.DRAG_DROP,
        content: 'Ghép phương thức của List:',
        matchingPairs: [
            { left: 'append(x)', right: 'Thêm x vào cuối' },
            { left: 'insert(i, x)', right: 'Chèn x vào vị trí i' },
            { left: 'pop(i)', right: 'Lấy và xóa phần tử tại i' },
            { left: 'sort()', right: 'Sắp xếp danh sách' }
        ]
    }
];

const genBinaryQuestions = (): Question[] => {
    const qs: Question[] = [];
    for (let i = 0; i < 20; i++) {
        const val = Math.floor(Math.random() * 31) + 1; // 1-31 (5 bit max)
        const bin = val.toString(2);
        const q1: Question = {
            id: `gen_bin_dec_${i}`, topicId: 't_10_A', level: Level.INTERMEDIATE, type: QuestionType.MULTIPLE_CHOICE,
            content: `Chuyển đổi số nhị phân ${bin} sang hệ thập phân:`,
            correctAnswer: val.toString(),
            options: [val.toString(), (val+1).toString(), (val-1).toString(), (val+2).toString()].sort(() => 0.5 - Math.random())
        };
        qs.push(q1);
        const q2: Question = {
            id: `gen_dec_bin_${i}`, topicId: 't_10_A', level: Level.INTERMEDIATE, type: QuestionType.MULTIPLE_CHOICE,
            content: `Chuyển đổi số thập phân ${val} sang hệ nhị phân:`,
            correctAnswer: bin,
            options: [bin, (val+1).toString(2), (val-1).toString(2), (val+2).toString(2)].sort(() => 0.5 - Math.random())
        };
        qs.push(q2);
    }
    return qs;
};

const genPythonMathQuestions = (): Question[] => {
    const qs: Question[] = [];
    const ops = ['+', '-', '*', '//', '%'];
    for (let i = 0; i < 50; i++) {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const op = ops[Math.floor(Math.random() * ops.length)];
        let res = 0;
        switch(op) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '//': res = Math.floor(a / b); break;
            case '%': res = a % b; break;
        }
        const q: Question = {
            id: `gen_py_math_${i}`, topicId: 't_10_F', level: Level.ELEMENTARY, type: QuestionType.MULTIPLE_CHOICE,
            content: `Kết quả của biểu thức Python: ${a} ${op} ${b} là bao nhiêu?`,
            correctAnswer: res.toString(),
            options: [res.toString(), (res+1).toString(), (res-1).toString(), (res+2).toString()].sort(() => 0.5 - Math.random())
        };
        qs.push(q);
    }
    return qs;
};

const genPythonLogicQuestions = (): Question[] => {
    const qs: Question[] = [];
    for (let i = 0; i < 30; i++) {
        const a = Math.random() > 0.5; // True/False
        const b = Math.random() > 0.5;
        const op = Math.random() > 0.5 ? 'and' : 'or';
        let res = op === 'and' ? (a && b) : (a || b);
        const pyA = a ? 'True' : 'False';
        const pyB = b ? 'True' : 'False';
        const pyRes = res ? 'True' : 'False';
        if (Math.random() > 0.5) {
             const q: Question = {
                id: `gen_py_bool_${i}`, topicId: 't_10_F', level: Level.INTERMEDIATE, type: QuestionType.TRUE_FALSE,
                content: `Kết quả của biểu thức logic: ${pyA} ${op} ${pyB} là ${pyRes}?`,
                correctAnswer: 'Đúng',
            };
            qs.push(q);
        } else {
            const qMC: Question = {
                id: `gen_py_bool_mc_${i}`, topicId: 't_10_F', level: Level.INTERMEDIATE, type: QuestionType.MULTIPLE_CHOICE,
                content: `Kết quả của biểu thức logic: ${pyA} ${op} ${pyB} là?`,
                correctAnswer: pyRes,
                options: ['True', 'False', 'Error', 'None']
            };
            qs.push(qMC);
        }
    }
    return qs;
};

const genStorageQuestions = (): Question[] => {
    const qs: Question[] = [];
    const units = ['KB', 'MB', 'GB', 'TB'];
    for (let i = 0; i < 30; i++) {
        const val = Math.floor(Math.random() * 10) + 1; // 1-10
        const unitIdx = Math.floor(Math.random() * (units.length - 1)); // 0-2 (to have a next unit)
        const bigUnit = units[unitIdx + 1];
        const smallUnit = units[unitIdx];
        const q: Question = {
            id: `gen_storage_${i}`, topicId: 't_10_A', level: Level.ELEMENTARY, type: QuestionType.MULTIPLE_CHOICE,
            content: `${val} ${bigUnit} bằng bao nhiêu ${smallUnit}?`,
            correctAnswer: `${val * 1024}`,
            options: [`${val * 1024}`, `${val * 1000}`, `${val * 10}`, `${val * 8}`].sort(() => 0.5 - Math.random())
        };
        qs.push(q);
    }
    return qs;
};

export const MOCK_QUESTIONS: Question[] = [
    ...MANUAL_QUESTIONS,
    ...genBinaryQuestions(),
    ...genPythonMathQuestions(),
    ...genPythonLogicQuestions(),
    ...genStorageQuestions()
];

// =============================================================================
// 50 BÀI VIẾT (TIN HỌC 10, AI, IoT, HƯỚNG NGHIỆP)
// =============================================================================
export const MOCK_POSTS: Post[] = [
    // --- 1. TIN HỌC 10 (15 Bài) ---
    {
        id: 'p10_1', authorId: 'admin-1', authorName: 'Thầy Hùng (Tin học)', title: 'Tổng hợp kiến thức Python cơ bản HK1', 
        content: 'Bài viết này tóm tắt các cú pháp quan trọng: Biến, Kiểu dữ liệu, Lệnh input/print và Cấu trúc rẽ nhánh if-else. Lưu ngay để ôn thi nhé!',
        status: 'APPROVED', type: 'OFFICIAL', category: 'PYTHON', grade: 10, createdAt: new Date(2023, 8, 5).toISOString()
    },
    {
        id: 'p10_2', authorId: 'admin-1', authorName: 'Cô Lan (Tin học)', title: 'Mẹo nhớ bảng chân trị Logic (AND, OR, XOR)', 
        content: 'Nhiều bạn hay nhầm lẫn giữa OR và XOR. Hãy nhớ nguyên tắc: XOR chỉ đúng khi 2 vế KHÁC nhau. Còn OR giống phép cộng, chỉ sai khi cả 2 đều là 0.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 8, 10).toISOString()
    },
    {
        id: 'p10_3', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Tại sao máy tính dùng hệ nhị phân?', 
        content: 'Hệ nhị phân (0 và 1) tương ứng với trạng thái Tắt/Mở của bóng bán dẫn. Đây là nền tảng vật lý của mọi thiết bị điện tử.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 8, 15).toISOString()
    },
    {
        id: 'p10_4', authorId: 'stu_1', authorName: 'Nguyễn Văn A', title: 'Hỏi về lỗi SyntaxError trong Python', 
        content: 'Mọi người cho em hỏi lỗi "SyntaxError: EOL while scanning string literal" nghĩa là gì ạ? Em hay bị khi print chuỗi.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'PYTHON', grade: 10, createdAt: new Date(2023, 8, 20).toISOString()
    },
    {
        id: 'p10_5', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Cảnh báo về An toàn thông tin trên mạng xã hội', 
        content: 'Không chia sẻ mật khẩu, không click vào link lạ. Hãy bật xác thực 2 lớp (2FA) cho Facebook và Gmail ngay hôm nay.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'SECURITY', grade: 10, createdAt: new Date(2023, 9, 1).toISOString()
    },
    {
        id: 'p10_6', authorId: 'stu_2', authorName: 'Lê Thị B', title: 'Cách cài đặt Python và VS Code trên Windows', 
        content: 'Mình vừa tìm được video hướng dẫn cài môi trường lập trình rất dễ hiểu. Share cho các bạn chưa cài được nhé.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'PYTHON', grade: 10, createdAt: new Date(2023, 9, 5).toISOString()
    },
    {
        id: 'p10_7', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Luật An ninh mạng: Những điều học sinh cần biết', 
        content: 'Cấm xúc phạm danh dự người khác, cấm tung tin giả. Hãy là người sử dụng mạng văn minh.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 9, 10).toISOString()
    },
    {
        id: 'p10_8', authorId: 'stu_3', authorName: 'Trần Văn C', title: 'Bài tập Python: Kiểm tra số nguyên tố', 
        content: 'Có ai có code tối ưu để kiểm tra số nguyên tố không ạ? Code của mình chạy chậm quá khi số lớn.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'PYTHON', grade: 10, createdAt: new Date(2023, 9, 15).toISOString()
    },
    {
        id: 'p10_9', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Phân biệt Virus, Worm và Trojan', 
        content: 'Virus cần vật chủ (file) để lây lan. Worm tự nhân bản qua mạng. Trojan ngụy trang thành phần mềm có ích.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'SECURITY', grade: 10, createdAt: new Date(2023, 10, 1).toISOString()
    },
    {
        id: 'p10_10', authorId: 'stu_4', authorName: 'Phạm Thị D', title: 'Sơ đồ tư duy bài "Mạng máy tính"', 
        content: 'Mình mới vẽ sơ đồ tư duy tóm tắt bài Mạng máy tính. Bạn nào cần tham khảo thì tải về nhé.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'NETWORK', grade: 10, createdAt: new Date(2023, 10, 5).toISOString()
    },
    {
        id: 'p10_11', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Creative Commons là gì?', 
        content: 'Giấy phép CC cho phép tác giả chia sẻ tác phẩm của mình với cộng đồng một cách hợp pháp và linh hoạt.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 10, 10).toISOString()
    },
    {
        id: 'p10_12', authorId: 'stu_5', authorName: 'Hoàng Văn E', title: 'Làm sao để nhớ các phím tắt trong Word/Excel?', 
        content: 'Ctrl+C, Ctrl+V thì dễ rồi, nhưng mấy cái như Ctrl+Shift+L (lọc) hay Ctrl+H (thay thế) mình hay quên quá.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 10, 12).toISOString()
    },
    {
        id: 'p10_13', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Hướng dẫn sử dụng Cloud Storage (Google Drive)', 
        content: 'Lưu trữ đám mây giúp bạn truy cập dữ liệu mọi lúc mọi nơi. Bài viết này hướng dẫn cách share file an toàn.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'NETWORK', grade: 10, createdAt: new Date(2023, 10, 15).toISOString()
    },
    {
        id: 'p10_14', authorId: 'stu_6', authorName: 'Vũ Thị F', title: 'Đề cương ôn tập thi Cuối kỳ 1 Tin 10', 
        content: 'Mình vừa tổng hợp lại các dạng bài tập Python có thể ra trong đề thi cuối kỳ. Chúc mọi người thi tốt!',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 12, 1).toISOString()
    },
    {
        id: 'p10_15', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Đáp án đề thi thử Tin học 10 lần 1', 
        content: 'Các em vào đối chiếu đáp án nhé. Lưu ý câu hỏi về vòng lặp While có bẫy vô hạn lặp.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2023, 12, 5).toISOString()
    },

    // --- 2. TRÍ TUỆ NHÂN TẠO (AI) (10 Bài) ---
    {
        id: 'p_ai_1', authorId: 'admin-1', authorName: 'CLB Tin học', title: 'AI là gì? Phân biệt AI, Machine Learning và Deep Learning', 
        content: 'AI là ô dù lớn bao trùm. Machine Learning là tập con của AI. Deep Learning là tập con của ML sử dụng mạng nơ-ron.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'ALGORITHMS', grade: 10, createdAt: new Date(2024, 1, 10).toISOString()
    },
    {
        id: 'p_ai_2', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'ChatGPT hoạt động như thế nào?', 
        content: 'Nó là một mô hình ngôn ngữ lớn (LLM) được huấn luyện để dự đoán từ tiếp theo trong câu dựa trên xác suất.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 1, 15).toISOString()
    },
    {
        id: 'p_ai_3', authorId: 'stu_7', authorName: 'Đặng Văn G', title: 'Ứng dụng AI trong việc học Tiếng Anh', 
        content: 'Mình dùng Duolingo và Grammarly, cả hai đều tích hợp AI để sửa lỗi ngữ pháp và phát âm rất tốt.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 1, 18).toISOString()
    },
    {
        id: 'p_ai_4', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Generative AI (AI tạo sinh) đang thay đổi thế giới', 
        content: 'Từ tạo ảnh (Midjourney) đến viết code (Copilot), AI tạo sinh đang mở ra kỷ nguyên sáng tạo mới.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 1, 20).toISOString()
    },
    {
        id: 'p_ai_5', authorId: 'stu_8', authorName: 'Bùi Thị H', title: 'Liệu AI có thay thế lập trình viên?', 
        content: 'Mình nghĩ AI sẽ là công cụ hỗ trợ (Copilot) chứ không thay thế hoàn toàn, vì con người vẫn cần tư duy logic và giải quyết vấn đề.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 1, 25).toISOString()
    },
    {
        id: 'p_ai_6', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Giới thiệu Gemini - AI của Google', 
        content: 'Gemini là mô hình đa phương thức, có thể hiểu cả văn bản, hình ảnh và video. Rất mạnh mẽ trong việc xử lý thông tin phức tạp.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 2, 1).toISOString()
    },
    {
        id: 'p_ai_7', authorId: 'stu_9', authorName: 'Ngô Văn I', title: 'Deepfake là gì và tại sao nó nguy hiểm?', 
        content: 'Deepfake dùng AI để ghép mặt người này vào video người khác. Cần cảnh giác với các cuộc gọi video lừa đảo.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'SECURITY', grade: 10, createdAt: new Date(2024, 2, 5).toISOString()
    },
    {
        id: 'p_ai_8', authorId: 'admin-1', authorName: 'CLB Tin học', title: 'Thực hành: Train một mô hình AI đơn giản với Teachable Machine', 
        content: 'Không cần code, bạn có thể dạy máy tính nhận diện hình ảnh (Chó/Mèo) chỉ trong 5 phút với công cụ của Google.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 2, 10).toISOString()
    },
    {
        id: 'p_ai_9', authorId: 'stu_10', authorName: 'Dương Thị K', title: 'Top 5 công cụ AI miễn phí cho học sinh', 
        content: '1. ChatGPT (Hỏi đáp), 2. Canva (Thiết kế), 3. Quillbot (Viết lách), 4. Notion AI (Ghi chú), 5. Perplexity (Tìm kiếm).',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 2, 15).toISOString()
    },
    {
        id: 'p_ai_10', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Đạo đức trong AI (AI Ethics)', 
        content: 'Vấn đề thiên kiến (Bias), bản quyền dữ liệu và quyền riêng tư là những thách thức lớn khi phát triển AI.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 2, 20).toISOString()
    },

    // --- 3. INTERNET OF THINGS (IoT) (10 Bài) ---
    {
        id: 'p_iot_1', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'IoT là gì? Khi vạn vật kết nối', 
        content: 'IoT (Internet of Things) là mạng lưới các thiết bị thông minh kết nối với nhau qua Internet, từ bóng đèn, tủ lạnh đến ô tô.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'NETWORK', grade: 10, createdAt: new Date(2024, 3, 1).toISOString()
    },
    {
        id: 'p_iot_2', authorId: 'stu_11', authorName: 'Lý Văn L', title: 'Dự án Smart Home đơn giản với Arduino', 
        content: 'Mình vừa làm xong hệ thống tự động bật đèn khi trời tối dùng cảm biến quang trở. Chi phí rất rẻ!',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 3, 5).toISOString()
    },
    {
        id: 'p_iot_3', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Vi điều khiển là gì? (Arduino vs ESP32)', 
        content: 'Arduino dễ học cho người mới. ESP32 mạnh hơn, có sẵn Wifi và Bluetooth, thích hợp cho các dự án IoT.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 3, 10).toISOString()
    },
    {
        id: 'p_iot_4', authorId: 'stu_12', authorName: 'Mai Thị M', title: 'Ứng dụng IoT trong Nông nghiệp (Smart Farm)', 
        content: 'Tưới cây tự động, giám sát độ ẩm đất qua điện thoại. Công nghệ đang thay đổi cách làm nông.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 3, 15).toISOString()
    },
    {
        id: 'p_iot_5', authorId: 'admin-1', authorName: 'CLB STEM', title: 'Thành phố thông minh (Smart City) vận hành thế nào?', 
        content: 'Đèn đường thông minh, cảm biến kẹt xe, thùng rác báo đầy... tất cả đều nhờ IoT và Big Data.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'NETWORK', grade: 10, createdAt: new Date(2024, 3, 20).toISOString()
    },
    {
        id: 'p_iot_6', authorId: 'stu_13', authorName: 'Hồ Văn N', title: 'Review bộ Kit học tập IoT cho người mới bắt đầu', 
        content: 'Nên mua bộ Starter Kit của Arduino, có đủ đèn LED, nút bấm, cảm biến nhiệt độ, màn hình LCD để vọc vạch.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 3, 25).toISOString()
    },
    {
        id: 'p_iot_7', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Bảo mật trong IoT: Nguy cơ tiềm ẩn', 
        content: 'Camera an ninh bị hack, khóa cửa thông minh bị vô hiệu hóa... Bảo mật cho thiết bị IoT cực kỳ quan trọng.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'SECURITY', grade: 10, createdAt: new Date(2024, 4, 1).toISOString()
    },
    {
        id: 'p_iot_8', authorId: 'stu_14', authorName: 'Đỗ Thị P', title: 'Giao thức MQTT trong IoT', 
        content: 'MQTT là giao thức truyền tin nhẹ, tốn ít băng thông, rất phù hợp cho các thiết bị cảm biến nhỏ gửi dữ liệu.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'NETWORK', grade: 10, createdAt: new Date(2024, 4, 5).toISOString()
    },
    {
        id: 'p_iot_9', authorId: 'admin-1', authorName: 'CLB Robot', title: 'Lập trình nhúng (Embedded) khác gì lập trình phần mềm?', 
        content: 'Lập trình nhúng tương tác trực tiếp với phần cứng, yêu cầu hiểu biết về điện tử và tối ưu tài nguyên.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 4, 10).toISOString()
    },
    {
        id: 'p_iot_10', authorId: 'stu_15', authorName: 'Trịnh Văn Q', title: 'Ý tưởng dự án thi KHKT: Thùng rác phân loại tự động', 
        content: 'Sử dụng Camera AI kết hợp với mạch Arduino để nhận diện và phân loại rác tái chế.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 4, 15).toISOString()
    },

    // --- 4. HƯỚNG NGHIỆP IT (15 Bài) ---
    {
        id: 'p_career_1', authorId: 'admin-1', authorName: 'Ban Tư vấn', title: 'Ngành Công nghệ thông tin gồm những chuyên ngành nào?', 
        content: 'Kỹ thuật phần mềm, An toàn thông tin, Khoa học dữ liệu, Hệ thống thông tin, Mạng máy tính...',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 5, 1).toISOString()
    },
    {
        id: 'p_career_2', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Lộ trình trở thành Frontend Developer', 
        content: 'Bắt đầu với HTML, CSS, JavaScript. Sau đó học ReactJS hoặc VueJS. Đừng quên học cách dùng Git.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 5, 5).toISOString()
    },
    {
        id: 'p_career_3', authorId: 'stu_16', authorName: 'Cao Thị R', title: 'Con gái học IT có vất vả không?', 
        content: 'Ngành nào cũng có cái khó riêng. Con gái thường tỉ mỉ, cẩn thận, rất hợp làm Tester hoặc UX/UI Design.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 5, 8).toISOString()
    },
    {
        id: 'p_career_4', authorId: 'admin-1', authorName: 'Anh Tuấn (Alumni)', title: 'Chia sẻ của cựu học sinh về ngành Data Science', 
        content: 'Data Science cần Toán (Thống kê) rất nhiều. Python là ngôn ngữ chính. Nhu cầu nhân lực đang tăng cao.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'PYTHON', grade: 10, createdAt: new Date(2024, 5, 12).toISOString()
    },
    {
        id: 'p_career_5', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Phân biệt Coder, Programmer và Developer', 
        content: 'Coder chỉ viết mã. Programmer giải quyết vấn đề. Developer xây dựng và bảo trì cả một hệ thống phần mềm.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 5, 15).toISOString()
    },
    {
        id: 'p_career_6', authorId: 'stu_17', authorName: 'Vương Văn S', title: 'Top 5 trường đại học đào tạo CNTT tốt nhất Việt Nam', 
        content: 'Bách Khoa, Công nghệ (UET), KHTN, FPT, UIT... Mỗi trường có thế mạnh riêng.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 5, 20).toISOString()
    },
    {
        id: 'p_career_7', authorId: 'admin-1', authorName: 'Ban Tư vấn', title: 'Kỹ năng mềm cần thiết cho dân IT', 
        content: 'Code giỏi chưa đủ. Bạn cần kỹ năng giao tiếp, làm việc nhóm, tiếng Anh và khả năng tự học.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 6, 1).toISOString()
    },
    {
        id: 'p_career_8', authorId: 'stu_18', authorName: 'Đinh Thị T', title: 'Học An toàn thông tin (Security) có khó không?', 
        content: 'Cần kiến thức rộng về mạng, hệ điều hành, lập trình. Rất "ngầu" nhưng cũng rất áp lực.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'SECURITY', grade: 10, createdAt: new Date(2024, 6, 5).toISOString()
    },
    {
        id: 'p_career_9', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Fullstack Developer là làm gì?', 
        content: 'Làm cả Frontend (giao diện) và Backend (xử lý dữ liệu). Đòi hỏi kiến thức toàn diện.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 6, 10).toISOString()
    },
    {
        id: 'p_career_10', authorId: 'stu_19', authorName: 'Lương Văn U', title: 'Nên chọn laptop nào để học lập trình?', 
        content: 'RAM tối thiểu 8GB (nên 16GB), SSD 256GB. Màn hình nên có độ phân giải tốt để nhìn code đỡ mỏi mắt.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 6, 15).toISOString()
    },
    {
        id: 'p_career_11', authorId: 'admin-1', authorName: 'Ban Tư vấn', title: 'Xu hướng tuyển dụng IT năm 2025', 
        content: 'AI Engineer, Cloud Architect và Cybersecurity Specialist sẽ là những vị trí được săn đón nhất.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 6, 20).toISOString()
    },
    {
        id: 'p_career_12', authorId: 'stu_20', authorName: 'Mạc Thị V', title: 'Tự học lập trình trên mạng ở đâu?', 
        content: 'FreeCodeCamp, Codecademy, Udemy, Coursera... và ngay trên LHP LMS này nữa!',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 7, 1).toISOString()
    },
    {
        id: 'p_career_13', authorId: 'admin-1', authorName: 'Cô Lan', title: 'Tester/QA - Nghề kiểm thử phần mềm', 
        content: 'Đảm bảo phần mềm không có lỗi trước khi đến tay người dùng. Một vai trò không thể thiếu trong quy trình sản xuất.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 7, 5).toISOString()
    },
    {
        id: 'p_career_14', authorId: 'stu_21', authorName: 'Nghiêm Văn X', title: 'Lương ngành IT có thực sự "khủng"?', 
        content: 'Lương khởi điểm khá cao so với mặt bằng chung, nhưng để đạt mức "ngàn đô" cần nỗ lực và kinh nghiệm thực chiến.',
        status: 'APPROVED', type: 'COMMUNITY', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 7, 10).toISOString()
    },
    {
        id: 'p_career_15', authorId: 'admin-1', authorName: 'Thầy Hùng', title: 'Lời khuyên cho các bạn lớp 10 đam mê IT', 
        content: 'Hãy học chắc Toán và Tiếng Anh. Bắt đầu với Python hoặc C++. Tham gia các CLB Tin học để có môi trường phát triển.',
        status: 'APPROVED', type: 'OFFICIAL', category: 'GENERAL', grade: 10, createdAt: new Date(2024, 7, 15).toISOString()
    }
];

export const MOCK_DOCS: Document[] = [
    {
        id: 'doc-1',
        title: 'Sách Giáo Khoa Tin Học 10 - Cánh Diều',
        content: 'Nội dung tóm tắt kiến thức SGK Tin học 10...',
        uploadedBy: 'System Admin',
        fileName: 'SGK_Tin10.pdf',
        fileUrl: '' 
    },
    {
        id: 'doc-2',
        title: 'Tài liệu hướng dẫn Python',
        content: 'Các cấu trúc điều khiển, biến, kiểu dữ liệu trong Python...',
        uploadedBy: 'Teacher A',
        fileName: 'Python_Guide.pdf',
        fileUrl: '' 
    }
];

export const MOCK_INFOGRAPHICS: Infographic[] = [
    {
        id: 'infographic-1',
        topicId: 't_10_A',
        title: 'Sơ đồ tư duy: Thông tin và Dữ liệu',
        description: 'Tóm tắt khái niệm thông tin, dữ liệu và quá trình xử lý thông tin.',
        imageUrl: 'https://via.placeholder.com/800x600?text=Infographic+Tin+10',
        createdAt: new Date().toISOString()
    }
];

// =============================================================================
// BÀI GIẢNG KHỐI 10 (20 BÀI)
// Video & Code Support
// =============================================================================
export const MOCK_LECTURES: Lecture[] = [
  // --- CHỦ ĐỀ A: MÁY TÍNH & XÃ HỘI TRI THỨC (4 Bài) ---
  {
    id: 'l10_a_01', topicId: 't_10_A', title: 'Chủ đề A - Bài 1: Thông tin và dữ liệu',
    description: 'Phân biệt thông tin và dữ liệu. Đơn vị đo thông tin (Bit, Byte, KB, MB...).',
    fileUrl: '', fileName: 'LyThuyet_Bai1.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    codeSnippet: '1 Byte = 8 Bit\n1 KB = 1024 Byte\n1 MB = 1024 KB\n1 GB = 1024 MB',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_a_02', topicId: 't_10_A', title: 'Chủ đề A - Bài 2: Hệ nhị phân & Biểu diễn thông tin',
    description: 'Cách máy tính dùng 0 và 1 để lưu trữ số, văn bản, hình ảnh, âm thanh.',
    fileUrl: '', fileName: 'LyThuyet_Bai2.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/L1UpkP3h9Kk',
    codeSnippet: '# Đổi số thập phân sang nhị phân trong Python\nprint(bin(10))  # 0b1010\nprint(bin(255)) # 0b11111111',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_a_03', topicId: 't_10_A', title: 'Chủ đề A - Bài 3: Các cổng Logic (AND, OR, NOT)',
    description: 'Tìm hiểu về đại số Boole và các cổng logic cơ bản cấu tạo nên máy tính.',
    fileUrl: '', fileName: 'LogicGates.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/gI-qXk7XojA',
    codeSnippet: 'print(True and False) # False\nprint(True or False)  # True\nprint(not True)       # False',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_a_04', topicId: 't_10_A', title: 'Chủ đề A - Bài 4: Phần cứng & Hệ điều hành',
    description: 'Cấu tạo máy tính (CPU, RAM, ROM) và chức năng của Hệ điều hành.',
    fileUrl: '', fileName: 'Hardware_OS.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/AkFi90lZmXA',
    createdAt: new Date().toISOString()
  },

  // --- CHỦ ĐỀ B: MẠNG MÁY TÍNH & INTERNET (4 Bài) ---
  {
    id: 'l10_b_01', topicId: 't_10_B', title: 'Chủ đề B - Bài 1: Mạng máy tính là gì?',
    description: 'Lợi ích của mạng máy tính. Các loại mạng LAN, WAN, Internet.',
    fileUrl: '', fileName: 'Network_Intro.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/3QhU9jd03a0',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_b_02', topicId: 't_10_B', title: 'Chủ đề B - Bài 2: Giao thức TCP/IP',
    description: 'Cách dữ liệu di chuyển trên Internet. Địa chỉ IP và DNS.',
    fileUrl: '', fileName: 'TCPIP.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/7_LPdttKXPc',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_b_03', topicId: 't_10_B', title: 'Chủ đề B - Bài 3: Internet vạn vật (IoT)',
    description: 'Khái niệm IoT, ứng dụng trong Smart Home, Smart City.',
    fileUrl: '', fileName: 'IoT_Basics.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/6mBO2vqLv38',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_b_04', topicId: 't_10_B', title: 'Chủ đề B - Bài 4: An toàn không gian mạng',
    description: 'Phòng tránh Virus, Malware và lừa đảo trực tuyến.',
    fileUrl: '', fileName: 'CyberSafety.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/yrg7dStJ7hM',
    createdAt: new Date().toISOString()
  },

  // --- CHỦ ĐỀ D: ĐẠO ĐỨC, PHÁP LUẬT (2 Bài) ---
  {
    id: 'l10_d_01', topicId: 't_10_D', title: 'Chủ đề D - Bài 1: Đạo đức & Văn hóa số',
    description: 'Quy tắc ứng xử trên mạng xã hội (Netiquette). Chống bắt nạt qua mạng.',
    fileUrl: '', fileName: 'Netiquette.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/JJt3wW3q8f8',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_d_02', topicId: 't_10_D', title: 'Chủ đề D - Bài 2: Bản quyền & Giấy phép',
    description: 'Luật sở hữu trí tuệ, bản quyền phần mềm và giấy phép Creative Commons.',
    fileUrl: '', fileName: 'Copyright.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/InzT7g6y_xU',
    createdAt: new Date().toISOString()
  },

  // --- CHỦ ĐỀ F: LẬP TRÌNH PYTHON (10 Bài) ---
  {
    id: 'l10_f_01', topicId: 't_10_F', title: 'Python - Bài 1: Hello World',
    description: 'Cài đặt môi trường Python. Viết chương trình đầu tiên.',
    fileUrl: '', fileName: 'Python_01.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    codeSnippet: 'print("Xin chào Python!")\nprint("LHP LMS")',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_02', topicId: 't_10_F', title: 'Python - Bài 2: Biến & Kiểu dữ liệu',
    description: 'Số nguyên (int), số thực (float), xâu (str) và boolean.',
    fileUrl: '', fileName: 'Python_02.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/khKwixs8ICo',
    codeSnippet: 'x = 10\ny = 3.14\nname = "Alice"\nprint(type(x))',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_03', topicId: 't_10_F', title: 'Python - Bài 3: Phép toán số học',
    description: 'Cộng, trừ, nhân, chia, chia lấy dư (%), lũy thừa (**).',
    fileUrl: '', fileName: 'Python_03.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/Wvma9tQY8tM',
    codeSnippet: 'a = 10\nb = 3\nprint(a / b)  # 3.333\nprint(a // b) # 3 (Chia nguyên)\nprint(a % b)  # 1 (Chia dư)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_04', topicId: 't_10_F', title: 'Python - Bài 4: Nhập xuất dữ liệu',
    description: 'Sử dụng input() và f-string để tương tác với người dùng.',
    fileUrl: '', fileName: 'Python_04.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/Z1Yd7upQsXY',
    codeSnippet: 'name = input("Tên bạn là gì? ")\nprint(f"Xin chào {name}!")',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_05', topicId: 't_10_F', title: 'Python - Bài 5: Cấu trúc rẽ nhánh (If-Else)',
    description: 'Câu lệnh điều kiện if, elif, else.',
    fileUrl: '', fileName: 'Python_05.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/Zp5MuPOtsSY',
    codeSnippet: 'score = 8.5\nif score >= 8.0:\n    print("Giỏi")\nelse:\n    print("Khá")',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_06', topicId: 't_10_F', title: 'Python - Bài 6: Vòng lặp For',
    description: 'Lặp với số lần biết trước dùng range().',
    fileUrl: '', fileName: 'Python_06.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/94UHCEmprCY',
    codeSnippet: 'for i in range(1, 6):\n    print(f"Lần {i}")',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_07', topicId: 't_10_F', title: 'Python - Bài 7: Vòng lặp While',
    description: 'Lặp với điều kiện kiểm tra trước.',
    fileUrl: '', fileName: 'Python_07.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/J8dkgM8Mck0',
    codeSnippet: 'n = 5\nwhile n > 0:\n    print(n)\n    n -= 1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_08', topicId: 't_10_F', title: 'Python - Bài 8: Danh sách (List)',
    description: 'Lưu trữ nhiều giá trị, truy cập và thay đổi phần tử.',
    fileUrl: '', fileName: 'Python_08.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/ohCDWZgNIU0',
    codeSnippet: 'fruits = ["Táo", "Cam", "Xoài"]\nfruits.append("Nho")\nprint(fruits[0])',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_09', topicId: 't_10_F', title: 'Python - Bài 9: Xâu ký tự (String)',
    description: 'Các phương thức xử lý chuỗi: split, join, find, replace.',
    fileUrl: '', fileName: 'Python_09.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/k9TUPpGqYTo',
    codeSnippet: 's = "Hello World"\nprint(s.lower())\nprint(s.replace("World", "Python"))',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l10_f_10', topicId: 't_10_F', title: 'Python - Bài 10: Hàm (Function)',
    description: 'Tự định nghĩa hàm để tái sử dụng code.',
    fileUrl: '', fileName: 'Python_10.pdf', fileType: 'PDF',
    videoUrl: 'https://www.youtube.com/embed/NSbOtYzIQI0',
    codeSnippet: 'def tinh_tong(a, b):\n    return a + b\n\nprint(tinh_tong(5, 10))',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_WORKSHEETS: Worksheet[] = [
    // ... (Keep existing worksheets)
    {
        id: 'ws_10_01', topicId: 't_10_A', title: 'Phiếu BT 1: Biểu diễn thông tin',
        description: 'Bài tập chuyển đổi hệ đếm (Nhị phân, Thập phân, Hexa) và đơn vị đo thông tin.',
        fileUrl: '', fileName: 'PBT_BieuDienThongTin.pdf', fileType: 'PDF', createdAt: new Date().toISOString()
    },
    // ...
];

export const MOCK_CODE_PROBLEMS: CodeProblem[] = [
    // ... (Keep existing code problems)
    {
    id: 'ml_1',
    title: 'Machine Learning Basics 1: Hồi quy tuyến tính',
    description: 'Viết chương trình dự đoán giá trị y dựa trên mô hình hồi quy tuyến tính đơn giản: y = w * x + b.\n\nĐầu vào là các hệ số w, b và giá trị đầu vào x. Hãy tính và in ra giá trị dự đoán y.',
    inputFormat: 'Dòng 1: Số thực w (trọng số)\nDòng 2: Số thực b (bias)\nDòng 3: Số thực x (đầu vào)',
    outputFormat: 'Một số thực duy nhất là giá trị dự đoán y.',
    examples: [
        { input: '2.0\n1.0\n3.0', output: '7.0', explanation: 'y = 2.0 * 3.0 + 1.0 = 7.0' },
        { input: '0.5\n-2.0\n10.0', output: '3.0', explanation: 'y = 0.5 * 10.0 - 2.0 = 3.0' }
    ],
    template: {
        python: 'def predict():\n    # Nhập dữ liệu\n    try:\n        w = float(input())\n        b = float(input())\n        x = float(input())\n    except EOFError:\n        return\n    \n    # Viết logic tính toán của bạn ở đây\n    y = 0 \n    \n    print(y)\n\npredict()',
        cpp: ''
    },
    difficulty: 'EASY',
    createdAt: new Date().toISOString()
  },
  // ...
];
