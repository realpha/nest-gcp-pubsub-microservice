import {IncomingResponse} from '@nestjs/microservices'
import {messageStubFactory} from '../test/__test_doubles__'
import {GCP_PUBSUB_ERROR} from '../constants'
import {GcpPubSubResponseMessageData} from '../interfaces'

// UUT
import {GcpPubSubProducerDeserializer} from './gcp-pubsub-producer.deserializer'


describe('GcpPubSubProducerDeserializer - a class that translates the custom PubSub response format into the a Nestjs compatible response format', () => {
  const responseData = {assert: 'this'}
  const responseError = {name: 'TypeError', message: 'Wrong type for something'}
  const invalidMessageData = Buffer.from(`'{ "key": "par'`)

  const isError = GCP_PUBSUB_ERROR
  const isDisposedTrue = 'true'
  const isDisposedFalse = 'false'
  const correlationId = 'Azgf_76fiJH_89ZZ'

  const responseMessageAttributes = {
    correlationId,
    isDisposed: isDisposedFalse,
  }
  const responseMessageAttributesWithoutIsDisposed = {
    correlationId
  }
  const errorMessageAttributes = {
    correlationId,
    isError,
    isDisposed: isDisposedTrue
  }

  const responseMessage = messageStubFactory(JSON.stringify(responseData), responseMessageAttributes)
  const responseMessageWithoutIsDisposed = messageStubFactory(JSON.stringify(responseData), responseMessageAttributesWithoutIsDisposed)
  const errorMessage = messageStubFactory(JSON.stringify(responseError), errorMessageAttributes)
  const invalidMessage = messageStubFactory(invalidMessageData)

  const deserializer = new GcpPubSubProducerDeserializer()

  it('1 - correctly deserializes a response message', () => {
    const expectedResponse: IncomingResponse = {
      id: correlationId,
      response: responseData,
      isDisposed: false
    }

    const result = deserializer.deserialize(responseMessage as unknown as GcpPubSubResponseMessageData)

    expect(result).toBeDefined()
    expect(result).toStrictEqual(expectedResponse)
    expect(result.err).toBeUndefined()
  })

  it('2 - correctly deserialized a response message without isDisposed attribute', () => {
    const expectedResponse: IncomingResponse = {
      id: correlationId,
      response: responseData,
      isDisposed: false
    }

    const result = deserializer.deserialize(responseMessageWithoutIsDisposed as unknown as GcpPubSubResponseMessageData)

    expect(result).toBeDefined()
    expect(result).toStrictEqual(expectedResponse)
    expect(result.err).toBeUndefined()
  })

  it('3 - correctly deserializes an error response', () => {
    const expectedResponse = {
      id: correlationId,
      err: responseError,
      isDisposed: true
    }

    const result = deserializer.deserialize(errorMessage as unknown as GcpPubSubResponseMessageData)

    expect(result).toBeDefined()
    expect(result).toStrictEqual(expectedResponse)
    expect(result.response).toBeUndefined()
  })

  it('4 - throws when trying to deserialize a corrupted buffer', () => {

    expect(() => deserializer.deserialize(invalidMessage as unknown as GcpPubSubResponseMessageData)).toThrow()
  })


})


