import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { updateDataService } from './services/updateData';

import { ChainListDataType, env } from './config';

const server: FastifyInstance = Fastify({
  logger: {
    level: 'info'
  }
});

const opts: RouteShorthandOptions = {  
};

server.get('/', opts, async (request, reply) => {
  const data = updateDataService.getData<ChainListDataType>();
  return data;
});

const start = async () => {
  try {
    await updateDataService.init({
      updateInterval: 60 * 1000,
      jsonBlobId: env.JSON_BLOB_ID,
    });

    await server.listen({ port: 3000 });

    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
