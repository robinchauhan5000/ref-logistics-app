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
}

interface Descriptor {
  code: string
}

interface Time {
  label: string
  duration: string
  timestamp: string
}

interface Address {
  name: string
  building: string
  locality: string
  city: string
  state: string
  country?: string
  area_code: string
}

interface Contact {
  phone: string
  email: string
}

interface Instructions {
  code: string
  short_desc: string
  long_desc?: string
  additional_desc?: {
    content_type: string
    url: string
  }
}

interface Start {
  person: {
    name: string
  }
  location: {
    gps: string
    address: Address
  }
  contact: Contact
  instructions: Instructions
  time: {
    duration: string
    range: {
      start: string
      end: string
    }
  }
}

interface End {
  person: {
    name: string
  }
  location: {
    gps: string
    address: Address
  }
  contact: Contact
  instructions: Instructions
  time: {
    range: {
      start: string
      end: string
    }
  }
}

interface Agent {
  name: string
  phone: string
}

interface Vehicle {
  registration: string
}

interface Fulfillment {
  id: string
  type: string
  state: {
    descriptor: Descriptor
  }
  '@ondc/org/awb_no'?: string
  tracking: boolean
  start: Start
  end: End
  agent: Agent
  vehicle: Vehicle
  tags: {
    code: string
    list: {
      code: string
      value: string
    }[]
  }[]
}

interface Quote {
  price: {
    currency: string
    value: string
  }
  breakup: {
    '@ondc/org/item_id': string
    '@ondc/org/title_type': string
    price: {
      currency: string
      value: string
    }
  }[]
}

interface Item {
  id: string
  fulfillment_id: string
  category_id: string
  descriptor: {
    code: string
  }
  time: Time
}

interface Payment {
  '@ondc/org/collection_amount': string
  collected_by: string
  type: string
  '@ondc/org/settlement_details': {
    settlement_counterparty: string
    settlement_type: string
    upi_address: string
    settlement_bank_account_no: string
    settlement_ifsc_code: string
  }[]
}

interface LinkedOrderItem {
  category_id: string
  descriptor: {
    name: string
  }
  quantity: {
    count: number
    measure: {
      unit: string
      value: number
    }
  }
  price: {
    currency: string
    value: string
  }
}

interface LinkedOrderProvider {
  descriptor: {
    name: string
  }
  address: Address
}

interface LinkedOrder {
  items: LinkedOrderItem[]
  provider: LinkedOrderProvider
  order: {
    id: string
    weight: {
      unit: string
      value: number
    }
    dimensions: {
      length: {
        unit: string
        value: number
      }
      breadth: {
        unit: string
        value: number
      }
      height: {
        unit: string
        value: number
      }
    }
  }
}

interface Billing {
  name: string
  address: Address
  tax_number: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

interface CancellationTerm {
  fulfillment_state: {
    descriptor: {
      code: string
      short_desc: string
    }
  }
  refund_eligible: boolean
  reason_required: boolean
  cancellation_fee: {
    amount: {
      currency: string
      value: string
    }
  }
}

interface Tag {
  code: string
  list: {
    code: string
    value: string
  }[]
}

interface Message {
  order: {
    id: string
    state: string | undefined
    provider: {
      id: string
      locations?: {
        id: string
      }[]
    }
    items: Item[]
    quote: Quote
    fulfillments: Fulfillment[]
    billing: Billing
    payment: Payment
    '@ondc/org/linked_order': LinkedOrder
    cancellation_terms?: CancellationTerm[]
    tags: Tag[]
    created_at: string
    updated_at: string
  }
}

export interface On_confirm {
  context: Context
  message?: Message
  error?: {
    type: string
    code: string
    message: string
  }
}
