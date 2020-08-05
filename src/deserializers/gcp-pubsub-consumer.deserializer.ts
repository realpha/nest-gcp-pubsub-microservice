import {ConsumerDeserializer, IncomingRequest, IncomingEvent} from '@nestjs/microservices'
import {Message} from '../external'


export class GcpPubSubConsumerDeserializer implements ConsumerDeserializer {
  deserialize(gcpPubSubMessage: Message, options: Record<string, any>): IncomingRequest | IncomingEvent {
    return ({
      id: (gcpPubSubMessage.attributes.correlationId || gcpPubSubMessage.id),
      data: JSON.parse(gcpPubSubMessage.data.toString()),
      pattern: options.pattern
    })
  }
}


