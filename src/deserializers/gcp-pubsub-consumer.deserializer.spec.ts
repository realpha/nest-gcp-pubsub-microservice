import {IncomingRequest} from '@nestjs/microservices'
import {messageStubFactory} from '../test/__test_doubles__'
import {GcpPubSubConsumerDeserializer} from './gcp-pubsub-consumer.deserializer'

describe('GcpPubSubConsumerDeserializer', () => {
  const propperlyFormatedMessageData = {test: 'this'}
  const propperlyFormatedJSON = JSON.stringify(propperlyFormatedMessageData)
  const invalidJSON = `{ 'key': '1`
  const correlationId = 'sth-random-45gZ'

  const pattern = 'test/pattern'

  const deserializer = new GcpPubSubConsumerDeserializer()

  it('1 - is defined after instantiation', () => {
    expect(deserializer).toBeDefined()
    expect(deserializer.deserialize).toBeDefined()
  })

  it('2 - correctly deserializes a message with valid JSON data', () => {
    const messageStub = messageStubFactory(propperlyFormatedJSON)

    const incomingRequest = deserializer.deserialize(messageStub, {pattern})

    const expectedResult: IncomingRequest = {
      id: messageStub.id,
      data: propperlyFormatedMessageData,
      pattern
    }

    expect(incomingRequest).toBeDefined()
    expect(incomingRequest).toEqual(expectedResult)
  })

  it('3 - correctly deserializes a message with a correlationId', () => {
    const messageStub = messageStubFactory(propperlyFormatedJSON, {correlationId})

    const incomingRequest = deserializer.deserialize(messageStub, {pattern})

    const expectedResult: IncomingRequest = {
      id: correlationId,
      data: propperlyFormatedMessageData,
      pattern
    }

    expect(incomingRequest).toBeDefined()
    expect(incomingRequest).toEqual(expectedResult)
  })

  it('4 - throws when trying to parse a Buffer from an invalid JSON', () => {
    const messageStub = messageStubFactory(invalidJSON)

    expect(() => deserializer.deserialize(messageStub, {pattern})).toThrow()
  })
})
