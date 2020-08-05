import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';

import {GcpPubSubServer} from '../../server/server-gcp-pubsub'

async function bootstrap() {
  const logger = new Logger('SYSTEM');
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new GcpPubSubServer({
      subscriptionOptions: {
        flowControl: {
          maxMessages: 100
        }
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
