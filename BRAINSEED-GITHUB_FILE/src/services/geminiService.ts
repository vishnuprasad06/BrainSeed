import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateInteractiveStoryStep = async (prompt: string, history: any[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are an interactive storyteller for a young child.
        Write the next part of the story depending on the user's choice. 
        Keep the text to 3-5 sentences.
        Provide exactly 2 exciting choices for what the user can do next.
        If the story concludes, set 'isEnding' to true and choices to empty array.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storyText: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            isEnding: { type: Type.BOOLEAN }
          },
          required: ["storyText", "choices", "isEnding"]
        } as Schema
      }
    });
    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Interactive Story Error:", error);
    return null;
  }
};

export const generateChatResponse = async (messages: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Something went wrong with my helper brain!";
  }
};

export const getAIResponse = async (prompt: string, userContext: { name: string, grade: string }) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are Gemini Tutor, a super-friendly, playful, and magical learning buddy for children! 
        The child's name is ${userContext.name} and they are in Grade ${userContext.grade}. 
        
        Your Personality:
        - Use lots of playful language (e.g., "Holy guacamole!", "Twinkling stars!", "You're a superstar!").
        - Be incredibly encouraging. If they get something wrong, say "Great try! Let's think about it together!"
        - High-energy and positive!
        - Start by asking them something friendly about their day or their favorite thing.
        
        Your Mission:
        - Keep explanations very simple and visual.
        - Ask interactive questions to keep them engaged.
        - Always keep the conversation safe, kind, and educational.
        - If they seem happy, celebrate with them!`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Oops! My brain is fuzzy right now. Let's try again in a bit!";
  }
};

const createWavHeader = (dataSize: number) => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  // file length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  // format chunk identifier
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, 24000, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 24000 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  // data chunk length
  view.setUint32(40, dataSize, true);

  return new Uint8Array(buffer);
};

export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say warmly and cheerfully: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }, // Friendly female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // The TTS API returns raw linear16 PCM. We need to prepend a WAV header.
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const pcmData = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
      }

      const wavHeader = createWavHeader(len);
      const wavData = new Uint8Array(wavHeader.length + pcmData.length);
      wavData.set(wavHeader);
      wavData.set(pcmData, wavHeader.length);

      const blob = new Blob([wavData], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
};
