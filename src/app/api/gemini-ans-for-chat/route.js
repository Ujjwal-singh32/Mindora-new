import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

async function callGemini(prompt) {
  try {
    console.log("api hit");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    return "Sorry, I couldn't fetch an answer.";
  }
}

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "No question provided" }),
        { status: 400 }
      );
    }

    const prompt = `
You are an expert assistant. Answer the following question clearly and concisely.
Return the answer in maximum 10 lines and try to be short.

Question:
${question}

Answer:
`;

    const answer = await callGemini(prompt);

    return new Response(
      JSON.stringify({ answer }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in /api/ask:", err.message);

    return new Response(
      JSON.stringify({ error: "Failed to get answer" }),
      { status: 500 }
    );
  }
}