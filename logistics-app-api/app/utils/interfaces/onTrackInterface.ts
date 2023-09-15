interface IContext {
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
interface ILocation {
  gps: string
  time: {
    timestamp: string
  }
  updated_at: string
}
interface IMessage {
  tracking: {
    id: string
    url?: string
    location: ILocation
    status: string
    tags?: any[]
  }
}
export interface On_Track {
  context: IContext
  message: IMessage
}
