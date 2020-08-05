import {Server, CustomTransportStrategy, MessageHandler, RpcException, IncomingRequest, Serializer, Deserializer, WritePacket} from '@nestjs/microservices';
import {isUndefined, isFunction} from '@nestjs/common/utils/shared.utils'
import {Observable, ConnectableObservable} from 'rxjs'
import {publish} from 'rxjs/operators'
import {PubSub, Subscription, ClientConfig, Message} from '../external'
import {GcpPubSubServerOptions, GcpPubSubServerSubscriptionOptions} from '../interfaces'
import {GcpPubSubContext} from '../ctx-host';
import {GcpPubSubConsumerDeserializer} from '../deserializers'
import {GcpPubSubConsumerSerializer} from '../serializers'
import {CLOSE_EVENT, MESSAGE_EVENT, ERROR_EVENT} from '../constants';

export class GcpPubSubServer extends Server implements CustomTransportStrategy {
  protected subClient: PubSub
  protected pubClient: PubSub
  protected subscriptionsMap: Map<string, Subscription> = new Map()
  protected serializer: Serializer
  protected deserializer: Deserializer
  private readonly clientOptions: ClientConfig | undefined
  private readonly subscriptionOptions: GcpPubSubServerSubscriptionOptions
  public isTerminated: boolean

  constructor(options: GcpPubSubServerOptions) {
    super()

    this.logger.setContext(this.constructor.name)

    this.clientOptions = options.client
    this.subscriptionOptions = options.subscriptionOptions ? options.subscriptionOptions : ({
      flowControl: {
        maxMessages: 10,
        allowExcessMessages: false
      },
      enableMessageOrdering: true
    })

    this.subClient = new PubSub(this.clientOptions)
    this.pubClient = new PubSub(this.clientOptions)

    this.serializer = options.serializer ? options.serializer : new GcpPubSubConsumerSerializer()
    this.deserializer = options.deserializer ? options.deserializer : new GcpPubSubConsumerDeserializer()

    this.isTerminated = false
    this.logger.debug('Initialized GCP PUBSUB SERVER')
  }

  public listen(callback: () => void): void {
    for (const subscriptionName of this.messageHandlers.keys()) {
      const subscriptionReference = this.subClient.subscription(subscriptionName, this.subscriptionOptions)
      this.subscriptionsMap.set(subscriptionName, subscriptionReference)
    }

    this.start(callback)
  }

  private start(callback: () => any): void {
    this.bindHandlers()
    callback()
  }

  private bindHandlers() {
    for (const [pattern, handler] of this.messageHandlers.entries()) {
      const subscription = this.subscriptionsMap.get(pattern)

      if (isUndefined(subscription)) {
        throw new RpcException(`Subscription ${pattern} does not exist! Aborting...`)
      }

      this.logger.debug('About to bind handlers...')

      this.handlePubSubError(subscription)
      this.handleMessages(subscription, pattern, handler)
    }
  }

  private handleMessages(stream: any, pattern: string, handler: MessageHandler) {
    stream.on(MESSAGE_EVENT, async (msg: Message) => {
      try {
        const packet = this.deserializer.deserialize(msg, {pattern})
        const context = new GcpPubSubContext([msg])
        const replyTopic = context.getAttributes().replyTo

        if (!handler.isEventHandler && replyTopic) {
          this.transformToMessageHander(handler)(packet, context)
        } else {
          const resultOrStream = await handler(packet.data, context);
          if (this.checkIfObservable(resultOrStream)) {
            (resultOrStream.pipe(publish()) as ConnectableObservable<any>).connect();
          } else {
            msg.ack()
          }
        }
      }
      catch (err) {
        this.logger.error(`Error at ${handler.name}: ${err.message}`, err.stack)
        msg.nack()
      }
    })
  }

  private transformToMessageHander(handler: MessageHandler): Function {
    return async (packet: IncomingRequest, context: GcpPubSubContext) => {
      const response$ = this.transformToObservable(await handler(packet.data, context)) as Observable<any>

      const publish = this.getPublisher(context)

      response$ && this.send(response$, publish)
    }
  }

  public getPublisher(context: GcpPubSubContext) {
    return (responseMessage: WritePacket) => {
      const {replyTo, message} = this.serializer.serialize({responseMessage, context})
      const originalMessage = context.getMessage()
      const messageOrdering = originalMessage.orderingKey ? true : false

      originalMessage.ack()
      this.pubClient.topic(replyTo, {messageOrdering}).publishMessage(message)
    }
  }

  public async close(): Promise<void> {
    for (const subscription of this.subscriptionsMap.values()) {
      subscription.on(CLOSE_EVENT, () => {this.logger.debug(`Closed Subscription ${subscription.name}`)})
      await subscription.close()
    }
    this.isTerminated = true
  }

  public handlePubSubError(subscription: Subscription) {
    subscription.on(ERROR_EVENT, (err) => {this.logger.error(`PubSub error handler triggered by ${subscription.name}:`, err.stack)})
  }

  private checkIfObservable(input: unknown): input is Observable<any> {
    return input && isFunction((input as Observable<any>).subscribe)
  }

}

