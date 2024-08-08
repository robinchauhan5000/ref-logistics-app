import mongoose, { Schema, Document } from 'mongoose';

interface ComplainantPerson {
  name: string;
}

interface ComplainantContact {
  phone: string;
  email: string;
}

interface ComplainantInfo {
  person: ComplainantPerson;
  contact: ComplainantContact;
}

interface Item {
  id: string;
  quantity: number;
}

interface Fulfillment {
  id: string;
  state: string;
}

interface OrderDetails {
  id: string;
  state: string;
  items: Item[];
  fulfillments: Fulfillment[];
  provider_id: string;
  merchant_order_id?: string;
}

interface AdditionalDescription {
  url: string;
  content_type: string;
}

interface Description {
  short_desc: string;
  long_desc: string;
  additional_desc: AdditionalDescription;
  images: string[];
}

interface UpdatedByOrg {
  name: string;
}

interface UpdatedByContact {
  phone: string;
  email: string;
}

interface UpdatedByPerson {
  name: string;
}

interface ComplainantAction {
  complainant_action: string;
  short_desc: string;
  updated_at: string;
  updated_by: {
    org: UpdatedByOrg;
    contact: UpdatedByContact;
    person: UpdatedByPerson;
  };
}

interface RespondentAction {
  respondent_action: string;
  short_desc: string;
  updated_at: string;
  updated_by: {
    org: UpdatedByOrg;
    contact: UpdatedByContact;
    person: UpdatedByPerson;
  };
  cascaded_level: number;
}

interface IssueActions {
  complainant_actions: ComplainantAction[];
  respondent_actions: RespondentAction[];
}

interface ExpectedResponseTime {
  duration: string;
}

interface ExpectedResolutionTime {
  duration: string;
}

interface Source {
  network_participant_id: string;
  type: string;
}
interface RespondentInfo {
  type: string;
  organization: Organization;
  resolution_support: ResolutionSupport;
}

interface Organization {
  org: OrgDetails;
  contact: Contact;
  person: Person;
}

interface OrgDetails {
  name: string;
}

interface Contact {
  phone: string;
  email: string;
}

interface Person {
  name: string;
}

interface ResolutionSupport {
  chat_link: string;
  contact: Contact;
  gros: Gro[];
}

interface Gro {
  person: Person;
  contact: Contact;
  gro_type: string;
}

interface ResolutionProvider {
  respondent_info: RespondentInfo;
}

interface Resolution {
  short_desc: string;
  long_desc: string;
  action_triggered: string;
  refund_amount?: string;
}
interface Issue extends Document {
  id: string;
  transaction_id: string;
  category: string;
  sub_category: string;
  complainant_info: ComplainantInfo;
  order_details: OrderDetails;
  description: Description;
  source: Source;
  expected_response_time: ExpectedResponseTime;
  expected_resolution_time: ExpectedResolutionTime;
  status: string;
  issue_type: string;
  issue_actions: IssueActions;
  created_at: string;
  updated_at: string;
  resolution_provider: ResolutionProvider;
  resolution: Resolution;
  issueState: string;
  rating: string;
}

const IssueSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    transaction_id: { type: String, required: true },
    category: { type: String, required: true },
    sub_category: { type: String, required: true },
    complainant_info: {
      person: {
        name: { type: String, required: true },
      },
      contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
      },
    },
    order_details: {
      id: { type: String, required: true },
      state: { type: String, required: true },
      items: [
        {
          id: { type: String, required: true },
          quantity: { type: Number, required: true },
        },
      ],
      fulfillments: [
        {
          id: { type: String, required: true },
          state: { type: String, required: true },
        },
      ],
      provider_id: { type: String, required: true },
      merchant_order_id: { type: String, required: false },
    },
    description: {
      short_desc: { type: String},
      long_desc: { type: String },
      additional_desc: {
        url: { type: String,  },
        content_type: { type: String },
      },
      images: [{ type: String, required: true }],
    },
    source: {
      network_participant_id: { type: String, required: true },
      type: { type: String, required: true },
    },
    expected_response_time: {
      duration: { type: String, required: true },
    },
    expected_resolution_time: {
      duration: { type: String, required: true },
    },
    status: { type: String, required: true },
    issue_type: { type: String, required: true },
    resolution: {
      short_desc: String,
      long_desc: String,
      action_triggered: String,
      refund_amount: String,
    },
    issue_actions: {
      complainant_actions: [
        {
          complainant_action: { type: String, required: true },
          short_desc: { type: String, required: true },
          updated_at: { type: String, required: true },
          updated_by: {
            org: {
              name: { type: String, required: true },
            },
            contact: {
              phone: { type: String, required: true },
              email: { type: String, required: true },
            },
            person: {
              name: { type: String, required: true },
            },
          },
        },
      ],
      respondent_actions: [
        {
          respondent_action: { type: String, required: true },
          short_desc: { type: String, required: true },
          updated_at: { type: String, required: true },
          updated_by: {
            org: {
              name: { type: String, required: true },
            },
            contact: {
              phone: { type: String, required: true },
              email: { type: String, required: true },
            },
            person: {
              name: { type: String, required: true },
            },
          },
          cascaded_level: { type: Number, required: true },
        },
      ],
    },
    resolution_provider: {
      respondent_info: {
        type: { type: String },
        organization: {
          org: {
            name: String,
          },
          contact: {
            phone: String,
            email: String,
          },
          person: {
            name: String,
          },
        },
        resolution_support: {
          chat_link: String,
          contact: {
            phone: String,
            email: String,
          },
          gros: [
            {
              person: {
                name: String,
              },
              contact: {
                phone: String,
                email: String,
              },
              gro_type: String,
            },
          ],
        },
      },
    },
    rating: { type: String },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    issueState: { type: String, enum: ['Pending', 'Processing', 'Resolved', 'Closed'] },
    context: { type: String },
  },
  {
    timestamps: true,
  },
);
IssueSchema.index({ transaction_id: 1 }, { unique: true });

export default mongoose.model<Issue>('Issue', IssueSchema);
