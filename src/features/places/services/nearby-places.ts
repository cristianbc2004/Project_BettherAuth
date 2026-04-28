export type NearbyPlace = {
  distanceLabel: string;
  featured?: boolean;
  id: string;
  name: string;
  speciality: string;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
};

type OverpassElement = {
  center?: {
    lat?: number;
    lon?: number;
  };
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string | undefined>;
  type: string;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const nearbyPlaceRadius = 40000;
const nearbyPlaceLimit = 120;
const nearbyFoodAmenities = ["restaurant", "bar", "cafe", "pub", "fast_food", "food_court", "biergarten"];
const overpassEndpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export const fallbackLocation: UserLocation = {
  latitude: 40.4168,
  longitude: -3.7038,
};

function getDistanceInMeters(from: UserLocation, to: UserLocation) {
  const earthRadius = 6371000;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLatitude = (from.latitude * Math.PI) / 180;
  const toLatitude = (to.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distanceInMeters: number) {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  }

  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

function isOverpassResponse(value: unknown): value is OverpassResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (!("elements" in value) || Array.isArray((value as OverpassResponse).elements))
  );
}

function getElementLocation(element: OverpassElement): UserLocation | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return {
      latitude: element.lat,
      longitude: element.lon,
    };
  }

  if (typeof element.center?.lat === "number" && typeof element.center?.lon === "number") {
    return {
      latitude: element.center.lat,
      longitude: element.center.lon,
    };
  }

  return null;
}

export async function fetchNearbyFoodPlaces(location: UserLocation): Promise<NearbyPlace[]> {
  const amenityFilter = nearbyFoodAmenities.join("|");
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"^(${amenityFilter})$"](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
      way["amenity"~"^(${amenityFilter})$"](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
      relation["amenity"~"^(${amenityFilter})$"](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
      node["name"~"venta|ventas",i](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
      way["name"~"venta|ventas",i](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
      relation["name"~"venta|ventas",i](around:${nearbyPlaceRadius},${location.latitude},${location.longitude});
    );
    out center tags ${nearbyPlaceLimit};
  `;
  let payload: unknown = null;
  let hasResponse = false;

  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(endpoint, {
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        method: "POST",
      });

      if (!response.ok) {
        continue;
      }

      payload = await response.json();
      hasResponse = true;
      break;
    } catch {
      hasResponse = false;
    }
  }

  if (!hasResponse) {
    throw new Error("Unable to load nearby food places.");
  }

  if (!isOverpassResponse(payload)) {
    throw new Error("Nearby food places response is invalid.");
  }

  return (payload.elements ?? [])
    .map((element) => {
      const coordinates = getElementLocation(element);

      if (!coordinates) {
        return null;
      }

      const distance = getDistanceInMeters(location, coordinates);
      const cuisine = element.tags?.cuisine;
      const amenity = element.tags?.amenity?.replace(/_/g, " ");

      return {
        distance,
        distanceLabel: formatDistance(distance),
        id: `${element.type}-${element.id}`,
        name: element.tags?.name ?? "Lugar cercano",
        speciality: cuisine ? cuisine.replace(/_/g, " ") : amenity ?? "Comida y bebida",
      };
    })
    .filter((place): place is NearbyPlace & { distance: number } => place !== null)
    .sort((left, right) => left.distance - right.distance)
    .map(({ distance: _distance, ...place }, index) => ({
      ...place,
      featured: index === 0,
    }));
}
