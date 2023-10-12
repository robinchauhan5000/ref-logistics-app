import mongoose from 'mongoose';

const taskStatusSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      ref: 'Task',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Searching-for-Agent',
        "Order-confirmed",
        'Agent-assigned',

        'Order-picked-up',
        'Out-for-delivery',
        'Order-delivered',
        'RTO-Initiated',
        'RTO-Delivered',
        'RTO-Disposed',
        'Cancelled',
        'Customer-not-found',
        "Out-for-pickup",
        "Pickup-failed",
        "Pickup-rescheduled",
        "Order-picked-up",
        "In-transit",
        "At-destination-hub",
        "Delivery-failed",
        "Delivery-rescheduled"

      ],
      required: true,
    },
    link: {
      type: String,
    },
    description: {
      type: String,
    },
    agentId: {
      type: String,
      ref: 'Agent',
    }
  },
  {
    strict: true,
    timestamps: true,
  },
);
// taskStatusSchema.index({ taskId: 1, status: 1 , agentId: 1}, { unique: true });
const TaskStatus = mongoose.model('TaskStatus', taskStatusSchema);
export default TaskStatus;
