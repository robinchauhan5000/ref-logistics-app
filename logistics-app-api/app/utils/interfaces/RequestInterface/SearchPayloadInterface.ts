interface Address {
  area_code: string
}

interface Location {
  gps: string
  address: Address
}

interface TimeRange {
  start: string
  end: string
}

interface Provider {
  time: {
    days: string
    schedule: {
      holidays: string[]
    }
    duration: string
    range: TimeRange
  }
}

interface Fulfillment {
  type: string
  start: {
    location: Location
  }
  end: {
    location: Location
  }
}

interface Payment {
  type: string
  '@ondc/org/collection_amount': string
}

interface PayloadDetails {
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
  category: string
  value: {
    currency: string
    value: string
  }
  dangerous_goods: boolean
}

interface Intent {
  category: {
    id: string
  }
  provider: Provider
  fulfillment: Fulfillment
  payment: Payment
  '@ondc/org/payload_details': PayloadDetails
}

interface Message {
  intent: Intent
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
  timestamp: string
  ttl: string
}

export interface ISearchRequest {
  context: Context
  message: Message
}
