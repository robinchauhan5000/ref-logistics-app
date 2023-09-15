interface Address {
  name: string
  building: string
  locality: string
  city: string
  state: string
  country: string
  area_code: string
}

interface Contact {
  phone: string
  email: string
}

interface Location {
  gps: string
  address: Address
  contact: Contact
}

interface Descriptor {
  code: string
  name?: string
}

interface Time {
  label: string
  duration: string
  timestamp: string
}

interface FulfillmentItem {
  id: string
  fulfillment_id: string
  category_id: string
  descriptor: Descriptor
  time: Time
}

interface Fulfillment {
  id: string
  type: string
  start: {
    time: Time
    person: {
      name: string
    }
    location: Location
  }
  end: {
    person: {
      name: string
    }
    location: Location
  }
  tags: [
    {
      code: string
      list: [
        {
          code: string
          value: string
        },
      ]
    },
  ]
}

interface Price {
  currency: string
  value: string
}

interface Quote {
  price: Price
  breakup: [
    {
      '@ondc/org/item_id': string
      '@ondc/org/title_type': string
      price: Price
    },
  ]
}

interface BillingAddress {
  name: string
  address: Address
  tax_number: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

interface Payment {
  type: string
  '@ondc/org/collection_amount': string
}

interface Provider {
  id: string
  descriptor?: Descriptor
  address?: Address
}

interface LinkedOrder {
  items: [
    {
      category_id: string
      descriptor: Descriptor
      quantity: {
        count: number
        measure: {
          unit: string
          value: number
        }
      }
      price: Price
    },
  ]
  provider: Provider
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

interface Tag {
  code: string
  list: [
    {
      code: string
      value: string
    },
  ]
}

interface OrderMessage {
  id: string
  state: string
  provider: Provider
  items: FulfillmentItem[]
  quote: Quote
  fulfillments: Fulfillment[]
  billing: BillingAddress
  payment: Payment
  '@ondc/org/linked_order': LinkedOrder
  tags: Tag[]
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
  bpp_id: string
  bpp_uri: string
  bap_uri: string
  transaction_id: string
  message_id: string
  timestamp: string
  ttl: string
}

interface Message {
  order: OrderMessage
}

export interface IConfirmRequest {
  context: Context
  message: Message
}
