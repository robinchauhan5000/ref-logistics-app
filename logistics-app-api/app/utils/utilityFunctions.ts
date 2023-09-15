export const removeIdKeys = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeIdKeys(item))
  }

  const newObj: any = {}
  for (const key in obj) {
    if (key !== '_id') {
      newObj[key] = removeIdKeys(obj[key])
    }
  }

  return newObj
}

export const formatedDate = (data: string): string => {
  const currentDate = new Date(data)
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentDate.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export const calculateDeliveryCharges = function (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  base: number,
  perKm: number,
): {
  distance: number
  charge: number
  tax: number
} {
  const earthRadiusKm = 6371

  const dLat = degreesToRadians(lat2 - lat1)
  const dLon = degreesToRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const charge = base + parseFloat((earthRadiusKm * c).toFixed(0)) * 3.5 * perKm

  return {
    distance: parseFloat((earthRadiusKm * c).toFixed(0)) * 3.5,
    charge: charge,
    tax: charge * 0.1,
  }
}
