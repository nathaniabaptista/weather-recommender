// utils/activityRecomender.ts

// Assuming you have the Place interface defined in services/places.ts
// For now, let's redefine it here or assume it's imported for type safety
interface Place {
  name: string;
  address: string;
  rating: number;
  type: string;
}

import { getNearbyPlace } from "../services/places";

/**
 * Determines the best category of place to search for based on weather and temperature.
 * @param condition Weather condition string (e.g., "Partly Cloudy").
 * @param temp_c Current temperature in Celsius.
 * @returns A string representing the place type to search for (e.g., 'cafe', 'park').
 */
function determinePlaceType(condition: string, temp_c: number): string {
  const cond = condition.toLowerCase();

  // --- Indoor/Rainy/Cool Logic ---
  if (cond.includes("rain") || cond.includes("shower") || cond.includes("sleet")) {
    // If it's rainy, suggest something fully indoor regardless of temperature
    return 'museum';
  }

  // --- Cloudy/Mild Logic ---
  if (cond.includes("cloud") || cond.includes("overcast") || cond.includes("mist")) {
    if (temp_c > 25) {
        // Warm but cloudy: Good for active outdoor things without direct sun
        return 'park'; 
    }
    // Cooler/Mild and cloudy: Relaxing indoors
    return 'cafe';
  }

  // --- Sunny/Clear Logic ---
  if (cond.includes("sunny") || cond.includes("clear")) {
    if (temp_c > 28) {
        // Hot and sunny: Seek shade or cool water
        return 'beach'; 
    }
    if (temp_c >= 18) {
      // Pleasant temperature: Ideal outdoor exploration
      return 'park';
    }
    // Sunny but cold: Still nice to be outside, but bundled up
    return 'cafe'; 
  }

  // Default: When weather is unexpected or generic
  return 'default';
}


/**
 * Core function: Coordinates place type determination and fetching of specific locations.
 * @returns A formatted string recommending a specific nearby place.
 */
export async function getActivityRecommendation(
  condition: string,
  temp_c: number,
  latitude: number,
  longitude: number
): Promise<string> {
  // 1. Determine the category of place needed
  const placeType = determinePlaceType(condition, temp_c);

  // 2. Fetch specific nearby places using the coordinates and chosen type
  const nearbyPlaces = await getNearbyPlace(latitude, longitude, placeType);

  if (nearbyPlaces && nearbyPlaces.length > 0) {
    // 3. Select the best place (e.g., the first one, or the highest rated one)
    const bestPlace: Place = nearbyPlaces[0]; 
    
    // 4. Return the specific, actionable recommendation
    return `Recommendation: Visit ${bestPlace.name}! It's a great ${bestPlace.type} located at ${bestPlace.address}. (Rated ${bestPlace.rating})`
  }

  // Fallback if the place service fails or returns zero results
  return `Weather suggests ${placeType}. Explore nearby attractions in the area!`;
}