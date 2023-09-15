import mongoose from 'mongoose';
import { uuid } from 'uuidv4';

// start: fulfillment schema
const addressSchema = new mongoose.Schema({
  name: { type: String },
  building: { type: String },
  locality: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  area_code: { type: String },
});
const dimensionSchema = new mongoose.Schema({
  length: {
    unit: {
      type: String,
    },
    value: {
      type: Number,
    },
  },
  breadth: {
    unit: {
      type: String,
    },
    value: {
      type: Number,
    },
  },
  height: {
    unit: {
      type: String,
    },
    value: {
      type: Number,
    },
  },
});
const tagSchema = new mongoose.Schema({
  code: { type: String },
  list: [
    {
      code: { type: String },
      value: { type: String },
    },
  ],
});

const address = new mongoose.Schema({
  time: {
    duration: { type: String },
    range: {
      start: { type: String },
      end: { type: String },
    },
    timestamp: { type: String },
  },
  person: {
    name: {
      type: String,
    },
  },
  location: {
    gps: {
      type: String,
    },
    address: { type: addressSchema },
  },
  contact: {
    phone: { type: String },
    email: { type: String },
  },
  instructions: {
    code: { type: String },
    short_desc: { type: String },
  },
});
const fulfillmentSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  '@ondc/org/awb_no': { type: String },
  type: {
    type: String,
  },
  awb_no: {
    type: String,
  },
  start: {
    type: address,
  },
  end: {
    type: address,
  },
  tags: [{ type: tagSchema }],
  agent: { name: { type: String }, mobile: { type: String } },
  vehicle: { registration: { type: String } },
  tracking: { type: Boolean },
  state: {
    descriptor: {
      code: {
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
      },
    },
  },
});

const breakupSchema = new mongoose.Schema({
  '@ondc/org/item_id': { type: String },
  '@ondc/org/title_type': { type: String },
  price: {
    currency: { type: String },
    value: { type: String },
  },
});

const settlementDetailsSchema = new mongoose.Schema({
  settlement_counterparty: { type: String },
  settlement_type: { type: String },
  beneficiary_name: { type: String },
  upi_address: { type: String },
  settlement_bank_account_no: { type: String },
  settlement_ifsc_code: { type: String },
});

const scheduleSchema = new mongoose.Schema({
  holidays: [
    {
      type: String,
    },
  ],
});

const timeSchema = new mongoose.Schema({
  days: { type: String },
  duration: { type: String },
  schedule: { type: scheduleSchema },
  range: {
    end: { type: String },
    start: { type: String },
  },
});
const itemSchema = new mongoose.Schema({
  category_id: { type: String }, // grocery
  descriptor: { name: { type: String } },
  quantity: {
    count: {
      type: Number,
    },
    measure: {
      value: { type: Number },
      unit: { type: String },
    },
  },
  price: {
    currency: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  dangerous_goods: {
    type: Boolean,
  },
});

// end: product schema

const newItemSchema = new mongoose.Schema({
  id: { type: String },
  fulfillment_id: {
    type: String,
  },
  descriptor: { code: { type: String } },
  quantity: { count: { type: Number } },
  category_id: { type: String },
  time: {
    label: {
      type: String,
    },
    duration: {
      type: String,
    },
    timestamp: {
      type: String,
    },
  },
});

const cancellationTermSchema = new mongoose.Schema({
  fulfillment_state: {
    descriptor: {
      code: { type: String },
      short_desc: { type: String },
    },
  },
  refund_eligible: { type: Boolean },
  reason_required: { type: Boolean },
  cancellation_fee: {
    amount: {
      currency: { type: String },
      value: { type: String },
    },
  },
});

const taskSchema = new mongoose.Schema(
  {
    task_id: {
      type: String,
      required: true,
      default: () => uuid(),
    },
    assignee: {
      type: String,
      ref: 'Agent',
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
      default: 'Pending',
    },
    transaction_id: {
      type: String,
    },
    bap_id: {
      type: String,
    },
    is_confirmed: {
      type: Boolean,
      default: false,
    },
    category: {
      id: { type: String },
    },
    fulfillments: [{ type: fulfillmentSchema }],
    quote: {
      price: { currency: { type: String }, value: { type: String } },
      breakup: [{ type: breakupSchema }],
    },
    payment: {
      type: { type: String },
      collected_by: { type: String },
      '@ondc/org/collection_amount': { type: String },
      '@ondc/org/settlement_details': [{ type: settlementDetailsSchema }],
      status: { type: String },
      time: {
        timestamp: { type: String },
      },
    },
    billing: {
      name: { type: String },
      address: { type: addressSchema },
      email: { type: String },
      phone: { type: String },
      tax_number: { type: String },
      created_at: { type: String },
      updated_at: { type: String },
    },
    items: [{ type: newItemSchema }],
    linked_order: {
      items: [{ type: itemSchema }],
      provider: {
        time: { type: timeSchema },
        descriptor: {
          name: { type: String },
        },
        address: { type: addressSchema },
      },
      order: {
        id: { type: String },
        weight: {
          unit: { type: String },
          value: { type: Number },
        },
        dimensions: {
          type: dimensionSchema,
        },
      },
    },
    tags: [{ type: tagSchema }],
    assignedBy: {
      type: String,
      ref: 'User',
    },
    agentOfflineTime: {
      type: String,
    },
    trackingUrl: { type: String, default: '' },
    orderConfirmedAt: { type: String },
    orderPickedUpTime: { type: String },
    cancellationReasonId: { type: String },
    cancellationAmount: { type: Number, default: 0 },
    deliveryAttemptCount: {
      type: Number,
      default: 0,
    },
    orderCancelledBy: { type: String },
    context: { type: String },
    order_id: { type: String },
    cancellation_terms: [
      {
        type: cancellationTermSchema,
      },
    ],
    provider: {
      id: { type: String },
    },
    provider_location: {
      id: { type: String },
    },
    isWeightDiff: {
      type: Boolean,
      default: false,
    },
    WeightDiff: [],
    trackStatus: { type: String, default: 'inactive' },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
