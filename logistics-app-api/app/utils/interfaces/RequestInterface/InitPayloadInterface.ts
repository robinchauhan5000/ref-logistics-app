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
}

interface FulfillmentItem {
  id: string
  fulfillment_id: string
  category_id: string
  descriptor: Descriptor
}

interface Fulfillment {
  id: string
  type: string
  start: Location
  end: Location
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
}

interface OrderMessage {
  provider: Provider
  items: FulfillmentItem[]
  fulfillments: Fulfillment[]
  billing: BillingAddress
  payment: Payment
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
  order: OrderMessage
}

export interface IInitRequest {
  context: Context
  message: Message
}
