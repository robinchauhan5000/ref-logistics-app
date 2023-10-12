import mongoose, { Schema, Document } from 'mongoose';

// Define the Location subdocument schema
interface ILocation {
  coordinates: [number, number];
}

const LocationSchema = new Schema<ILocation>({
  coordinates: [Number, Number],
});

// Define the AddressDetails subdocument schema
interface IAddressDetails extends Document {
  location: ILocation;
  building: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  pincode: string;
}

const AddressDetailsSchema = new Schema<IAddressDetails>({
  location: LocationSchema,
  building: String,
  city: String,
  state: String,
  country: String,
  locality: String,
  pincode: String,
});

// Define the City schema
interface IHubs extends Document {
  name: string;
  addressDetails: IAddressDetails;
  status: string;
  serviceablePincode: number[];
}

const HubsSchema = new Schema<IHubs>({
  name: { type: String, unique: true },
  addressDetails: AddressDetailsSchema,
  status: { type: String },
  serviceablePincode: [{ type: Number }],
});

// Create and export the City model
const Hub = mongoose.model<IHubs>('Hub', HubsSchema);
export default Hub;
