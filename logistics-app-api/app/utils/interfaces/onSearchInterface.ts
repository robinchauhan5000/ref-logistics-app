interface Catalog {
  'bpp/descriptor': {
    name: string
  }
  'bpp/providers': Provider[]
  'bpp/fulfillments'?: Fulfillment[]
}

interface Provider {
  id: string
  descriptor: {
    name: string
    short_desc: string
    long_desc: string
  }
  categories: Category[]
  locations: Location[]
  items: Item[]
}

interface Category {
  id: string
  time: {
    label: string
    duration: string
    timestamp: string
  }
}

interface Fulfillment {
  id: string
  type: string
  start?: {
    time: {
      duration: string
    }
  }
  tags?: Tag[]
}

interface Tag {
  code: string
  list: {
    code: string
    value: string
  }[]
}

interface Location {
  id: string
  gps: string
  address: {
    street: string
    city: string
    area_code: string
    state: string
  }
}

interface Item {
  id: string
  parent_item_id: string
  category_id: string
  fulfillment_id: string
  descriptor: {
    code: string
    name: string
    short_desc: string
    long_desc: string
  }
  price: {
    currency: string
    value: string
  }
  time: {
    label: string
    duration: string
    timestamp: string
  }
}

export interface On_search {
  context: {
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
  message?: {
    catalog?: Catalog
  }
  error?: {
    type: string
    code: string
    message: string
  }
}
