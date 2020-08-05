import {PreciseDate} from '@google-cloud/precise-date'
import {Message} from '../../external'

export const messageStubFactory = (stubData: string | Buffer, stubAttributes?: Record<string, string>, stubPublishTime?: Date, stubID?: string): Message => {
  return ({
    data: (typeof stubData !== 'string') ? stubData : Buffer.from(stubData),
    publishTime: stubPublishTime ? new PreciseDate(stubPublishTime) : new PreciseDate(),
    id: stubID || '239712356333258',
    ackId: 'AZB_KJDF94_346H',
    attributes: stubAttributes || {},
    deliveryAttempt: 1,
    received: 152934435000,
    length: 13,
    ack: () => {},
    nack: () => {},
    modAck: () => {}
  }) as unknown as Message
}
