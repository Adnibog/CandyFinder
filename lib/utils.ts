import { UserLocation, CandyHouse } from './types'

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Optimize route using nearest neighbor algorithm (Greedy TSP)
 * Returns optimized order of house IDs
 */
export function optimizeRoute(
  startLocation: UserLocation,
  houses: CandyHouse[]
): {
  order: string[]
  totalDistance: number
} {
  if (houses.length === 0) {
    return { order: [], totalDistance: 0 }
  }

  if (houses.length === 1) {
    return {
      order: [houses[0].id],
      totalDistance: calculateDistance(
        startLocation.latitude,
        startLocation.longitude,
        houses[0].latitude,
        houses[0].longitude
      )
    }
  }

  const unvisited = new Set(houses.map(h => h.id))
  const order: string[] = []
  let currentLat = startLocation.latitude
  let currentLon = startLocation.longitude
  let totalDistance = 0

  while (unvisited.size > 0) {
    let nearestHouse: CandyHouse | null = null
    let shortestDistance = Infinity

    for (const houseId of unvisited) {
      const house = houses.find(h => h.id === houseId)!
      const distance = calculateDistance(
        currentLat,
        currentLon,
        house.latitude,
        house.longitude
      )

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestHouse = house
      }
    }

    if (nearestHouse) {
      order.push(nearestHouse.id)
      unvisited.delete(nearestHouse.id)
      totalDistance += shortestDistance
      currentLat = nearestHouse.latitude
      currentLon = nearestHouse.longitude
    }
  }

  return { order, totalDistance }
}

/**
 * Filter houses within a specific range from user location
 */
export function filterHousesByRange(
  userLocation: UserLocation,
  houses: CandyHouse[],
  rangeMiles: number
): CandyHouse[] {
  return houses.filter(house => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      house.latitude,
      house.longitude
    )
    return distance <= rangeMiles
  })
}

/**
 * Get user's current GPS location
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}
