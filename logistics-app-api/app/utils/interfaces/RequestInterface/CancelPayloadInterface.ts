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
  order_id: string
  cancellation_reason_id: string
}

export interface ICancelRequest {
  context: Context
  message: Message
}
