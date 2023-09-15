import mongoose from 'mongoose';

const searchResponseDump = new mongoose.Schema(
  {
    delivery: {
      type: String,
    },
    rto: {
      type: String,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

const searchDump = mongoose.model('SearchResponseDump', searchResponseDump);
export default searchDump;
