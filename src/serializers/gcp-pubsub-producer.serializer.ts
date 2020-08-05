import {Serializer} from '@nestjs/microservices'
import {GcpPubSubRequestMessage, GcpPubSubSerializerInput} from '../interfaces'
import {removeUndefined} from '../utils'

export class GcpPubSubProducerSerializer implements Serializer {
  serialize(input: GcpPubSubSerializerInput): GcpPubSubRequestMessage {
    const {pattern, postfix, receipient, correlationId, ...messageMetadata} = input.options
    const data = Buffer.from(input.message.data)
    const replyTo = pattern ? `${pattern}-${postfix}` : undefined

    return ({
      data,
      attributes: {
        replyTo,
        receipient,
        correlationId,
        ...messageMetadata
      },
      orderingKey: input.options.orderingKey
    })
  }
}
