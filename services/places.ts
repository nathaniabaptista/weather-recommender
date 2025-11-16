// services/places.ts

interface Place {
  name: string;
  address: string;
  rating: number;
  type: string;
}

// Data Map of Recommendations for a Sample Location (Goa)
const GOA_MOCK_PLACES: Record<string, Place[]> = {
  // Indoor (Rainy/Cold)
  museum: [
    { name: "Goa State Museum", address: "Panaji", rating: 4.0, type: "museum" },
    { name: "Naval Aviation Museum", address: "Vasco da Gama", rating: 4.5, type: "museum" },
  ],
  cafe: [
    { name: "Caravela Cafe and Bistro", address: "Panaji", rating: 4.4, type: "cafe" },
    { name: "Baba Au Rhum", address: "Anjuna", rating: 4.6, type: "cafe" },
  ],
  // Outdoor/Sun
  beach: [
    { name: "Palolem Beach", address: "Canacona", rating: 4.8, type: "beach" },
    { name: "Ashwem Beach", address: "Mandrem", rating: 4.3, type: "beach" },
  ],
  park: [
    { name: "Bondla Wildlife Sanctuary", address: "Usgao-Ganjem", rating: 4.5, type: "park" },
    { name: "Japanese Garden", address: "Vasco da Gama", rating: 4.1, type: "park" },
  ],
  // Generic Fallback
  default: [
    { name: "Local Market", address: "Near Mapusa", rating: 4.0, type: "market" },
    { name: "Local Temple/Church", address: "Old Goa", rating: 4.5, type: "historic" },
  ],
};

/**
 * Mocks fetching nearby places. This will be replaced by a real API call (e.g., Overpass) later.
 * @param latitude The user's current latitude (unused in mock).
 * @param longitude The user's current longitude (unused in mock).
 * @param placeType The category of place to search for (e.g., 'museum', 'cafe', 'beach').
 * @returns A promise resolving to an array of mock Place objects.
 */
export async function getNearbyPlace(
  latitude: number,
  longitude: number,
  placeType: string
): Promise<Place[]> {
  // Simulate network latency (200ms delay) for a better dev experience
  await new Promise(resolve => setTimeout(resolve, 200));

  const places = GOA_MOCK_PLACES[placeType.toLowerCase()];

  if (places && places.length > 0) {
    return places;
  }

  // Fallback to default places if the requested type isn't mocked
  return GOA_MOCK_PLACES['default'];
}