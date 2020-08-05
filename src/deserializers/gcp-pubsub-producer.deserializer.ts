import {ProducerDeserializer, IncomingResponse} from '@nestjs/microservices'
import {GcpPubSubResponseMessageData} from '../interfaces'

export class GcpPubSubProducerDeserializer implements ProducerDeserializer {
  deserialize(message: GcpPubSubResponseMessageData): IncomingResponse {
    const {data, attributes} = message
    const {correlationId, isError, isDisposed} = attributes
    const castedDisposedFlag = (String(isDisposed) === 'true') ? true : false

    const errorOrData = JSON.parse(data.toString())

    if (isError) {
      return ({
        id: correlationId,
        err: errorOrData,
        isDisposed: castedDisposedFlag,
      })
    }

    return ({
      id: correlationId,
      response: errorOrData,
      isDisposed: castedDisposedFlag
    })
  }
}
