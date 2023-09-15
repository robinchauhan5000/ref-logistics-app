import mongoose from 'mongoose';

enum weightUnitEnums {
  'kilogram',
  'gram',
}
enum weightTypeEnum {
  'dead_weight',
  'volumetric_weight',
}
enum distanceUnitEnum {
  'km',
}

const pricePerDistanceSchema = new mongoose.Schema({
  unit: { type: String, enum: distanceUnitEnum, required: true },
  value: { type: Number, required: true },
});
const pricePerWeigthSchema = new mongoose.Schema({
  unit: { type: String, enum: weightUnitEnums, required: true },
  value: { type: Number, required: true },
  type: { type: String, enum: weightTypeEnum, required: true },
});

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  pricePerDistance: { type: pricePerDistanceSchema, required: true },
  pricePerWeight: { type: pricePerWeigthSchema, required: true },
});
SettingsSchema.index({ userId: 1 }, { unique: true });
const UserSettingsSchema = mongoose.model('settings', SettingsSchema);
export default UserSettingsSchema;
