import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: 'Task',
    },
    typeId: {
      type: String,
      ref: 'Task',
    },
    status: {
      type: String,
    },
    userId: {
      type: String,
      ref: 'Agent',
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

const Notifications = mongoose.model('Notifications', notificationSchema);
export default Notifications;
