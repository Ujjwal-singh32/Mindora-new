// /app/api/notes/create-room-quiz/route.js

import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoomQuizzes } from "@/models/quizModel";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Utility to call Gemini
async function callGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    throw new Error("Gemini generation failed");
  }
}

// Utility to safely parse JSON from Gemini
function safeParseJSON(output) {
  try {
    return JSON.parse(output);
  } catch {
    const match = output.match(/\[.*\]/s);
    if (match) return JSON.parse(match[0]);

    const codeBlock = output.match(/```json([\s\S]*?)```/);
    if (codeBlock) return JSON.parse(codeBlock[1].trim());

    throw new Error("Invalid JSON from Gemini");
  }
}

// POST API
export async function POST(req) {
  try {
    const {
      pdfUrl,
      topic,
      title,
      difficulty = "Medium",
      timePerQuestion = 20,
      negativeMarking = 0,
      totalMarks = 100,
      numQuestions = 5,
      roomId,
      createdBy,
    } = await req.json();

    if (!pdfUrl || !topic || !title || !roomId || !createdBy) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1️⃣ Extract text from PDF (Flask server)
    const extractRes = await axios.post(
      `${process.env.FLASK_URL}/extract-pdf`,
      { url: pdfUrl }
    );

    const text = extractRes.data?.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Failed to extract text from PDF" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Generate MCQs using Gemini SDK
    const prompt = `
You are an expert educational assistant.

Generate ${numQuestions} multiple-choice questions (MCQs) from the text below.

TEXT:
${text}

Rules:
- Each question must have exactly 4 options.
- "correct" must be the 0-based index.
- Difficulty: ${difficulty}
- Output ONLY valid JSON array.
- No explanations.

Format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correct": 0
  }
]
`;

    const geminiOutput = await callGemini(prompt);

    let questions = [];
    try {
      questions = safeParseJSON(geminiOutput);
    } catch (err) {
      console.error("Failed to parse Gemini output:", geminiOutput);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON returned from Gemini",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3️⃣ Prepare quiz object
    const newQuiz = {
      title,
      topic,
      totalMarks,
      timePerQuestion,
      totalQuestions: questions.length,
      difficulty,
      negativeMarking,
      questions,
      createdBy,
      attemptedBy: [],
      createdAt: new Date(),
    };

    // 4️⃣ Insert into RoomQuizzes
    let roomQuiz = await RoomQuizzes.findOne({ roomId });

    if (!roomQuiz) {
      roomQuiz = new RoomQuizzes({
        roomId,
        quizzes: [newQuiz],
      });
    } else {
      roomQuiz.quizzes.push(newQuiz);
    }

    await roomQuiz.save();

    return new Response(
      JSON.stringify({ message: "Quiz created", quiz: newQuiz }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Create quiz error:", err.message || err);

    return new Response(
      JSON.stringify({ error: "Failed to create quiz" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
