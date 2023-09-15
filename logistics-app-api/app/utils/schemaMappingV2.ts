const BPP_ID = process.env.BPP_ID
const BPP_URI = process.env.BPP_URI
import { On_search } from './interfaces/onSearchInterface'
import { On_initV2 } from './interfaces/onInitInterfaceV2'
import { removeIdKeys, formatedDate, calculateDeliveryCharges } from '../utils/utilityFunctions'
const descriptorName = 'WITS Project Ref Logistic'
import { uuid } from 'uuidv4'

// import { uuid } from 'uuidv4'
const long_desc = 'WITS Project Ref Logistic'
const short_desc = 'WITS Project Ref Logistic'

export const getAgentsV2 = async (data: any) => {
  const startLocation = data.fulfillment.start.location.gps.split(',')
  const endLocation = data.fulfillment.end.location.gps.split(',')
  data.context.timestamp = new Date().toISOString()
  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_search'
  delete context.ttl

  // const calculatedResult = calculateDeliveryCharges(lat1, lon1, lat2, lon2, basePrice, perKM)
  const schema: On_search = {
    context,
    message: {
      catalog: {
        'bpp/fulfillments': [
          {
            id: data?.data?.delivery_id,
            type: 'Prepaid',
          },
          {
            id: data?.data?.delivery_id,
            type: 'CoD',
          },
          {
            id: data?.data?.RTO_id,
            type: 'RTO',
          },
          {
            id: uuid(),
            type: 'Reverse QC',
          },
        ],
        'bpp/descriptor': {
          name: descriptorName,
        },
        'bpp/providers': data?.data?.data.map((agent: any) => {
          const { charge, tax } = calculateDeliveryCharges(
            startLocation[0],
            startLocation[1],
            endLocation[0],
            endLocation[1],
            agent.basePrice,
            agent.pricePerkilometer,
          )
          return {
            id: agent?._id,
            descriptor: {
              name: agent?.userId?.name,
              short_desc: short_desc,
              long_desc: long_desc,
            },
            categories: [
              {
                id: 'Immediate Delivery',
                time: {
                  //category level TAT for S2D (ship-to-delivery), can be overridden by item-level TAT whenever there are multiple options for the same category (e.g. 30 min, 45 min, 60 min, etc.);
                  label: 'TAT',
                  duration: 'PT60M',
                },
              },
            ],
            // locations: [
            //   {
            //     id: data.data[0].addressDetails._id,
            //     gps: 'gps',
            //     address: {
            //       street: 'street',
            //       city: data.data[0].addressDetails.city,
            //       area_code: 'area_code',
            //       state: data.data[0].addressDetails.state,
            //     },
            //   },
            // ],
            items: [
              {
                id: 'express',
                parent_item_id: '',
                category_id: 'Immediate Delivery',
                fulfillment_id: data?.data?.fulfillment_id,
                descriptor: {
                  code: 'P2P',
                  name: 'Immediate Delivery',
                  long_desc: 'Upto 60 mins for Delivery',
                  short_desc: 'Upto 60 mins for Delivery',
                },
                price: {
                  currency: 'INR',
                  value: `${(charge + tax).toFixed(2)}`,
                },
                time: {
                  label: 'TAT',
                  duration: 'PT40M',
                  timestamp: formatedDate(context.timestamp),
                },
              },
              {
                id: 'rto',
                parent_item_id: 'I1',
                category_id: 'Immediate Delivery',
                fulfillment_id: data?.data?.RTO_id,
                descriptor: {
                  code: 'P2P',
                  name: 'RTO quote',
                  short_desc: 'RTO quote',
                  long_desc: 'RTO quote',
                },
                price: {
                  currency: 'INR',
                  value: `${(((charge + tax) * 30) / 100).toFixed(2)}`,
                },
                time: {
                  label: 'TAT',
                  duration: 'PT60M',
                  timestamp: formatedDate(context.timestamp),
                },
              },
            ],
          }
        }),
      },
    },
  }
  if (data.data.length === 0) {
    schema.error = {
      type: 'DOMAIN-ERROR',
      code: '60001',
      message: 'Pickup location not serviceable by Logistics Provider',
    }
  }

  return removeIdKeys(schema)
}

export const getInitV2 = async (data: any) => {
  try {
    data.context.timestamp = new Date().toISOString()
    const context = data.context
    context.action = 'on_init'
    delete context.ttl

    const { fulfillments } = data?.message?.order

    const startLocation = fulfillments[0].start.location.gps.split(',')
    const endLocation = fulfillments[0].end.location.gps.split(',')

    const { charge, tax } = calculateDeliveryCharges(
      startLocation[0],
      startLocation[1],
      endLocation[0],
      endLocation[1],
      data.data.assignee.basePrice,
      data.data.assignee.pricePerkilometer,
    )

    const schema: On_initV2 = {
      context,
      message: {
        order: {
          provider: {
            id: data.data.assignee._id,
          },
          provider_location: {
            id: data.data.assignee.addressDetails._id,
          },
          items: data?.message?.items,
          quote: {
            price: {
              currency: 'INR',
              value: `${(charge + tax).toFixed(2)}`,
            },
            breakup: [
              {
                '@ondc/org/item_id': 'I1',
                '@ondc/org/title_type': 'Delivery Charge',
                price: {
                  currency: 'INR',
                  value: `${charge.toFixed(2)}`,
                },
              },
              {
                '@ondc/org/item_id': 'I1',
                '@ondc/org/title_type': 'Tax',
                price: {
                  currency: 'INR',
                  value: `${tax.toFixed(2)}`,
                },
              },
            ],
          },
          payment: {
            type: 'ON-FULFILLMENT',
            collected_by: 'BPP',
            '@ondc/org/settlement_details': [
              {
                settlement_counterparty:
                  data?.message?.order?.payment['@ondc/org/settlement_details'][0].settlement_counterparty,
                settlement_type: data?.message?.order?.payment['@ondc/org/settlement_details'][0].upi,
                beneficiary_name: 'xxxxx',
                upi_address: data?.message?.order?.payment['@ondc/org/settlement_details'][0].upi_address,
                settlement_bank_account_no:
                  data?.message?.order?.payment['@ondc/org/settlement_details'][0].settlement_bank_account_no,
                settlement_ifsc_code:
                  data?.message?.order?.payment['@ondc/org/settlement_details'][0].settlement_ifsc_code,
              },
            ],
          },
        },
      },
    }
    return removeIdKeys(schema)
  } catch (error) {
    console.log('ERROR : : :  : :', error)
  }
}
