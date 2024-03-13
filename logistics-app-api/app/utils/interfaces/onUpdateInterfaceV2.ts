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

interface Instructions {
    short_desc: string
    images?: string[]
}

interface Start {
    time: {
        range: {
            start: string
            end: string
        }
    }
    instructions: Instructions
}


interface Agent {
    name: string
    phone: string
}


interface Fulfillment {
    id: string
    type: string
    start: Start
    agent: Agent
}

interface Item {
    id: string
    category_id: string
    descriptor: {
        code: string
    }
}


interface Message {
    order: {
        id: string
        state: string | undefined
        items: Item[]
        fulfillments: Fulfillment[]
        updated_at: string
    }
}

export interface On_update {
    context: Context
    message: Message
}
