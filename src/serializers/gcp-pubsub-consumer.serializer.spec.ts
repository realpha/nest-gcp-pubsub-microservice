import {OutgoingResponse} from '@nestjs/microservices'
import {GcpPubSubResponseMessage} from '../interfaces'
import {GcpPubSubContext} from '../ctx-host'
import {messageStubFactory} from '../test/__test_doubles__'
import {GCP_PUBSUB_ERROR, UNKNOWN_ERROR} from '../constants'
// UUT
import {GcpPubSubConsumerSerializer} from './gcp-pubsub-consumer.serializer'

describe('GcpPubSubConsumerDeserializer', () => {
  const replyTo = 'test-topic'
  const receipient = 'Inbox-239874'
  const arbitraryAttribute = 'Some::strange::string'
  const originalMessageContent = {test: 'this'}
  const originalMessageAttributes = {replyTo, receipient, arbitraryAttribute}
  const messageStub = messageStubFactory(JSON.stringify(originalMessageContent), originalMessageAttributes)

  const context = new GcpPubSubContext([messageStub])

  const consumerSerializer = new GcpPubSubConsumerSerializer()

  it('1 - is defined after instantiation', () => {
    expect(consumerSerializer).toBeDefined()
    expect(consumerSerializer.serialize).toBeDefined()
  })

  it('2 - correctly serializes a response with an error of type Error', () => {
    const testErrorMessage = 'Booom'
    const testError = new Error(testErrorMessage)
    const testBuffer = Buffer.from(JSON.stringify({name: testError.name, message: testError.message}))
    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      err: testError,
    }

    const serializedMessage: GcpPubSubResponseMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.attributes.isError', GCP_PUBSUB_ERROR)
  })

  it('3 - correctly serializes a response with an error of type Object', () => {
    const testErrorObject = {this: 'error'}
    const testBuffer = Buffer.from(JSON.stringify(testErrorObject))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      err: testErrorObject
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.attributes.isError', GCP_PUBSUB_ERROR)
  })

  it('4 - correctly serializes a response with an error of a fundamental type to indicate the unknown status', () => {
    const testErrorValue = 5
    const testBuffer = Buffer.from(JSON.stringify({name: UNKNOWN_ERROR, value: testErrorValue}))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      err: testErrorValue
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.attributes.isError', GCP_PUBSUB_ERROR)
  })

  it('5 - correctly serializes a response with an error and response property to a message which prioritizes the error', () => {
    const testErrorObject = {this: 'error'}
    const testResponseData = {that: 'data'}
    const testBuffer = Buffer.from(JSON.stringify(testErrorObject))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      err: testErrorObject,
      response: testResponseData
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.attributes.isError', GCP_PUBSUB_ERROR)
  })

  it('6 - correctly serializes a response with the response message data and all metadata provided by the original message, except "replyTo"', () => {
    const testResponseData = {that: 'data'}
    const testBuffer = Buffer.from(JSON.stringify(testResponseData))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      response: testResponseData,
      isDisposed: true
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.orderingKey', messageStub.orderingKey)
    expect(serializedMessage).toHaveProperty('message.attributes.correlationId', messageStub.id)
    expect(serializedMessage).toHaveProperty('message.attributes.isDisposed', "true")
    expect(serializedMessage).toHaveProperty('message.attributes.receipient', receipient)
    expect(serializedMessage).toHaveProperty('message.attributes.arbitraryAttribute', arbitraryAttribute)
    expect(serializedMessage.message.attributes.replyTo).toBeUndefined()
    expect(serializedMessage.message.attributes.isError).toBeUndefined()
  })

  it('7 - correctly serializes a response with a reponse property of type Array', () => {
    const testArray = Array(3).fill({one: '1', two: '2'})
    const wrappedArray = {items: testArray}
    const testBuffer = Buffer.from(JSON.stringify(wrappedArray))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      response: testArray
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage.message.attributes.isError).toBeUndefined()
    expect(serializedMessage.message.attributes.isDisposed).toBeUndefined()
  })

  it('8 - correctly serializes a response with a response property of a fundamental type', () => {
    const testResponseData = '/look/this/up'
    const wrappedResponseData = {value: testResponseData}
    const testBuffer = Buffer.from(JSON.stringify(wrappedResponseData))

    const responseMessage: OutgoingResponse = {
      id: messageStub.id,
      response: testResponseData,
      isDisposed: false
    }

    const serializedMessage = consumerSerializer.serialize({responseMessage, context})

    expect(serializedMessage).toBeDefined()
    expect(serializedMessage).toHaveProperty('replyTo', replyTo)
    expect(serializedMessage).toHaveProperty('message.data', testBuffer)
    expect(serializedMessage).toHaveProperty('message.attributes.isDisposed', "false")
    expect(serializedMessage.message.attributes.isError).toBeUndefined()
  })

})




