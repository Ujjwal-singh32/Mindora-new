import axios from "axios";

/**
 * Calls Claude API with the given prompt
 * @param {string} prompt - The prompt to send to Claude
 * @returns {Promise<string>} - The answer from Claude or error message
 */
async function callClaude(prompt) {
  try {
    // Log API call for debugging
    console.log("🚀 Claude API call initiated");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "..."); // Log first 100 chars

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY environment variable not found");
      throw new Error("API key not configured");
    }
    console.log("✅ API key found");

    // Make request to Claude API
    const res = await axios.post(
      `https://api.anthropic.com/v1/messages`,
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.GEMINI_API_KEY,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    // Log successful response
    console.log("✅ Claude API response received");
    console.log("📊 Response status:", res.status);

    // Extract answer from response
    const answer = res.data.content?.[0]?.text || "";
    console.log("💬 Answer length:", answer.length, "characters");
    
    return answer.trim();
  } catch (err) {
    // Detailed error logging for debugging
    console.error("❌ Claude API Error occurred");
    console.error("🔴 Error message:", err.message);
    
    if (err.response?.status === 401) {
      console.error("❌ Authentication failed - Check your API key");
    } else if (err.response?.status === 429) {
      console.error("❌ Rate limit exceeded - Too many requests");
    } else if (err.response?.status === 500) {
      console.error("❌ Claude API server error");
    }
    
    console.error("📋 Full error:", err.response?.data || err.message);
    
    return "Sorry, I couldn't fetch an answer.";
  }
}

/**
 * POST handler for /api/ask endpoint
 * Receives a question and returns an answer from Claude
 */
export async function POST(req) {
  try {
    // Log incoming request
    console.log("📨 Incoming request to /api/ask");
    
    // Parse request body
    const { question } = await req.json();
    console.log("❓ Question received:", question?.substring(0, 50) + "...");

    // Validate question
    if (!question) {
      console.warn("⚠️ Warning: No question provided in request");
      return new Response(
        JSON.stringify({ error: "No question provided" }),
        { status: 400 }
      );
    }
    console.log("✅ Question validated");

    // Create prompt for Claude
    const prompt = `You are an expert assistant. Answer the following question clearly and concisely:
You should return the answer in max 10 lines. But you should always try to be short.

Question:
${question}

Answer:`;

    console.log("🔄 Calling Claude API...");
    
    // Call Claude API
    const answer = await callClaude(prompt);
    
    console.log("✅ Answer received successfully");
    console.log("📤 Sending response back to client");

    // Return successful response
    return new Response(
      JSON.stringify({ answer }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    // Error handling
    console.error("❌ Error in /api/ask endpoint:", err.message);
    console.error("📋 Stack trace:", err.stack);
    
    return new Response(
      JSON.stringify({ error: "Failed to get answer" }),
      { status: 500 }
    );
  }
}
