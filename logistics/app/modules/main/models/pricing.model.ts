import { IpricingCalculation } from '.././../../interfaces/test';
import mongoose from 'mongoose';
import { uuid } from 'uuidv4';

const PricingRange = new mongoose.Schema({
  lesEq_1: { type: Number, unique: true },
  lesEq_3: { type: Number, unique: true },
  lesEq_5: { type: Number, unique: true },
  lesEq_7: { type: Number, unique: true },
  lesEq_10: { type: Number, unique: true },
  gtr_10: { type: Number, unique: true },
});

const DeliveryType = new mongoose.Schema({
  express_delivery: { type: PricingRange, unique: true },
  same_day_delivery: { type: PricingRange, unique: true },
  next_day_delivery: { type: PricingRange, unique: true },
});

const PricingCalculationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      isRequired: true,
      default: () => uuid(),
    },
    hyper_local: {
      basePrice: { type: Number, unique: true },
      additional_charges: { type: Number, unique: true },
      cgst_sgst: { type: Number, unique: true },
    },
    inter_city: {
      delivery_type: { type: DeliveryType },
      packing_charges: { type: Number, unique: true },
      rto_charges: { type: Number, unique: true },
      reverse_qc_charges: { type: Number, unique: true },
      igst: { type: Number, unique: true },
    },
  },
  { timestamps: true },
);
PricingCalculationSchema.pre('save', function (next) {
  // Custom validation logic
  if (this.isNew) {
    if (!this.hyper_local || !this.inter_city) {
      return next(new Error('hyper_local and inter_city are required.'));
    }
  } else {
    if (
      this.hyper_local &&
      !this.hyper_local.basePrice &&
      !this.hyper_local.additional_charges &&
      !this.hyper_local.cgst_sgst
    ) {
      return next(new Error('hyper_local field are requred .'));
    } else if (
      this.inter_city &&
      (!this.inter_city.delivery_type ||
        !this.inter_city.igst ||
        !this.inter_city.packing_charges ||
        !this.inter_city.reverse_qc_charges ||
        !this.inter_city.rto_charges)
    ) {
      return next(new Error('inter_city must have all the fields'));
    }
    // Additional custom validation checks for existing documents can be added here
  }

  // If custom validation passes, call next() to continue with the standard validation process
  next();
});
export interface PriceCalcDocument extends IpricingCalculation, mongoose.Document {}
const PriceCalc = mongoose.model<IpricingCalculation>('Pricing', PricingCalculationSchema);
export default PriceCalc;
