import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  tax: Number,
  charge: Number,
  weightPrice: Number,
  totalCharge: Number,
});

const orderSchema = new mongoose.Schema({
  weight: {
    unit: { type: String},
    value: { type: Number}
  },
  dimensions: {
    length: {
      unit: { type: String},
      value: { type: Number}
    },
    breadth: {
      unit: { type: String},
      value: { type: Number}
    },
    height: {
      unit: { type: String},
      value: { type: Number}
    }
  }
});

const searchResponseDump = new mongoose.Schema(
  {
    delivery: {
      type: String,
    },
    rto: {
      type: String,
    },
    order: {
      type: orderSchema
    },
    charge: {
      type: chargeSchema,
    },
    type: { type: String },
    locations: {
      sourceHub: {},
      destinationHub: {},
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

const searchDump = mongoose.model('SearchResponseDump', searchResponseDump);
export default searchDump;
