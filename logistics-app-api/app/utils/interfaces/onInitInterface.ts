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

interface OrderLocation {
  id: string
}

interface OrderFulfillment {
  id: string
  type: string
  start: {
    location: {
      gps: string
      address: {
        name: string
        building: string
        locality: string
        city: string
        state: string
        country: string
        area_code: string
      }
    }
    contact: {
      phone: string
      email: string
    }
  }
  end: {
    location: {
      gps: string
      address: {
        name: string
        building: string
        locality: string
        city: string
        state: string
        country: string
        area_code: string
      }
    }
    contact: {
      phone: string
      email: string
    }
  }
  tags: {
    code: string
    list: {
      code: string
      value: string
    }[]
  }[]
}

interface OrderQuote {
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
  ttl?: string
}

interface OrderPayment {
  type: string
  collected_by: string
  '@ondc/org/settlement_details': {
    settlement_counterparty: string
    settlement_type: string
    beneficiary_name: string
    upi_address: string
    settlement_bank_account_no: string
    settlement_ifsc_code: string
  }[]
}

interface OrderCancellationTerm {
  fulfillment_state: {
    descriptor: {
      code: string
      short_desc?: string
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

interface OrderTags {
  code: string
  list: {
    code: string
    value: string
  }[]
}

export interface On_init {
  context: OrderContext
  message: {
    order: {
      provider: {
        id: string
      }
      provider_location?: OrderLocation
      items: {
        id: string
        fulfillment_id?: string
      }[]
      fulfillments: OrderFulfillment[]
      quote: OrderQuote
      payment: OrderPayment
      cancellation_terms: OrderCancellationTerm[]
      tags: OrderTags[]
    }
  }
}
