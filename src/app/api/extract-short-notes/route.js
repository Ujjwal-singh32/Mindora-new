import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Utility: split text into chunks
function splitIntoChunks(text, chunkSize = 3000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

// Utility: call Gemini
async function callGemini(prompt) {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4, // more factual summaries
      },
    });

    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error("Gemini SDK Error:", err.message);
    throw new Error("Gemini generation failed");
  }
}

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        { status: 400 }
      );
    }

    // 1️⃣ Split text into chunks
    const chunks = splitIntoChunks(text, 3000);

    // 2️⃣ Summarize each chunk
    const chunkSummaries = [];

    for (const chunk of chunks) {
      const prompt = `
You are an expert assistant creating short notes from a large text.

Instructions:
- Extract only key points, important facts, formulas, examples.
- Use bullet points or numbered lists.
- Avoid filler or introductions.
- Keep notes concise but complete for study.

Chunk text:
${chunk}

Return plain text with bullets.
`;

      const summary = await callGemini(prompt);
      chunkSummaries.push(summary);
    }

    // 3️⃣ Combine summaries
    const combinedSummary = chunkSummaries.join("\n");

    // 4️⃣ Final refinement
    const finalPrompt = `
You are an expert assistant refining short notes.

Instructions:
- Merge and organize all points.
- Remove duplicates.
- Structure clearly with bullets or headings.
- Bold headings.
- No intro or conclusion.
- Cover all main topics.

Combined summaries:
${combinedSummary}

Return plain text.
`;

    const finalSummary = await callGemini(finalPrompt);

    return new Response(
      JSON.stringify({
        finalSummary,
        chunkSummaries,
        numChunks: chunks.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Summarization Error:", err.message);

    return new Response(
      JSON.stringify({ error: "Failed to summarize text" }),
      { status: 500 }
    );
  }
}
