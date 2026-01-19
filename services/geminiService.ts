
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real app, never expose API keys on the client side. 
// This is for demonstration purposes within the requested architecture.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askDocumentChatbot = async (
  documentContent: string,
  userQuestion: string
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview'; 
    
    const systemInstruction = `
      Bạn là một trợ lý gia sư AI (AI Tutor) thông minh, tận tâm và chính xác.
      Nhiệm vụ của bạn là trả lời câu hỏi của học sinh CHỈ DỰA TRÊN nội dung tài liệu được cung cấp bên dưới.

      *** QUY TẮC TUYỆT ĐỐI ***:
      1.  **NGUỒN DỮ LIỆU DUY NHẤT**: Mọi thông tin trong câu trả lời phải được trích xuất hoặc suy luận trực tiếp từ phần "NỘI DUNG TÀI LIU". KHÔNG sử dụng kiến thức bên ngoài, kiến thức chung, hoặc bịa đặt thông tin.
      2.  **KHI KHÔNG CÓ THÔNG TIN**: Nếu câu hỏi không thể trả lời được dựa trên tài liệu, hãy trả lời ngắn gọn: "Xin lỗi, thông tin này không có trong tài liệu bạn cung cấp." (Không cố gắng đoán).
      3.  **PHONG CÁCH**: Giải thích dễ hiểu, sư phạm, logic. Nếu tài liệu là bài tập, hãy gợi ý cách làm thay vì cho đáp án ngay (trừ khi được yêu cầu).
      4.  **ĐỊNH DẠNG**: Sử dụng Markdown (in đậm, gạch đầu dòng) để trình bày rõ ràng.

      ---
      NỘI DUNG TÀI LIỆU:
      ${documentContent}
      ---
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userQuestion,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, 
      }
    });

    return response.text || "Xin lỗi, tôi không thể tạo câu trả lời lúc này.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với Chatbot. Vui lòng thử lại sau.";
  }
};

export const generateInfographicImage = async (prompt: string): Promise<string | null> => {
  try {
    // Using gemini-2.5-flash-image for general image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create an educational infographic illustration about: ${prompt}. Clean, modern vector style, educational context.` }],
      },
      config: {
        // responseMimeType is not supported for this model
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const generateTrueFalseQuestions = async (topicName: string, grade: number, count: number): Promise<any[]> => {
  try {
    const prompt = `Hãy tạo ${count} câu hỏi trắc nghiệm dạng Đúng/Sai (True/False) về chủ đề "${topicName}" dành cho học sinh lớp ${grade}.
    Nội dung câu hỏi cần xoay quanh kiến thức cơ bản và quan trọng của chủ đề này.
    
    Yêu cầu trả về định dạng JSON thuần túy (Array of Objects), không kèm markdown block.
    Cấu trúc mỗi object:
    - content: Nội dung câu hỏi (String)
    - correctAnswer: Đáp án đúng, chỉ được là string "Đúng" hoặc "Sai".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              correctAnswer: { type: Type.STRING, enum: ["Đúng", "Sai"] }
            },
            required: ["content", "correctAnswer"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Generate Questions Error:", error);
    return [];
  }
};

export const generateQuizFromContent = async (documentContent: string): Promise<any[]> => {
  try {
    const prompt = `Dựa trên nội dung tài liệu được cung cấp dưới đây, hãy tạo ra 5 câu hỏi Đúng/Sai để kiểm tra mức độ hiểu bài của học sinh.
    
    NỘI DUNG TÀI LIỆU:
    ${documentContent.substring(0, 10000)} ... (cắt bớt nếu quá dài)

    Yêu cầu:
    1. Câu hỏi phải liên quan trực tiếp đến thông tin trong tài liệu.
    2. Bao gồm cả giải thích ngắn gọn tại sao Đúng hoặc Sai.
    
    Trả về định dạng JSON:
    [
      {
        "content": "Nội dung câu hỏi",
        "correctAnswer": "Đúng" hoặc "Sai",
        "explanation": "Giải thích ngắn gọn"
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              correctAnswer: { type: Type.STRING, enum: ["Đúng", "Sai"] },
              explanation: { type: Type.STRING }
            },
            required: ["content", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Generate Document Quiz Error:", error);
    return [];
  }
};

export const gradeStudentCode = async (
  problemDesc: string,
  inputFormat: string,
  outputFormat: string,
  studentCode: string,
  language: string
): Promise<any> => {
  try {
    const systemInstruction = `
      Bạn là một Giáo viên Tin học AI (AI Judge) nghiêm khắc nhưng tận tâm. 
      Nhiệm vụ của bạn là chấm bài thực hành code của học sinh một cách tự động.
      
      QUY TRÌNH CHẤM BÀI:
      1. **Kiểm tra Cú pháp (Syntax Check)**: Xác định xem code có lỗi biên dịch/thông dịch cơ bản không.
      2. **Kiểm tra Logic (Logic Check)**: Phân tích xem thuật toán có giải quyết đúng vấn đề được mô tả không (bao gồm cả các trường hợp biên).
      3. **Đưa ra Phản hồi**:
         - Nếu code ĐÚNG: Khen ngợi và (tùy chọn) gợi ý cách viết tối ưu hơn.
         - Nếu code SAI: Chỉ ra lỗi sai về mặt logic hoặc cú pháp.
      
      QUY TẮC BẮT BUỘC:
      - **KHÔNG GIẢI HỘ**: Tuyệt đối không đưa ra đoạn code lời giải hoàn chỉnh (Full Solution).
      - **CHỈ GỢI Ý (HINTS)**: Đưa ra các gợi ý từng bước để học sinh tự suy nghĩ và sửa bài.
      - **Ngôn ngữ**: Tiếng Việt.
    `;

    const prompt = `
      THÔNG TIN BÀI TẬP:
      - Đề bài: ${problemDesc}
      - Input Format: ${inputFormat}
      - Output Format: ${outputFormat}
      - Ngôn ngữ lập trình: ${language}
      
      BÀI LÀM CỦA HỌC SINH:
      ${studentCode}
      
      HÃY CHẤM ĐIỂM VÀ NHẬN XÉT THEO CẤU TRÚC JSON SAU:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Điểm số từ 0 đến 100" },
            status: { type: Type.STRING, enum: ["Passed", "Failed", "Syntax Error", "Logic Error"] },
            feedback: { type: Type.STRING, description: "Nhận xét tổng quan của giáo viên" },
            syntaxCheck: { type: Type.STRING, description: "Kết quả kiểm tra cú pháp (VD: Hợp lệ / Lỗi dòng X)" },
            logicCheck: { type: Type.STRING, description: "Kết quả phân tích logic thuật toán" },
            hints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Danh sách 1-3 gợi ý sửa bài (không lộ code)" 
            },
            testCases: {
               type: Type.ARRAY,
               items: {
                   type: Type.OBJECT,
                   properties: {
                       input: { type: Type.STRING },
                       expected: { type: Type.STRING },
                       actual: { type: Type.STRING },
                       passed: { type: Type.BOOLEAN }
                   }
               },
               description: "Mô phỏng 3 test cases chạy thử"
            }
          },
          required: ["score", "status", "feedback", "hints", "syntaxCheck", "logicCheck"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Grading Error:", error);
    return null;
  }
};

// NEW: Stream function for AI Tutor
export const getAiTutorHintStream = async (
  problemDesc: string,
  studentCode: string,
  systemError: string = ""
) => {
  const model = "gemini-3-flash-preview"; 
  const systemInstruction = `
    Bạn là một trợ giảng Tin học lớp 10 thân thiện, kiên nhẫn.
    Nhiệm vụ của bạn là giúp học sinh sửa lỗi code Python nhưng KHÔNG ĐƯỢC làm hộ bài.

    NGUYÊN TẮC CỐT LÕI:
    1. KHÔNG BAO GIỜ viết lại toàn bộ đoạn code đã sửa đúng cho học sinh (trừ khi học sinh đã thử sửa nhiều lần mà vẫn sai).
    2. Hãy chỉ ra dòng bị lỗi và giải thích nguyên nhân bằng ngôn ngữ đơn giản, dễ hiểu (tránh dùng thuật ngữ chuyên sâu quá mức).
    3. Sử dụng phương pháp gợi mở (Socratic method). Ví dụ: Thay vì sửa lỗi "thiếu dấu hai chấm", hãy hỏi: "Em xem lại cuối dòng lệnh if đã có ký tự bắt buộc chưa?".
    4. Tập trung vào các lỗi thường gặp của lớp 10: Thụt đầu dòng (Indentation), nhầm lẫn "=" và "==", quên ép kiểu dữ liệu (int/float), sai tên biến.
    5. Luôn khích lệ tinh thần học sinh ở cuối câu trả lời.

    Định dạng câu trả lời ngắn gọn (dưới 3 câu nếu có thể).
  `;

  return await ai.models.generateContentStream({
    model: model,
    contents: `Đề bài: ${problemDesc}\nCode của học sinh:\n${studentCode}\nLỗi hệ thống báo (nếu có): ${systemError}`,
    config: {
      systemInstruction: systemInstruction,
    }
  });
};

export const explainCodeSnippet = async (codeSnippet: string): Promise<string> => {
  try {
    const prompt = `Giải thích đoạn code sau đây bằng tiếng Việt dễ hiểu cho học sinh cấp 3. Giải thích từng dòng hoặc logic chính:\n\n${codeSnippet}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Không thể giải thích đoạn code này.";
  } catch (error) {
    return "Lỗi kết nối AI.";
  }
};

export const analyzeCodeStyle = async (currentCode: string, historyCodes: string[]): Promise<any> => {
  try {
    // Mock history if empty
    const historyContext = historyCodes.length > 0 
        ? `LỊCH SỬ CODE CỦA HỌC SINH:\n${historyCodes.join('\n---\n')}`
        : "Học sinh chưa có lịch sử code, hãy phân tích dựa trên phong cách phổ biến của học sinh mới học.";

    const prompt = `
      Phân tích phong cách lập trình để phát hiện gian lận hoặc sự bất thường.
      
      CODE HIỆN TẠI:
      ${currentCode}
      
      ${historyContext}
      
      Hãy so sánh cách đặt tên biến (tiếng Anh/Việt), cách thụt lề, comment, và độ phức tạp.
      Trả về JSON: { "isSuspicious": boolean, "reason": string, "styleAnalysis": string }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                isSuspicious: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                styleAnalysis: { type: Type.STRING }
            }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { isSuspicious: false, reason: "AI Error", styleAnalysis: "" };
  }
};

export const generateCodeExercises = async (topic: string, requirements: string, count: number): Promise<any[]> => {
    try {
        const prompt = `Hãy đóng vai trò là một giáo viên Tin học giỏi.
        Nhiệm vụ: Tạo ${count} bài tập lập trình Python về chủ đề "${topic}".
        Yêu cầu đặc biệt: ${requirements} (ví dụ: mức độ khó dần, thực tế, ...).
        
        Trả về kết quả dưới dạng JSON Array (Danh sách các bài tập).
        Cấu trúc mỗi bài tập (Object):
        - title: Tên bài tập (ngắn gọn)
        - description: Mô tả đề bài chi tiết
        - inputFormat: Mô tả định dạng dữ liệu vào
        - outputFormat: Mô tả định dạng dữ liệu ra
        - examples: Mảng các ví dụ (input, output, explanation)
        - difficulty: 'EASY', 'MEDIUM', hoặc 'HARD'
        - template: Code mẫu Python (chỉ khung, chưa có lời giải)
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", // Use Pro for complex generation
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            inputFormat: { type: Type.STRING },
                            outputFormat: { type: Type.STRING },
                            difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD'] },
                            template: { type: Type.STRING },
                            examples: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        input: { type: Type.STRING },
                                        output: { type: Type.STRING },
                                        explanation: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Generate Code Exercises Error", error);
        return [];
    }
};
