import {BaseRpcContext} from '@nestjs/microservices/ctx-host/base-rpc.context'
import {Message} from '../external'

export type GcpPubSubContextArgs = [Message]

export class GcpPubSubContext extends BaseRpcContext {
  constructor(args: GcpPubSubContextArgs) {
    super(args)
  }

  getMessage(): Message {
    return this.getArgByIndex(0)
  }

  getAttributes(): Record<string, string> {
    return this.getMessage().attributes
  }

  getPublishTime(): Date {
    return new Date(this.getMessage().publishTime.toUTCString())
  }

  getOrderingKey(): string | undefined {
    return this.getMessage().orderingKey
  }
}

