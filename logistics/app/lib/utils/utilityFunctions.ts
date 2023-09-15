import bcrypt from 'bcryptjs';
import { uuid } from 'uuidv4';

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

export const formatedDate = (data: string): string => {
  const currentDate = new Date(data);
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getSearchResponse = (_startGPS: string[], _endGPS: string[], _agent: any) => {
  // const { charge, tax, distance } = calculateDeliveryCharges(
  //   startGPS[0],
  //   startGPS[1],
  //   endGPS[0],
  //   endGPS[1],
  //   agent.basePrice,
  //   agent.pricePerkilometer,
  // );
  // console.log({ charge, tax, distance });
  const delivery_id = uuid();
  const RTO_id = uuid();
  // const data = {
  //   fulfillments: [
  //     {
  //       id: delivery_id,
  //       type: 'Delivery',
  //       start: {
  //         time: {
  //           // average time to pickup (ISO8601 Duration);
  //           duration: 'PT15M',
  //         },
  //       },
  //       tags: [
  //         {
  //           code: 'distance',
  //           list: [
  //             {
  //               code: 'motorable_distance_type',
  //               value: 'kilometer', //enum - "mile", "kilometer", "meter";
  //             },
  //             {
  //               code: 'motorable_distance',
  //               value: `${distance}`,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       id: RTO_id,
  //       type: 'RTO',
  //     },
  //   ],
  //   items: [
  //     {
  //       id: 'express',
  //       parent_item_id: '',
  //       category_id: 'Immediate Delivery',
  //       fulfillment_id: delivery_id,
  //       descriptor: {
  //         code: 'P2P',
  //         name: 'Immediate Delivery',
  //         long_desc: 'Upto 60 mins for Delivery',
  //         short_desc: 'Upto 60 mins for Delivery',
  //       },
  //       price: {
  //         currency: 'INR',
  //         value: `${(charge + tax).toFixed(2)}`,
  //       },
  //       time: {
  //         label: 'TAT',
  //         duration: 'PT60M',
  //         timestamp: formatedDate(new Date().toISOString()),
  //       },
  //     },
  //     {
  //       id: 'rto',
  //       parent_item_id: 'I1',
  //       category_id: 'Immediate Delivery',
  //       fulfillment_id: RTO_id,
  //       descriptor: {
  //         code: 'P2P',
  //         name: 'RTO quote',
  //         short_desc: 'RTO quote',
  //         long_desc: 'RTO quote',
  //       },
  //       price: {
  //         currency: 'INR',
  //         value: `${(((charge + tax) * 30) / 100).toFixed(2)}`,
  //       },
  //       time: {
  //         label: 'TAT',
  //         duration: 'PT60M',
  //         timestamp: formatedDate(new Date().toISOString()),
  //       },
  //     },
  //   ],
  // };
  return { delivery_id, RTO_id };
};
