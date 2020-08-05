export interface GcpPubSubProducerPublishSerializerOptions {
  pattern: string
  postfix: string
  receipient: string
  correlationId: string
  [key: string]: string | undefined
}

export type GcpPubSubProducerEmitSerializerOptions = Partial<GcpPubSubProducerPublishSerializerOptions>

export type GcpPubSubSerializerOptions = GcpPubSubProducerPublishSerializerOptions | GcpPubSubProducerEmitSerializerOptions
