interface Descriptor {
  code: string
  name?: string
}

interface Time {
  label: string
  duration: string
  timestamp: string
}

interface Instructions {
  code: string
  short_desc: string
  long_desc: string
}

interface Tag {
  code: string
  list: {
    code: string
    value: string
  }[]
}

interface Fulfillment {
  id: string
  type: string
  start: {
    instructions: Instructions
  }
  end: {}
  tags: Tag[]
}

interface Quantity {
  count: number
  measure: {
    unit: string
    value: number
  }
}

interface Price {
  currency: string
  value: string
}

interface LinkedOrderItem {
  category_id: string
  descriptor: Descriptor
  quantity: Quantity
  price: Price
}

interface Order {
  id: string
  items: {
    id: string
    fulfillment_id: string
    category_id: string
    descriptor: Descriptor
    time: Time
  }[]
  fulfillments: Fulfillment[]
  '@ondc/org/linked_order': {
    items: LinkedOrderItem[]
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
  transaction_id: string
  message_id: string
  bpp_id: string
  bpp_uri: string
  timestamp: string
  ttl: string
}

interface Message {
  update_target: string
  order: Order
}

export interface IUpdateRequest {
  context: Context
  message: Message
}
