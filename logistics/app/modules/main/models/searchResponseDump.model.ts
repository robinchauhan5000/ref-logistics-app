import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  tax: Number,
  charge: Number,
  weightPrice: Number,
  totalCharge: Number,
});

const orderSchema = new mongoose.Schema({
  weight: {
    unit: { type: String },
    value: { type: Number },
  },
  dimensions: {
    length: {
      unit: { type: String },
      value: { type: Number },
    },
    breadth: {
      unit: { type: String },
      value: { type: Number },
    },
    height: {
      unit: { type: String },
      value: { type: Number },
    },
  },
});

const fulfillments = new mongoose.Schema({
  "type": String,
  start: {
    location: {
      gps: String,
      address: {
        area_code: String
      }
    },
    authorization: {
      type: String
    }
  },
  end: {
    location: {
      gps: String,
      address: {
        area_code: String
      }
    },
    authorization: {
      type: String
    }
  }
})

const searchResponseDump = new mongoose.Schema(
  {
    transaction_id:{
      type: String
    },
    delivery: {
      type: String,
    },
    rto: {
      type: String,
    },
    order: {
      type: orderSchema,
    },
    charge: {
      type: chargeSchema,
    },
    fulfillments: [{ type: fulfillments }],
    payment: {
      "type": {
        type: String
      },
      "@ondc/org/collection_amount": {
        type: String
      }
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
