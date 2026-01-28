import { supabaseServer } from "@/config/supabase";

export const config = {
  api: { bodyParser: false }, // disable Next.js body parsing
};

export async function POST(req) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get filename from custom header or fallback
    const filename = req.headers.get("x-filename") || "uploaded.pdf";

    // Upload the file to the "pdfs" bucket
    const { data, error } = await supabaseServer.storage
      .from("short-notes")
      .upload(filename, buffer, {
        contentType: req.headers.get("content-type") || "application/pdf",
        upsert: true, // overwrite if file exists
      });

    if (error) throw error;
    if (!data?.fullPath) throw new Error("Upload succeeded but no fullPath returned");

    // Manually construct the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;

    // console.log("Upload data:", data);
    // console.log("Public URL:", publicUrl);

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
