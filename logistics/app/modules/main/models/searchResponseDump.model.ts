import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  tax: Number,
  charge: Number,
  weightPrice: Number,
  totalCharge: Number,
});

const searchResponseDump = new mongoose.Schema(
  {
    delivery: {
      type: String,
    },
    rto: {
      type: String,
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
