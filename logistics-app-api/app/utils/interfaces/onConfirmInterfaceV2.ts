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
  
  interface Address {
    name: string
    building: string
    locality: string
    city: string
    state: string
    country?: string
    area_code: string
  }
  
  interface Start {
    time: {
      duration: string
      range: {
        start: string
        end: string
      }
    }
  }
  
  interface End {
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
    category: string
    size: string
  }
  
  interface Fulfillment {
    id: string
    type: string
    state: {
      descriptor: Descriptor
    }
    '@ondc/org/awb_no': string
    tracking: boolean
    start: Start
    end: End
    agent: Agent
    vehicle: Vehicle
    '@ondc/org/ewaybillno'?: string
    '@ondc/org/ebnexpirydate'?: string
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
    category_id: string
    descriptor: {
      code: string
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
  
  interface Message {
    order: {
      id: string
      state: string | undefined
      provider: {
        id: string
        locations: {
          id: string
        }[]
      }
      items: Item[]
      quote: Quote
      fulfillments: Fulfillment[]
      billing: Billing
      created_at: string
      updated_at: string
    }
  }
  
  export interface On_confirm {
    context: Context
    message: Message
  }
  