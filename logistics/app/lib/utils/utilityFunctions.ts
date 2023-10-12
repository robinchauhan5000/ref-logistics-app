import bcrypt from 'bcryptjs';
import { uuid } from 'uuidv4';
import weightPriceCalculation from './priceCalculation';
import axios from 'axios';

export const encryptPIN = (PIN: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    bcrypt.hash(PIN, 10, (err: Error | null, hash: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
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

// export const removeIdKeys = (obj: any): any => {
//   if (typeof obj !== 'object' || obj === null) {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map((item) => removeIdKeys(item));
//   }

//   const newObj: any = {};
//   for (const key in obj) {
//     if (key !== '_id') {
//       newObj[key] = removeIdKeys(obj[key]);
//     }
//   }

//   return newObj;
// };

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

const calculateDeliveryChargesWithDistance = function (distance: number, base: number, perKm: number) {
  let charge = distance - 2 > 0 ? (distance - 2) * perKm + base : base;

  return {
    charge,
    tax: charge * 0.1,
  };
};

export const formatedDate = (data: string): string => {
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
    console.log({ distanceInMeters });
    // // Convert meters to kilometers (or other units if needed)
    const distanceInKilometers = distanceInMeters / 1000;

    return distanceInKilometers;
  } catch (error) {
    console.log({ error });
    return 0;
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
    futureDate.setDate(currentDate.getDate() + 1);
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
  // check for p2h2p and p2p
  if (type === 'P2H2P') {
    const p2h2pDistance = await checkMoterableDistance(startGPS, endGPS);
    weightPrice = weightPriceCalculation(dimentions, weight);
    const categoryMultiplier = categoryCalculation(category);
    total_charge = 150 + weightPrice * (1 + categoryMultiplier);
    distance = p2h2pDistance?.toFixed(2);
    rtoCharge = ((total_charge * 30) / 100).toFixed(2);
    taxPrice = (total_charge * 10) / 100;
  } else {
    const checkDistanceFromPickupToDrop: any = await checkMoterableDistance(startGPS, endGPS);
    // weightPrice = weightPriceCalculation(dimentions, weight);
    const categoryMultiplier = categoryCalculation(category);
    const { charge, tax } = calculateDeliveryChargesWithDistance(
      checkDistanceFromPickupToDrop,
      agent.basePrice,
      agent.pricePerkilometer,
    );
    taxPrice = tax;
    distance = checkDistanceFromPickupToDrop.toFixed(2);
    total_charge = (charge + tax) * (1 + categoryMultiplier);
    rtoCharge = ((total_charge * 30) / 100).toFixed(2);
  }

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
  const totaleliveryDays = category === 'Express Delivery' ? 4 : 1;
  const rtoDays = type === "P2H2P" ? 6 : 1
  const responseData: any = {
    categories: [
      {
        id: category,
        time: {
          //category level TAT for S2D (ship-to-delivery), can be overridden by item-level TAT whenever there are multiple options for the same category (e.g. 30 min, 45 min, 60 min, etc.);
          label: 'TAT',
          duration: duration,
          timestamp: formatedDate(getCategoryTimestamp(type).toISOString()),
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
            duration: type === 'P2H2P' ? 'P1D' : category === "Immediate Delivery" ? "PT15M" : category === "Same Day Delivery" ? "PT2H" : "P1D",
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
          value: `${rtoCharge}`,
        },
        time: {
          label: 'TAT',
          duration: `P${rtoDays}D`,
          timestamp: formatedDate(getPlusOneTime(rtoDays)),
        },
      },
    ],
  };
  if (type === "P2H2P") {
    delete responseData.fulfillments[0].tags
  }
  return { delivery_id, RTO_id, total_charge, weightPrice, taxPrice, responseData };
};

export const processOrders = (inputOrders: []) => {
  let orders: any = [...inputOrders]; // Clone the input array to avoid modifying it directly
  let foundOrderPickedUp = false;
  let foundOrderDelivered = false;
  let foundOutForDelivery = false;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    if (order.status === 'Order-picked-up' && !foundOrderPickedUp) {
      foundOrderPickedUp = true;
    } else if (foundOrderPickedUp) {
      if (!foundOutForDelivery && order.status === 'Out-for-delivery') {
        // Delete the first "Out-for-delivery" object
        orders.splice(i, 1);
        foundOutForDelivery = true;
        i--; // Adjust the index because an element was removed
      } else if (order.status === 'Order-delivered' && !foundOrderDelivered) {
        // Change the status of the next "Order-delivered" object to "In-transit"
        orders[i].status = 'In-transit';
        foundOrderDelivered = true;
      } else if (
        order.status === 'Order-confirmed' ||
        order.status === 'Agent-assigned' ||
        order.status === 'Out-for-pickup' ||
        order.status === 'Order-picked-up'
      ) {
        // Remove objects with specific statuses
        orders.splice(i, 1);
        i--; // Adjust the index because an element was removed
      }
    }
  }

  return orders;
};
