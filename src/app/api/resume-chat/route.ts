import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT_CORPORATE = `You are an expert career counselor and resume analyst specializing in the Indian private/corporate job market.

Your job:
- Analyze resumes and give specific, actionable feedback
- Check ATS-friendliness (keywords, formatting, action verbs)
- Suggest roles based on skills and experience
- Help with cover letters, LinkedIn, interview prep

Keep responses concise and practical. Use bullet points. Be specific — no generic advice. Mix English with Hindi naturally where helpful.`;

const SYSTEM_PROMPT_GOVT = `You are an expert advisor for Indian government job (sarkari naukri) preparation.

Your job:
- Help with study timetables and schedules
- Explain exam syllabi (UPSC, SSC, Railway, Banking, State PSC, etc.)
- Suggest best books and resources
- Give preparation strategies based on available time
- Answer eligibility, age limit, and qualification questions

Be encouraging and practical. Use bullet points. Mix Hindi and English naturally. Always give specific, actionable advice.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, resumeText, mode } = body as {
      messages: { role: string; content: string }[];
      resumeText?: string;
      mode?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const systemPrompt = mode === "govt" ? SYSTEM_PROMPT_GOVT : SYSTEM_PROMPT_CORPORATE;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt + (resumeText
        ? `\n\nUser's resume:\n\n${resumeText.slice(0, 8000)}`
        : ""),
    });

    // Convert messages to Gemini format, skip last (sent as prompt)
    // Gemini requires history to start with 'user' role
    const allButLast = messages.slice(0, -1);
    const firstUserIdx = allButLast.findIndex((m) => m.role === "user");
    const validHistory = firstUserIdx === -1
      ? []
      : allButLast.slice(firstUserIdx).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Resume chat error:", message);

    let userMessage = "कुछ गड़बड़ हो गई। थोड़ी देर बाद try करें। 🙏";
    if (message.includes("429") || message.includes("quota") || message.includes("rate")) {
      userMessage = "AI अभी busy है। 1-2 मिनट बाद try करें। 🙏";
    } else if (message.includes("404")) {
      userMessage = "AI service temporarily unavailable। थोड़ी देर बाद try करें। 🙏";
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}

// PDF text extraction
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const { extractText } = await import("unpdf");
    const { text: rawText } = await extractText(new Uint8Array(bytes), { mergePages: true });
    const text = rawText?.trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Make sure it's a text-based PDF, not a scanned image." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PDF parse error:", message);
    return NextResponse.json(
      { error: "Failed to read PDF. Please try a different file." },
      { status: 500 }
    );
  }
}
