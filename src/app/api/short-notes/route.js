// /app/api/notes/process-short-notes/route.js
import axios from "axios";

/**
 * 🧠 SIMPLE IN-MEMORY QUEUE (acts like background worker)
 */
const jobQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;

  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift();

    try {
      console.log("⚙️ Processing job:", job.topic);

      // 1️⃣ Extract PDF text
      const extractRes = await axios.post(
        `${process.env.FLASK_URL}/extract-pdf`,
        { url: job.pdfUrl }
      );

      const extractedText = extractRes.data?.text;

      if (!extractedText) {
        console.log("❌ PDF extract failed");
        continue;
      }

      // 2️⃣ Call summary API (Gemini via your existing API)
      let shortNotes = "";

      try {
        const summaryRes = await axios.post(
          `${process.env.NEXTJS_URL}/api/extract-short-notes`,
          { text: extractedText },
          { timeout: 60000 }
        );

        shortNotes = summaryRes.data?.finalSummary;
      } catch (err) {
        console.log("⚠️ Gemini failed, retry later");

        // 🔥 fallback so job still completes
        shortNotes =
          "⚠️ Auto-generated fallback notes (AI busy)\n\n" +
          extractedText.slice(0, 1200);
      }

      // 3️⃣ Save to DB
      try {
        await axios.post(
          `${process.env.NEXTJS_URL}/api/short-notes/upload`,
          {
            roomId: job.roomId,
            topic: job.topic,
            shortNotes,
          }
        );
      } catch (dbErr) {
        console.log("❌ DB save failed:", dbErr.message);
      }

      console.log("✅ Job completed:", job.topic);
    } catch (err) {
      console.log("❌ Job crashed:", err.message);
    }
  }

  isProcessing = false;
}

export async function POST(req) {
  try {
    console.log("📥 Job received");

    const body = await req.json();
    const { pdfUrl, topic, roomId } = body;

    if (!pdfUrl || !topic || !roomId) {
      return new Response(
        JSON.stringify({
          message: "pdfUrl, topic, and roomId are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1️⃣ Push job to queue (NO WAIT)
    jobQueue.push({ pdfUrl, topic, roomId });

    // 2️⃣ Trigger background processor
    processQueue();

    console.log("🚀 Job queued successfully");

    // 3️⃣ Immediate response (IMPORTANT)
    return new Response(
      JSON.stringify({
        message:
          "Your request is queued and will be processed shortly.",
        status: "queued",
        topic,
        roomId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Process short notes error:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}