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

interface IntentProviderTimeSchedule {
  holidays: string[]
  frequency: string
  times: string[]
}

interface IntentProviderTime {
  days: string
  schedule: IntentProviderTimeSchedule
  range: {
    start: string
    end: string
  }
}

interface IntentProvider {
  time: IntentProviderTime
}

interface IntentFulfillmentStartLocationAddress {
  area_code: string
}

interface IntentFulfillmentStartLocation {
  gps: string
  address: IntentFulfillmentStartLocationAddress
}

interface IntentFulfillmentEndLocationAddress {
  area_code: string
}

interface IntentFulfillmentEndLocation {
  gps: string
  address: IntentFulfillmentEndLocationAddress
}

interface IntentFulfillment {
  type: string
  start: {
    location: IntentFulfillmentStartLocation
  }
  end: {
    location: IntentFulfillmentEndLocation
  }
}

interface IntentPayment {
  '@ondc/org/collection_amount': string
}

interface IntentPayloadDetailsWeight {
  unit: string
  value: number
}

interface IntentPayloadDetailsDimensions {
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

interface IntentPayloadDetailsValue {
  currency: string
  value: string
}

interface IntentPayloadDetails {
  weight: IntentPayloadDetailsWeight
  dimensions: IntentPayloadDetailsDimensions
  category: string
  value: IntentPayloadDetailsValue
  dangerous_goods: boolean
}

interface Intent {
  category: {
    id: string
  }
  provider: IntentProvider
  fulfillment: IntentFulfillment
  payment: IntentPayment
  '@ondc/org/payload_details': IntentPayloadDetails
}

interface Message {
  intent: Intent
}

// interface Catalog {

// }

export interface SearchPayload {
  context: Context
  message: Message
}

export interface OnSearchPayload {
  context: Context
}
