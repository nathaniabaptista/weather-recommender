// services/gemini.ts

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1/models";

export interface AIResponse {
    reasoning: string;
    itinerary: { activity: string; reason: string }[];
}

export async function getAICategories(condition: string, time: string, location: string): Promise<AIResponse> {
  const MODEL = "gemini-2.5-flash";
  // services/gemini.ts

    const prompt = `
    You are an expert local guide AI with deep knowledge of ${location}. 
    
    CURRENT CONTEXT:
    - User Location: ${location}
    - Current Time: ${time}
    - Weather Condition: ${condition}
    
    YOUR MISSION:
    Create a logical, time-sensitive itinerary based on the context above. 
    Follow this step-by-step reasoning process:
    1. ANALYZE: Is the weather suitable for outdoor activities? Is the time of day appropriate for specific venues (e.g., breakfast vs. nightlife)?
    2. SELECTION 1: Find a "Starting Activity" within a 30km radius of ${location}.
    3. SEQUENCING: Suggest 0 to 4 follow-ups. Each must be logically consistent (e.g., lunch after a morning walk) and within a 5-10km radius of the previous activity.
    4. FLEXIBILITY: If the weather or time is prohibitive, return an empty array or only 1 activity. Do not force 3 items.

    CONSTRAINTS:
    - Activities must be culture-specific (e.g., if in Goa, include seasonal shacks, heritage sites, or rain-friendly cafes).
    - Distances must follow the 30km (start) and 5-10km (subsequent) rule.
    
    SEARCH OPTIMIZATION RULE:
    The "activity" field must be a short 1-3 word CATEGORY only. 
    DO NOT include city or area names (like Morjim, Ashwem, Goa). 
    - ❌ BAD: "beach club Morjim"
    - ✅ GOOD: "beach club" or "cocktail bar" or "seafood restaurant"
    
    OUTPUT FORMAT:
    Return ONLY a JSON object:
    {
        "reasoning": "A brief explanation of your overall logic based on weather/time",
        "itinerary": [
            {
                "activity": "Keyword Search Term", 
                "reason": "Natural language explanation for the user of why this fits"
            }
        ]
    }
    If nothing is suitable, return {"reasoning": "Explanation", "itinerary": []}.
    `;

  try {
        const response = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        if (data.error) {
            console.log("LOG: Gemini API Error:", data.error.message);
            throw new Error(data.error.message);
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // --- CRITICAL DEBUG LOG ---
        console.log("RAW AI RESPONSE:", rawText); 

        if (!rawText) throw new Error("Empty AI Response");

        const cleanedJson = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error("Gemini Reasoning Error:", error);
        return {
            reasoning: "Connection issue. Searching for local spots within 10km.",
            itinerary: [{ activity: "restaurant", reason: "Check out a local favorite nearby!" }]
        };
    }
}