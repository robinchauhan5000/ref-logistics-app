import bcrypt from 'bcryptjs';
import { uuid } from 'uuidv4';
// import weightPriceCalculation from './priceCalculation';
import axios from 'axios';
import { p2h2pPricing, p2pPricing } from './getPricing';

export const encryptPIN = (PIN: string): Promise<any> => {
  return new Promise<string>((resolve, reject) => {
    bcrypt.hash(PIN, 10, (err: any, hash: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

// export const durationToTimestamp = (duration: string) => {
//   if ((duration.startsWith('pT') && duration.endsWith('D')) || duration.endsWith('M') || duration.endsWith('H')) {
//     const numericPart = parseInt(duration.substring(2, duration.length - 1));

//     if (duration.endsWith('M')) return Date.now() + numericPart * 60 * 1000;
//     else if (duration.endsWith('H')) return Date.now() + numericPart * 60 * 60 * 1000;
//     else if (duration.endsWith('H')) return Date.now() + numericPart * 24 * 60 * 60 * 1000; // Convert hours to milliseconds
//   }
//   console.error('Invalid duration format when  converting duration to timestamp');
//   throw new Error('Invalid duration format when  converting duration to timestamp');
// };

export const durationToTimestamp = (duration: string) => {
  if (duration.startsWith('P') && duration.endsWith('D')) {
    const numericPart = parseInt(duration.substring(1, duration.length - 1));

    return Date.now() + numericPart * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  } else if (duration.startsWith('PT')) {
    if (duration.endsWith('M')) {
      const numericPart = parseInt(duration.substring(2, duration.length - 1));

      return Date.now() + numericPart * 60 * 1000; // Convert minutes to milliseconds
    } else if (duration.endsWith('H')) {
      const numericPart = parseInt(duration.substring(2, duration.length - 1));

      return Date.now() + numericPart * 60 * 60 * 1000; // Convert hours to milliseconds
    }
  }

  console.error('Invalid duration format when converting duration to timestamp');
  throw new Error('Invalid duration format when converting duration to timestamp');
};

export const isValidPIN = async (PIN: string, userPIN: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    bcrypt.compare(PIN, userPIN).then((match: boolean) => {
      if (!match) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

export const removeIdKeys = (obj: any, maxDepth: number = 10, currentDepth: number = 0): any => {
  if (typeof obj !== 'object' || obj === null || currentDepth >= maxDepth) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeIdKeys(item, maxDepth, currentDepth + 1));
  }

  const newObj: any = {};
  for (const key in obj) {
    if (key !== '_id') {
      newObj[key] = removeIdKeys(obj[key], maxDepth, currentDepth + 1);
    }
  }

  return newObj;
};

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const calculateDeliveryCharges = function (
  lat1: string,
  lon1: string,
  lat2: string,
  lon2: string,
  base: number,
  perKm: number,
): {
  distance: number;
  charge: number;
  tax: number;
} {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(parseFloat(lat2) - parseFloat(lat1));
  const dLon = degreesToRadians(parseFloat(lon2) - parseFloat(lon1));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(parseFloat(lat1))) *
      Math.cos(degreesToRadians(parseFloat(lat2))) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const charge = base + parseFloat((earthRadiusKm * c).toFixed(0)) * 3.5 * perKm;

  return {
    distance: parseFloat((earthRadiusKm * c).toFixed(0)) * 3.5,
    charge: charge,
    tax: charge * 0.1,
  };
};

export const formatedDate = (data: number | string): string => {
  const currentDate = new Date(data);
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type Category =
  | 'Express Delivery'
  | 'Standard Delivery'
  | 'Immediate Delivery'
  | 'Same Day Delivery'
  | 'Next Day Delivery';

export const categoryCalculation = (category?: Category) => {
  let multiplier = 0;
  category === 'Express Delivery'
    ? (multiplier = 0.15)
    : // : category === "Standard Delivery" ? multiplier = 0.2
    category === 'Immediate Delivery'
    ? (multiplier = 0.1)
    : category === 'Same Day Delivery'
    ? (multiplier = 0.05)
    : category === 'Next Day Delivery'
    ? (multiplier = 0.025)
    : multiplier === 0;
  return multiplier;
};

export const calculateDuration = (category?: Category) => {
  let duration = 'PT60M';
  category === 'Express Delivery'
    ? (duration = 'P4D')
    : // : category === "Standard Delivery" ? duration = 0.2
    category === 'Immediate Delivery'
    ? (duration = 'PT60M')
    : category === 'Same Day Delivery'
    ? (duration = 'P1D')
    : category === 'Next Day Delivery'
    ? (duration = 'P1D')
    : category === 'Standard Delivery'
    ? (duration = 'P4D')
    : duration === 'P1D';
  return duration;
};

export const checkMoterableDistance = async (startGPS: string[], endGPS: string[]): Promise<number | undefined> => {
  const origin = `${startGPS[1]},${startGPS[0]}`.trim();
  const destination = `${endGPS[1]},${endGPS[0]}`.trim();
  const apiKey = 'da7f51936d8686be261a47e7e3efcb74';
  const resource = 'distance_matrix';

  const apiUrl = `https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/${resource}/driving/${origin};${destination}`;
  try {
    // Make the HTTP GET request
    const response = await axios.get(apiUrl);
    const distanceInMeters = response.data.results.distances[0][1];
    // // Convert meters to kilometers (or other units if needed)
    const distanceInKilometers = distanceInMeters / 1000;

    return distanceInKilometers;
  } catch (error) {
    console.log({ error });
    return 45;
  }
};

const getCategoryTimestamp = function (type?: string) {
  if (type === 'P2H2P') {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 4);
    return futureDate;
  } else {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate());
    return futureDate;
  }
};

export const getSearchResponse = async (
  startGPS: string[],
  endGPS: string[],
  agent: any,
  weight: any,
  dimentions: any,
  category: Category,
  fulfillmentType?: string,
  type?: string,
  // destinationHub?: any,
) => {
  let total_charge = null;
  let distance = null;
  let weightPrice = null;
  let taxPrice = null;
  let rtoCharge = null;
  agent;
  // check for p2h2p and p2p
  if (type === 'P2H2P') {
    const p2h2pDistance = await checkMoterableDistance(startGPS, endGPS);
    const { charge, tax, package_price } = await p2h2pPricing(category, dimentions, weight);
    // weightPrice = weightPriceCalculation(dimentions, weight);
    // const categoryMultiplier = categoryCalculation(category);
    total_charge = package_price + charge;
    distance = p2h2pDistance;
    taxPrice = tax;
  } else {
    const checkDistanceFromPickupToDrop: any = await checkMoterableDistance(startGPS, endGPS);
    const { charge, tax } = await p2pPricing(checkDistanceFromPickupToDrop);
    taxPrice = tax;
    distance = checkDistanceFromPickupToDrop.toFixed(2);
    total_charge = charge;
  }

  rtoCharge = ((total_charge + taxPrice) * 30) / 100;
  const rtoTax = ((rtoCharge * 10) / 100).toFixed(2);
  // console.log({ charge, tax, distance });
  const delivery_id = uuid();
  const RTO_id = uuid();

  const duration = calculateDuration(category);
  const mainId = category === 'Express Delivery' ? 'Express' : 'Standard';
  const getPlusOneTime = (day: number) => {
    const originalDate = new Date();
    const daysInMillis = day * 24 * 60 * 60 * 1000; // One day in milliseconds
    const newDateInMillis = originalDate.getTime() + daysInMillis;
    const newDate = new Date(newDateInMillis);
    return newDate.toISOString();
  };

  const getPlusOneTime2 = (duration: string) => {
    const originalDate = new Date();

    console.log(originalDate);

    const daysMatch = duration.match(/P(\d+)D/);
    const hoursMatch = duration.match(/T(\d+)H/);
    const minutesMatch = duration.match(/T(\d+)M/);
    const secondsMatch = duration.match(/T(\d+)S/);

    let days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0;

    if (daysMatch) {
      days = parseInt(daysMatch[1], 10);
    }
    if (hoursMatch) {
      hours = parseInt(hoursMatch[1], 10);
    }
    if (minutesMatch) {
      minutes = parseInt(minutesMatch[1], 10);
    }
    if (secondsMatch) {
      seconds = parseInt(secondsMatch[1], 10);
    }

    originalDate.setDate(originalDate.getDate() + days);
    originalDate.setHours(originalDate.getHours() + hours);
    originalDate.setMinutes(originalDate.getMinutes() + minutes);
    originalDate.setSeconds(originalDate.getSeconds() + seconds);

    return originalDate.toISOString();
  };

  const calcDeliveryTimestamp = () => {
    if (type === 'P2H2P') {
      return formatedDate(getCategoryTimestamp(type).toISOString());
    }

    return formatedDate(getPlusOneTime2(duration));
  };

  const totaleliveryDays = type === 'P2H2P' ? 4 : 1;
  // const rtoDays = type === 'P2H2P' ? 6 : 1;
  const responseData: any = {
    categories: [
      {
        id: category,
        time: {
          //category level TAT for S2D (ship-to-delivery), can be overridden by item-level TAT whenever there are multiple options for the same category (e.g. 30 min, 45 min, 60 min, etc.);
          label: 'TAT',
          duration: duration,
          timestamp: calcDeliveryTimestamp(),
        },
      },
    ],
    fulfillments: [
      {
        id: delivery_id,
        type: fulfillmentType,
        start: {
          time: {
            // average time to pickup (ISO8601 Duration);
            duration:
              type === 'P2H2P'
                ? 'P1D'
                : category === 'Immediate Delivery'
                ? 'PT15M'
                : category === 'Same Day Delivery'
                ? 'PT2H'
                : 'P1D',
          },
        },
        tags: [
          {
            code: 'distance',
            list: [
              {
                code: 'motorable_distance_type',
                value: 'kilometer', //enum - "mile", "kilometer", "meter";
              },
              {
                code: 'motorable_distance',
                value: `${distance}`,
              },
            ],
          },
        ],
      },
      {
        id: RTO_id,
        type: 'RTO',
      },
    ],
    items: [
      {
        id: mainId,
        parent_item_id: '',
        category_id: category,
        fulfillment_id: delivery_id,
        descriptor: {
          code: type === 'P2H2P' ? type : 'P2P',
          name: category,
          long_desc: `Upto ${category === 'Immediate Delivery' ? '60 mins' : totaleliveryDays + ' day'} for Delivery`,
          short_desc: `Upto ${category === 'Immediate Delivery' ? '60 mins' : totaleliveryDays + ' day'} for Delivery`,
        },
        price: {
          currency: 'INR',
          value: `${(total_charge + taxPrice).toFixed(2)}`,
        },
        time: {
          label: 'TAT',
          duration: duration,
          timestamp:
            category === 'Express Delivery'
              ? formatedDate(getPlusOneTime(totaleliveryDays))
              : category === 'Next Day Delivery'
              ? formatedDate(getPlusOneTime(totaleliveryDays))
              : formatedDate(new Date().toISOString()),
        },
      },
      {
        id: 'rto',
        parent_item_id: mainId,
        category_id: category,
        fulfillment_id: RTO_id,
        descriptor: {
          code: type === 'P2H2P' ? type : 'P2P',
          name: 'RTO quote',
          short_desc: 'RTO quote',
          long_desc: 'RTO quote',
        },
        price: {
          currency: 'INR',
          value: `${parseFloat(rtoCharge + rtoTax).toFixed(2)}`,
        },
        time: {
          label: 'TAT',
          duration: duration,
          timestamp: calcDeliveryTimestamp(),
        },
      },
    ],
  };
  if (type === 'P2H2P') {
    delete responseData.fulfillments[0].tags;
  }
  return { delivery_id, RTO_id, total_charge, weightPrice, taxPrice, responseData };
};

export const processOrders = (inputOrders: []) => {
  let orders: any = [...inputOrders];
  let foundOrderPickedUp = false;
  let foundOrderDelivered = false;
  let foundOutForDelivery = false;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    if (order.status === 'Order-picked-up' && !foundOrderPickedUp) {
      foundOrderPickedUp = true;
    } else if (foundOrderPickedUp) {
      if (!foundOutForDelivery && order.status === 'Out-for-delivery') {
        orders.splice(i, 1);
        foundOutForDelivery = true;
        i--;
      } else if (order.status === 'Order-delivered' && !foundOrderDelivered) {
        orders[i].status = 'In-transit';
        foundOrderDelivered = true;
      } else if (
        order.status === 'Order-confirmed' ||
        order.status === 'Agent-assigned' ||
        order.status === 'Out-for-pickup' ||
        order.status === 'Order-picked-up'
      ) {
        orders.splice(i, 1);
        i--;
      }
    }
  }

  return orders;
};

export function areObjectsEqual(obj1: any, obj2: any) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!areObjectsEqual(val1, val2)) {
        return false;
      }
    } else {
      if (val1 !== val2) {
        return false;
      }
    }
  }

  return true;
}

export const startProcessingAtGivenTime = (dateString: string, after: number) => {
  const dateObj = new Date(dateString);

  // Add 5 minutes to the Date object
  dateObj.setTime(dateObj.getTime() + after * 60000); // 5 minutes = 5 * 60 seconds * 1000 milliseconds

  // Convert the new Date object back to the ISO 8601 format
  const newDateString = dateObj.toISOString();

  return newDateString;
};

interface PayloadComparisonResult {
  errors: { [key: string]: string }[];
}

export const comparePayload = (sourcePayload: any, targetPayload: any, result: PayloadComparisonResult = { errors: [] }): PayloadComparisonResult => {
  const keys = Array.isArray(sourcePayload) ? sourcePayload : Object.keys(sourcePayload);

  if (Array.isArray(targetPayload) && !targetPayload?.length) {
    return result;
  }

  keys.forEach((key, i) => {
    if (Array.isArray(sourcePayload[key]) && Array.isArray(targetPayload[key])) {
      result = { ...result, ...comparePayload(sourcePayload[key], targetPayload[key], result) };
    } else if (typeof key === 'object') {
      result = { ...result, ...comparePayload(key, targetPayload[i], result) };
    } else if (typeof sourcePayload[key] === 'object' && typeof targetPayload[key] === 'object') {
      result = { ...result, ...comparePayload(sourcePayload[key], targetPayload[key], result) };
    } else if (Array.isArray(sourcePayload[key]) && targetPayload[key] === undefined) {
      result.errors.push({
        [key]: `Key is missing in the request payload`,
      });
    } else if (typeof sourcePayload[key] === 'object' && targetPayload[key] === undefined) {
      result.errors.push({
        [key]: `Key is missing in the request payload`,
      });
    } else if (sourcePayload[key] && targetPayload[key] === undefined) {
      result.errors.push({
        [key]: `Key is missing in the request payload`,
      });
    } else if (sourcePayload[key] !== targetPayload[key]) {
      result.errors.push({
        [key]: `Value doesn't match. Stored value: ${sourcePayload[key]} and request value: ${targetPayload[key]}`,
      });
    }
  });

  return result;
};

