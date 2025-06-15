
/**
 * Utility for generating arXiv search URLs using Google Gemini LLM.
 */
export async function getArxivUrlFromQuery(
  userQuery: string,
  apiKey: string
): Promise<string | null> {
  const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
  const systemPrompt = `
You are an expert at constructing arXiv API search URLs that return many relevant results.

Convert user queries into arXiv API URLs. Be VERY GENEROUS with search terms to avoid zero results.

Key rules:
- Use broad search terms with OR operators for more results
- For interdisciplinary topics like "Economics and AI", search across multiple fields
- Don't over-constrain with category filters unless very specific
- Use "all:" prefix for broad searches
- Always aim for 20-50 results minimum

Examples:
- "Economics and AI impact" → https://export.arxiv.org/api/query?search_query=all:"economics"+OR+all:"economic"+OR+all:"AI"+OR+all:"artificial+intelligence"&sortBy=relevance&max_results=30
- "machine learning papers" → https://export.arxiv.org/api/query?search_query=all:"machine+learning"+OR+all:"ML"&sortBy=relevance&max_results=30
- "recent quantum computing" → https://export.arxiv.org/api/query?search_query=all:"quantum+computing"+OR+all:"quantum"&sortBy=submittedDate&max_results=30

ONLY return the URL, nothing else.
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
    
    let text: string = "";
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      text = result.candidates[0].content.parts[0].text.trim();
    }
    
    console.log("Gemini response:", text);
    
    const urlMatch = text.match(/https?:\/\/[^\s)'"`]+/);
    return urlMatch ? urlMatch[0] : null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
