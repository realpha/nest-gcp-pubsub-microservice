import {isObject, isPlainObject} from '@nestjs/common/utils/shared.utils'
import {removeUndefined} from '../utils'
import {Serializer} from '@nestjs/microservices'
import {UNKNOWN_ERROR, GCP_PUBSUB_ERROR} from '../constants'
import {GcpPubSubResponseMessage, GcpPubSubConsumerSerializerContext, GcpPubSubRequestMessageAttributes} from '../interfaces'


export class GcpPubSubConsumerSerializer implements Serializer {
  serialize(responseAndContext: GcpPubSubConsumerSerializerContext): GcpPubSubResponseMessage {
    const {responseMessage, context} = responseAndContext
    const {id, err, response, isDisposed} = responseMessage
    const {replyTo, ...responseAttributes} = context.getAttributes() as unknown as GcpPubSubRequestMessageAttributes
    const requestOrderingKey = context.getOrderingKey()

    let dataToBeSerialized: object | Partial<Error>
    if (err) {
      dataToBeSerialized = (err instanceof Error)
        ? {name: err.name, message: err.message}
        : (isPlainObject(err))
          ? err
          : {name: UNKNOWN_ERROR, value: err}
    } else {
      dataToBeSerialized = (!isObject(response))
        ? {value: response}
        : (isPlainObject(response))
          ? response
          : (Array.isArray(response))
            ? {items: response}
            : {}
    }

    const result = {
      replyTo,
      message: {
        data: Buffer.from(JSON.stringify(dataToBeSerialized)),
        attributes: {
          ...responseAttributes,
          correlationId: id,
          isDisposed: (isDisposed === true || isDisposed === false) ? `${isDisposed}` : undefined,
          isError: (err) ? GCP_PUBSUB_ERROR : undefined
        },
        orderingKey: requestOrderingKey
      }
    }

    return removeUndefined(result)
  }
}
