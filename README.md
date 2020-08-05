## Work in progress...
The aim of this package is to provide a Nestjs native way to interact with GCP PubSub.

The server component is fully functional and adheres to Nestjs conventions, i.e. it provides Event- and Message patterns.

The client is still under heavy development and not yet published.


### Example usage

Simply bootstrap the microservice in your `main.ts` file as you would any other Nestjs microservice.
The server accepts the same config as the PubSub Client and also provides the possibility to define standard subscription options:
```typescript
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';
import {GcpPubSubServer} from '../../server/server-gcp-pubsub'

async function bootstrap() {
  const logger = new Logger('SYSTEM');
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new GcpPubSubServer({
      client: {
        projectId: 'my-project',
        keyFile: '/path/to/key/file'
      },
      subscriptionOptions: {
        flowControl: {
          maxMessages: 100,
          allowExcessMessages: false
        }
        enableMessageOrdering: true,
        filter: 'attributes.subTopic == "my-subTopic"'
      }
    }),
  });
  app.enableShutdownHooks()
  app.listen(() => logger.verbose('Microservice is listening...'));

  process.on('SIGTERM', async () => {
    await app.close()
  })
}

bootstrap();
