import mongoose from 'mongoose';
import { uuid } from 'uuidv4';

const KYCSchema = new mongoose.Schema({
  PANdetails: { type: String },
  addressProof: { type: String },
  IDproof: { type: String },
  PANcard: { type: String },
  aadhaarNumber: { type: String },
  drivingLicense: { type: String },
});

const BankDetailSchema = new mongoose.Schema({
  accountHolderName: { type: String },
  accountNumber: { type: String },
  bankName: { type: String },
  branchName: { type: String },
  IFSCcode: { type: String },
  cancelledCheque: { type: String },
});

const AddressDetailsSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  pincode: {
    type: String,
  },
  building: { type: String },
  locality: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
});

const WeightCapacitySchema = new mongoose.Schema({
  weight: { type: Number },
  unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
});

const vehicleDetailsSchema = new mongoose.Schema({
  vehicleNumber: { type: String },
  brandName: { type: String },
  ownerType: { type: String },
  makeYear: { type: String },
  intercity: { type: String },
  vehicleRegistrationDocument: { type: String },
  maxWeightCapacity: {
    type: WeightCapacitySchema,
  },
});

// const locationdata = new mongoose.Schema({
//   coordinates: {
//     type: [Number],
//     required: true,
//   },
//   updatedon: {
//     type: Date,
//   },
//   isOnline: { type: Boolean, default: false },
// });

const agentSchema = new mongoose.Schema(
  {
    //Users who has login ability should go under User schema
    _id: {
      type: String,
      required: true,
      default: () => uuid(),
    },
    userId: {
      type: String,
      ref: 'User',
    },
    addedBy: { type: String, ref: 'User' },
    firstName: { type: String },
    lastName: { type: String },
    dob: { type: String },
    deliveryExperience: { type: Number },
    KYCDetails: { type: KYCSchema },
    bankDetails: { type: BankDetailSchema },
    addressDetails: { type: AddressDetailsSchema },
    isDetailsUpdated: { type: Boolean, default: false },
    vehicleDetails: { type: vehicleDetailsSchema },
    emailNotification: { type: Boolean, default: false },
    whatsAppNotification: { type: Boolean, default: false },
    // locationdata: { type: locationdata },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        // required: true,
      },
      updatedAt: {type: "String", default: null}
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    deliveryType: {
      type: [String],
      enum: ['Express Delivery', 'Standard Delivery', 'Immediate Delivery', 'Same Day Delivery', 'Next Day Delivery'],
    },
    // holidays: [{ type: String }],
    offlineTime: { type: String, dafault: '' },
    basePrice: { type: Number, defalut: 25 },
    pricePerkilometer: { type: Number, defalut: 8 },
  },
  {
    strict: true,
    timestamps: true,
  },
);

agentSchema.index({ userId: 1 }, { unique: true });
agentSchema.index({ currentLocation: '2dsphere' });

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
