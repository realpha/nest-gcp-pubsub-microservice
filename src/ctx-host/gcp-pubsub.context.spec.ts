import {GcpPubSubContext} from './gcp-pubsub.context'
import {messageStubFactory} from '../test/__test_doubles__'

describe('GcpPubSubContext', () => {

  const testData = Buffer.from(JSON.stringify({test: 'this'}));
  const testDate = new Date()
  const testAttributes = {
    one: '1',
    two: '2'
  }

  const messageStub = messageStubFactory(testData, testAttributes, testDate)

  let ctx: GcpPubSubContext

  it('1 - Can be instantiated with an array containing a single Message object', () => {
    ctx = new GcpPubSubContext([messageStub])

    expect(ctx).toBeDefined()
  })

  it('2 - Returns a correct message reference', () => {
    const messageReference = ctx.getMessage()

    expect(messageReference).toBe(messageStub)
  })

  it('3 - Returns a correct representation of the publish time', () => {
    const orginalDate = Date.parse(testDate.toUTCString())
    const dateFromContext = Date.parse(ctx.getPublishTime().toUTCString())

    expect(dateFromContext).toEqual(orginalDate)
  })

  it('4 - Returns a correct attributes reference', () => {
    const attributesReference = ctx.getAttributes()

    expect(attributesReference).toBe(testAttributes)
  })

})
