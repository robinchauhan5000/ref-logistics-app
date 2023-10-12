import * as geolib from 'geolib';

const getDistance2 = async (coords1: string[], coords2: string[]) => {
  const start = {
    lng: coords1[0],
    lat: coords1[1],
  };

  const end = {
    lng: coords2[0],
    lat: coords2[1],
  };

  const distanceInMeters = geolib.getDistance(start, end);

  const distanceInKilometers = geolib.convertDistance(distanceInMeters, 'km');

  console.log({ distanceInKilometers });
  return distanceInKilometers;
};
export default getDistance2