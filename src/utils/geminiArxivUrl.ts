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
1. ALWAYS use extremely broad search terms.
2. Prefix every term with \`all:\` for maximum coverage across title, abstract, authors, comments, categories, etc.
3. Combine related terms with \`OR\`—be generous in synonyms, abbreviations, variants.
4. Always request at least 50 results (\`max_results=50\` or higher).
5. When in doubt, err on the side of too many results rather than too few.
6. If the user's topic maps to one or more arXiv subject classes (e.g., cs.AI, econ, stat.ML, physics), append them with \`OR cat:<subject>\`.

STANDARD QUERY FORM:
https://export.arxiv.org/api/query?
search_query=all:"TERM1"+OR+all:"TERM1_ALT"+OR+all:"TERM2"+…+OR+cat:SUBJECT1+OR+cat:SUBJECT2
&sortBy=relevance
&max_results=50

STRATEGY FOR EVERY USER QUERY:
1. Parse the user's request to identify 2–3 core concepts.
2. Expand each concept into common synonyms, abbreviations, related buzz‑words.
3. Assemble an \`all:\`‑prefixed OR chain of every variant.
4. Optionally append any relevant \`cat:\` filters to broaden the subject scope.
5. Set \`sortBy=relevance\` and \`max_results=50+\`.
6. Output ONLY the fully‑formed arXiv API URL—no commentary.

Example (for a generic "quantum optimization" request):
https://export.arxiv.org/api/query?search_query=all:"quantum"+OR+all:"quantum+computing"+OR+all:"optimization"+OR+all:"quantum+optimization"+OR+all:"variational"+OR+all:"VQE"+OR+cat:quant-ph+OR+cat:cs.DS&sortBy=relevance&max_results=50
`;

  const prompt = `${systemPrompt}\n\nUser Query: "${userQuery}"\n\nGenerate the arXiv API URL:`;

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
