import {ClientConfig, SubscriptionOptions, PublishOptions} from '../external'
import {Serializer, Deserializer} from '@nestjs/microservices'

export interface GcpPubSubServerSubscriptionOptions extends Omit<SubscriptionOptions, 'topic'> {
  enableMessageOrdering?: boolean
  filter?: string
}

export interface GcpPubSubServerOptions {
  client?: ClientConfig
  subscriptionOptions?: GcpPubSubServerSubscriptionOptions
  serializer?: Serializer
  deserializer?: Deserializer
}
