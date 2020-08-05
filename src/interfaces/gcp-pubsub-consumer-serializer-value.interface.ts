import {OutgoingResponse} from '@nestjs/microservices'
import {GcpPubSubContext} from '../ctx-host'

export interface GcpPubSubConsumerSerializerContext {
  responseMessage: OutgoingResponse
  context: GcpPubSubContext
}
