interface Person {
  name: string
}

interface Contact {
  phone: string
  email: string
}

interface OrderItem {
  id: string
  quantity: number
}

interface Fulfillment {
  id: string
  state: string
}

interface Description {
  short_desc: string
  long_desc: string
  additional_desc: {
    url: string
    content_type: string
  }
  images: string[]
}

interface Source {
  network_participant_id: string
  type: string
}

interface ExpectedResponseTime {
  duration: string
}

interface ExpectedResolutionTime {
  duration: string
}

interface ComplainantAction {
  complainant_action: string
  short_desc: string
  updated_at: string
  updated_by: {
    org: {
      name: string
    }
    contact: Contact
    person: Person
  }
}

interface RespondentAction {
  respondent_action: string
  short_desc: string
  updated_at: string
  updated_by: {
    org: {
      name: string
    }
    contact: Contact
    person: Person
  }
  cascaded_level?: number
}

interface Issue {
  id: string
  category: string
  sub_category: string
  complainant_info: {
    person: Person
    contact: Contact
  }
  order_details: {
    id: string
    state: string
    items: OrderItem[]
    fulfillments: Fulfillment[]
    provider_id: string
    merchant_order_id: string
  }
  description: Description
  source: Source
  expected_response_time: ExpectedResponseTime
  expected_resolution_time: ExpectedResolutionTime
  status: string
  issue_type: string
  issue_actions: {
    complainant_actions: ComplainantAction[]
    respondent_actions: RespondentAction[]
  }
  created_at: string
  updated_at: string
}

interface Context {
  domain: string
  country: string
  city: string
  action: string
  core_version: string
  bap_id: string
  bap_uri: string
  bpp_id: string
  bpp_uri: string
  transaction_id: string
  message_id: string
  timestamp: string
  ttl: string
}

interface Message {
  issue: Issue
}

export interface IIssueRequest {
  context: Context
  message: Message
}
