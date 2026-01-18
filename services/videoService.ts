import { GoogleGenAI } from "@google/genai";

export const generateIntroVideo = async (): Promise<string | null> => {
  try {
    // 1. Check/Request API Key
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
            await aiStudio.openSelectKey();
            // Re-check after dialog closes (conceptually, though usually we assume success/retry)
        }
    }

    // 2. Initialize Client with fresh key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Start Generation
    console.log("Starting video generation...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic wide shot of a futuristic high-tech educational dashboard interface with glowing charts, floating quiz questions, and a friendly AI robot helper, bright blue and white color scheme, 4k, photorealistic, smooth motion',
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    // 4. Poll for completion
    console.log("Polling for video completion...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    // 5. Extract URI
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (videoUri) {
        // Append API key for playback permission
        return `${videoUri}&key=${process.env.API_KEY}`;
    }
    
    return null;

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message && error.message.includes("Requested entity was not found")) {
        const aiStudio = (window as any).aistudio;
        if (aiStudio) {
             await aiStudio.openSelectKey();
        }
    }
    throw error;
  }
};