export type Gender = 'male' | 'female' | 'other';

export interface IUser {
  name: string;
  age: number;
  gender: Gender;
}
export interface IPricingRange {
  lesEq_1: number;
  lesEq_3: number;
  lesEq_5: number;
  lesEq_7: number;
  lesEq_10: number;
  gtr_10: number;
}

export interface IDeliveryType {
  express_delivery: IPricingRange;
  same_day_delivery: IPricingRange;
  next_day_delivery: IPricingRange;
}

interface IHyperLocal {
  basePrice: number;
  additional_charges: number;
  cgst_sgst: number;
}

interface IinterCity {
  delivery_type: IDeliveryType;
  packing_charges: number;
  rto_charges: number;
  reverse_qc_charges: number;
  igst: number;
}

export interface IpricingCalculation {
  hyper_local?: IHyperLocal;
  inter_city?: IinterCity;
}
