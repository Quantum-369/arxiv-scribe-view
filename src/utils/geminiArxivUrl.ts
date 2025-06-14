
/**
 * Utility for generating arXiv search URLs using Google Gemini LLM.
 * You must provide GEMINI_API_KEY as an environment variable (see below).
 */
export async function getArxivUrlFromQuery(
  userQuery: string,
  apiKey: string
): Promise<string | null> {
  // Gemini Instructions: Convert the user query to a valid arXiv API query URL
  const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
  const systemPrompt = `
You are an expert at reconstructing arXiv API search URLs.
When given ANY user search query for academic papers, convert it into an optimal arXiv search API URL (https://export.arxiv.org/api/query?...) to retrieve as many relevant results as possible.
ONLY RETURN the resulting URL as plain text (no commentary, no code blocks).
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

  const response = await fetch(modelUrl + `?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  // Try to robustly extract the first URL (sometimes Gemini may quote/markdown it)
  let text: string = "";
  if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
    text = result.candidates[0].content.parts[0].text.trim();
  }
  // Find http(s) link in response
  const urlMatch = text.match(/https?:\/\/[^\s)'"`]+/);
  return urlMatch ? urlMatch[0] : null;
}
