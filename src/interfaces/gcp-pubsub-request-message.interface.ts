export interface GcpPubSubRequestMessage {
  data: Buffer,
  attributes: GcpPubSubRequestMessageAttributes
  orderingKey?: string
}

export interface GcpPubSubRequestMessageAttributes {
  replyTo: string
  correlationId?: string
  receipient?: string
  [key: string]: string | undefined
}
