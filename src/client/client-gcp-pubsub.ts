import {ClientProxy, ProducerSerializer, ProducerDeserializer, ReadPacket, WritePacket} from '@nestjs/microservices'
import {PubSub} from '../external'

export class GcpPubSubClient extends ClientProxy {
  protected replySuffix = '-response'
  constructor(options: any) {
    super()

  }

  publish(packet: ReadPacket, callback: (packet: WritePacket) => void): Function {
    const cb = callback
    return (responsePacket: ReadPacket = packet) => {
      const {data} = responsePacket
      const returnPacket = {
        id: '12345',
        response: data
      }
      cb(returnPacket)
    }

  }

  async dispatchEvent<T = any>(packet: ReadPacket): Promise<T> {
    console.log(`dispatched ${packet}`)
    return ("true" as any)
  }

  async connect() {
    return
  }

  async close() {
    return
  }
}
