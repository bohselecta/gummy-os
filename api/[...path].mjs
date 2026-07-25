import { createApiHandler } from '../server/api.mjs';

export const config = {
  maxDuration: 60
};

const handler = createApiHandler();

export default function gummyApi(request, response) {
  return handler(request, response);
}
