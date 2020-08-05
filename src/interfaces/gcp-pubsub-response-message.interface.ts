import {ERROR_HEADERS} from '../constants'

export type ErrorHeaderType = keyof typeof ERROR_HEADERS

export interface GcpPubSubResponseMessage {
  replyTo: string
  message: GcpPubSubResponseMessageData
}

export interface GcpPubSubResponseMessageData {
  data: Buffer
  orderingKey?: string
  attributes: GcpPubSubResponseMessageAttributes
}

export interface GcpPubSubResponseMessageAttributes {
  correlationId: string
  replyTo?: string
  receipient?: string
  isDisposed?: string
  isError?: ErrorHeaderType
  [key: string]: string | undefined
}
