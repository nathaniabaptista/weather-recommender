// utils/activityRecomender.ts
import { getAICategories, AIResponse } from "../services/gemini";
import { getTextSearchPlace, Place } from "../services/places";

export async function getActivityRecommendation(
  condition: string,
  temp_c: number,
  latitude: number,
  longitude: number,
  locationName: string
): Promise<Place[]> {
    // 1. Get the AI reasoning (The only thing we MUST wait for first)
    const aiData: AIResponse = await getAICategories(condition, new Date().toLocaleTimeString(), locationName);
    
    if (!aiData.itinerary || aiData.itinerary.length === 0) return [];

    // 2. Fire all Google searches SIMULTANEOUSLY (Professional Standard)
    // We use .map to create an array of promises and Promise.all to run them at once
    const searchPromises = aiData.itinerary.map(async (item, index) => {
        // Use user location for all if we want speed, or keep the chain if you prefer proximity
        const results = await getTextSearchPlace(latitude, longitude, item.activity, 30000);
        
        if (results.length > 0) {
            return { ...results[0], aiReason: item.reason };
        }
        return null;
    });

    const results = await Promise.all(searchPromises);

    // 2. The fix: Use a more general type check for the predicate
    return results.filter((p): p is any => p !== null) as Place[];
}