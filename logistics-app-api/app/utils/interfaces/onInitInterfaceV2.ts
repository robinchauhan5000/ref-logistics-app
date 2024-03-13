interface OrderContext {
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
interface Price {
  currency: string
  value: string
}
interface Breakup {
  '@ondc/org/item_id': string
  '@ondc/org/title_type': string
  price: Price
}

interface OrderPayment {
  type: string
  collected_by: string
  '@ondc/org/settlement_details'?: {
    settlement_counterparty: string
    settlement_type: string
    beneficiary_name: string
    upi_address: string
    settlement_bank_account_no: string
    settlement_ifsc_code: string
  }[]
}

export interface On_initV2 {
  context: OrderContext
  message: {
    order: {
      provider: {
        id: string
      }
      provider_location?: {
        id: string
      }
      items: {
        id: string
      }[]
      quote: {
        price: Price
        breakup: Breakup[]
      }
      payment: OrderPayment
    }
  }
}
