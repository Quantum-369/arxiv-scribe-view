
/**
 * Utility for generating arXiv search URLs using Google Gemini LLM.
 * API key is passed as parameter from localStorage.
 */
export async function getArxivUrlFromQuery(
  userQuery: string,
  apiKey: string
): Promise<string | null> {
  if (!apiKey) {
    console.log("No API key provided");
    return null;
  }

  // Gemini Instructions: Convert the user query to a valid arXiv API query URL
  const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
  const systemPrompt = `
You are an expert at constructing arXiv API search URLs.
When given ANY user search query for academic papers, convert it into an optimal arXiv search API URL (https://export.arxiv.org/api/query?...) to retrieve as many relevant results as possible.

Guidelines:
- Use search_query parameter with appropriate terms
- For topics like "machine learning", use: search_query=all:machine+learning
- For specific fields, use category filters like: cat:cs.LG for machine learning
- For recent papers, use submittedDate ranges
- Always include max_results (suggest 16-32)
- Use sortBy=submittedDate for recent papers, sortBy=relevance for general searches

Examples:
- "machine learning papers" → https://export.arxiv.org/api/query?search_query=all:machine+learning&sortBy=relevance&max_results=16
- "recent AI papers" → https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&max_results=16
- "quantum computing 2024" → https://export.arxiv.org/api/query?search_query=all:quantum+computing+AND+submittedDate:[202401010000+TO+202412312359]&sortBy=submittedDate&max_results=16

ONLY RETURN the resulting URL as plain text (no commentary, no code blocks, no quotes).
`;

  const prompt = `${systemPrompt}\nUser Query: "${userQuery}"`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "text/plain"
    }
  };

  try {
    const response = await fetch(modelUrl + `?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    // Extract the response text
    let text: string = "";
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      text = result.candidates[0].content.parts[0].text.trim();
    }
    
    console.log("Gemini response:", text);
    
    // Find http(s) link in response
    const urlMatch = text.match(/https?:\/\/[^\s)'"`]+/);
    return urlMatch ? urlMatch[0] : null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
