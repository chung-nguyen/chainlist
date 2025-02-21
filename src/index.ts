import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { updateDataService } from './services/updateData';

import { ChainListDataType, env } from './config';
import { rpcHealthCheck } from './services/rpcHealthCheck';

const server: FastifyInstance = Fastify({
  logger: {
    level: 'info',
  },
});

const opts: RouteShorthandOptions = {};

server.get('/:chain', opts, async (request: FastifyRequest, reply: FastifyReply) => {
  const chainName = (request.params as any).chain;
  const url = rpcHealthCheck.getHealthyRPC(chainName);
  return url;
});

const start = async () => {
  try {
    await updateDataService.init({
      updateInterval: 60 * 1000,
      jsonBlobId: env.JSON_BLOB_ID,
    });
    rpcHealthCheck.init(updateDataService.getData<ChainListDataType>());

    await server.listen({ port: env.PORT });

    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
