import LogisticsConstants from '../../config/constant/logisticsConstants';

type Weight = {
  unit: 'kilogram' | 'gram';
  value: number;
};

type Dimension = {
  unit: 'centimeter' | 'meter';
  value: number;
};

type Dimensions = {
  length: Dimension;
  breadth: Dimension;
  height: Dimension;
};

const volumetricWeight = (size?: Dimensions) => {
  console.log({ size });
  if (size) {
    const multiplier = (Object.keys(size) as (keyof typeof size)[]).reduce(
      (acc, key) => (size[key].unit === 'centimeter' ? acc * 1 : acc * 1000),
      1,
    );

    return Math.ceil((size.length.value * size.breadth.value * size.height.value * multiplier) / 5000);
  }
  return 0;
};

const deadWeightCalculation = (weight?: Weight) => {
  console.log({ weight });
  if (weight) {
    const multiplier = weight.unit === 'kilogram' ? 1 : 0.001;

    return Math.ceil(weight.value * multiplier);
  }

  return 0;
};

export const weightPriceCalculation = (size?: Dimensions, weight?: Weight) => {
  console.log("size and weight: ", size, weight)
    if (size && weight) {
        const volWeight = volumetricWeight(size)
        const deadWeight = deadWeightCalculation(weight)
        
        return (volWeight > deadWeight ? volWeight : deadWeight) * LogisticsConstants.PRICE_PER_KILOGRAM;
    }

    if (size) {
      
        return volumetricWeight(size) * LogisticsConstants.PRICE_PER_KILOGRAM;
    }

    if (weight) {
      
        return deadWeightCalculation(weight) * LogisticsConstants.PRICE_PER_KILOGRAM;
    }

  return 0;
};

export default weightPriceCalculation;
