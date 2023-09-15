import mongoose from 'mongoose';

const issueStatusSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      ref: 'issue',
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Resolved', 'Closed'],
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

const issueStatus = mongoose.model('IssueStatus', issueStatusSchema);
export default issueStatus;
