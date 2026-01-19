// services/places.ts
export interface Place {
  name: string;
  address: string;
  rating: number;
  type: string;
  googleMapsUri: string;
  latitude: number;
  longitude: number;
  aiReason?: string; // NEW: Optional field for the AI's explanation
}

const FIELD_MASK = 'places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.location';

export async function getTextSearchPlace(
  lat: number, 
  lng: number, 
  query: string, 
  radius: number
): Promise<Place[]> {
  const url = `https://places.googleapis.com/v1/places:searchText`;

  const requestBody = {
    textQuery: query,
    maxResultCount: 1,
    locationBias: { 
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius 
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
      'X-Goog-FieldMask': FIELD_MASK
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  console.log(`DEBUG: Google returned ${data.places?.length || 0} results for "${query}"`);

  if (data.places && data.places.length > 0) {
    console.log("FIRST RESULT NAME:", data.places[0].displayName?.text);
  }

  console.log(`Searching for ${query} near: ${lat}, ${lng} within ${radius}m`);

  return (data.places || []).map((p: any) => ({
    name: p.displayName.text,
    address: p.formattedAddress,
    rating: p.rating || 0,
    type: query,
    googleMapsUri: p.googleMapsUri,
    // EXTRACT THE COORDINATES HERE:
    latitude: p.location.latitude,
    longitude: p.location.longitude
  }));
}