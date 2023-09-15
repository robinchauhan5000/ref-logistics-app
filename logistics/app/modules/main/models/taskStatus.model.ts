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
        'Agent-assigned',
        'Order-picked-up',
        'Out-for-delivery',
        'Order-delivered',
        'RTO-Initiated',
        'RTO-Delivered',
        'RTO-Disposed',
        'Cancelled',
        'Customer-not-found',
      ],
      required: true,
    },
    link: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);
taskStatusSchema.index({ taskId: 1, status: 1 }, { unique: true });
const TaskStatus = mongoose.model('TaskStatus', taskStatusSchema);
export default TaskStatus;
