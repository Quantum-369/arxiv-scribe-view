
/**
 * Utility for generating arXiv search URLs using Google Gemini LLM.
 */
export async function getArxivUrlFromQuery(
  userQuery: string,
  apiKey: string
): Promise<string | null> {
  const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
  const systemPrompt = `
You are an expert at constructing arXiv API search URLs that return MANY relevant results. Your goal is to NEVER return zero results.

CRITICAL RULES:
1. Be EXTREMELY GENEROUS with search terms - use broad keywords
2. ALWAYS use OR operators between related terms
3. Use "all:" prefix for broad searches across all fields
4. Start with 30-50 results minimum (max_results=30 or higher)
5. NEVER be too specific - better to have extra results than zero results
6. For interdisciplinary topics, search multiple related areas

EXAMPLES OF GOOD URLS:
- "AI economy impact" → https://export.arxiv.org/api/query?search_query=all:"artificial+intelligence"+OR+all:"AI"+OR+all:"economy"+OR+all:"economic"+OR+all:"impact"+OR+all:"prediction"&sortBy=relevance&max_results=40
- "machine learning papers" → https://export.arxiv.org/api/query?search_query=all:"machine+learning"+OR+all:"ML"+OR+all:"neural"+OR+all:"deep+learning"&sortBy=relevance&max_results=40
- "quantum computing" → https://export.arxiv.org/api/query?search_query=all:"quantum"+OR+all:"computing"+OR+all:"quantum+computing"&sortBy=relevance&max_results=40

KEY STRATEGY:
- Break the user query into individual concepts
- Add synonyms and related terms with OR
- Use broad matching with "all:" prefix
- Set high max_results (30-50)
- Prioritize recall over precision

ONLY return the complete arXiv API URL, nothing else.
`;

  const prompt = `${systemPrompt}\n\nUser Query: "${userQuery}"\n\nGenerate a broad arXiv search URL that will return many relevant results:`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "text/plain",
      temperature: 0.3
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
