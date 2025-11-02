import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TodoItem {
  title: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  console.log("===== Function started =====");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Reading request body...");
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      console.log("No imageBase64 provided");
      return new Response(
        JSON.stringify({ error: "画像データが必要です" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Image base64 length:", imageBase64.length);

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "Gemini APIキーが設定されていません" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Calling Gemini Vision API...");

    // Use gemini-2.0-flash-exp for vision capabilities
    const model = "gemini-2.0-flash-exp";
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `この画像を分析して、ToDoリストの項目を抽出してください。\n\n各項目について、以下のJSON形式で返してください：\n\n{\n  \"todos\": [\n    {\n      \"title\": \"タスクのタイトル\",\n      \"description\": \"タスクの詳細説明\"\n    }\n  ]\n}\n\n- タイトルは簡潔に（30文字以内）\n- 説明は具体的に（100文字以内）\n- ToDoが見つからない場合は空配列を返してください\n- JSON形式のみを返し、他の説明は不要です`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Gemini APIエラー",
          details: errorText,
          status: geminiResponse.status,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini response received");

    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error("No content in Gemini response");
      return new Response(
        JSON.stringify({ error: "Geminiからの応答が空です" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Parsing Gemini response...");
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Content was:", content);
      return new Response(
        JSON.stringify({
          error: "Geminiの応答をパースできませんでした",
          details: String(parseError),
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const todos: TodoItem[] = parsedResponse.todos || [];
    console.log(`Success! Found ${todos.length} todos`);

    return new Response(
      JSON.stringify({ todos }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("===== ERROR CAUGHT =====");
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");

    return new Response(
      JSON.stringify({
        error: "処理中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
