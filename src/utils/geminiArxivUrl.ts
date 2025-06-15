
/**
 * Utility for generating arXiv search URLs using Google Gemini LLM.
 */
export async function getArxivUrlFromQuery(
  userQuery: string,
  apiKey: string
): Promise<string | null> {
  const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
  const systemPrompt = `
You are an expert at constructing arXiv API search URLs that return MANY relevant results. Your PRIMARY GOAL is to NEVER return zero results.

CRITICAL RULES FOR SUCCESS:
1. ALWAYS use extremely broad search terms
2. Use "all:" prefix for maximum coverage across all fields
3. Use OR operators extensively between related concepts
4. Start with 50+ results (max_results=50 or higher)
5. Be VERY generous - better to have too many results than zero
6. For any economic/business topics, search across cs.AI, econ.*, stat.ML, cs.CY

PROVEN SUCCESSFUL PATTERNS:
- For "AI economy" → https://export.arxiv.org/api/query?search_query=all:"artificial+intelligence"+OR+all:"AI"+OR+all:"machine+learning"+OR+all:"economic"+OR+all:"economy"+OR+all:"prediction"+OR+all:"impact"&sortBy=relevance&max_results=50
- For "economics prediction" → https://export.arxiv.org/api/query?search_query=all:"economic"+OR+all:"economy"+OR+all:"prediction"+OR+all:"forecast"+OR+all:"model"&sortBy=relevance&max_results=50
- For "AI impact" → https://export.arxiv.org/api/query?search_query=all:"AI"+OR+all:"artificial+intelligence"+OR+all:"impact"+OR+all:"effect"+OR+all:"influence"&sortBy=relevance&max_results=50

STRATEGY FOR GUARANTEED RESULTS:
1. Extract 2-3 core concepts from user query
2. Add common synonyms and related terms
3. Use broad "all:" searches with OR operators
4. Set max_results to 50+
5. Use relevance sorting for best matches

ONLY return the complete arXiv API URL, nothing else.
`;

  const prompt = `${systemPrompt}\n\nUser Query: "${userQuery}"\n\nGenerate a broad arXiv search URL with many OR terms that guarantees results:`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "text/plain",
      temperature: 0.2 // Lower temperature for more consistent results
    }
  };

  try {
    console.log(`Calling Gemini API for query: "${userQuery}"`);
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
    
    console.log("Gemini response text:", text);
    
    // Fixed URL extraction - look for arXiv URLs specifically and handle quotes properly
    const arxivUrlMatch = text.match(/https?:\/\/export\.arxiv\.org\/api\/query\?[^\\s\n\r]*/);
    const generatedUrl = arxivUrlMatch ? arxivUrlMatch[0] : null;
    
    console.log("Extracted URL:", generatedUrl);
    return generatedUrl;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
