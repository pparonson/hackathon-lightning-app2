import { Request, Response } from 'express';
import nodeManager from './node-manager';
import db from './posts-db';
import LndGrpc from 'lnd-grpc';

/**
 * POST /api/connect
 */
export const connect = async (req: Request, res: Response) => {
  const { host, cert, macaroon } = req.body;
  const { token, pubkey } = await nodeManager.connect(host, cert, macaroon);
  await db.addNode({ host, cert, macaroon, token, pubkey });
  res.send({ token });
};

/**
 * GET /api/info
 */
export const getInfo = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw new Error('Your node is not connected!');
  // find the node that's making the request
  const node = db.getNodeByToken(token);
  if (!node) throw new Error('Node not found with this token');

  // get the node's pubkey and alias
  const rpc = nodeManager.getRpc(node.token);
  const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  const { balance } = await rpc.channelBalance();
  res.send({ alias, balance, pubkey });
};

/**
 * GET /api/posts
 */
export const getPosts = (req: Request, res: Response) => {
  const posts = db.getAllPosts();
  res.send(posts);
};

/**
 * POST /api/posts
 */
export const createPost = async (req: Request, res: Response) => {
  const { username, title, customerId, agentId, invoice } = req.body;
  // const rpc = nodeManager.getRpc(token);

  // const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  // lnd requires the message to sign to be base64 encoded
  // const msg = Buffer.from(content).toString('base64');
  // sign the message to obtain a signature
  // const { signature } = await rpc.signMessage({ msg });

  const post = await db.createPost(username, title, customerId, agentId, invoice);
  res.status(201).send(post);
};

/**
 * Post /api/getPaymentRequestAmount
 */
export const getPaymentAmount = async (req: Request, res: Response) => {
  const { token, paymentRequest } = req.body;
  if (!token) throw new Error('Your node is not connected!');

  // find the node that's making the request
  const node = db.getNodeByToken(token);
  if (!node) throw new Error('Node not found with this token');

  // get the node's pubkey and alias
  const rpc = nodeManager.getRpc(node.token);
  const { numSatoshis } = await rpc.decodePayReq(paymentRequest);
  res.send({ numSatoshis });
};

/**
 * POST /api/posts/:id/markPaid
 */
export const markPaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { token } = req.body;

  const post = db.getPostById(parseInt(id));
  if (!post) throw new Error('Post not found');
  const node = db.getNodeByToken(token);
  if (!node) throw new Error('Node not found for this post');

  const rpc = nodeManager.getRpc(node.token);
  db.markPaid(post.id);
  res.send(post);
};

// /**
//  * POST /api/posts/:id/invoice
//  */
export const postInvoice = async (req: Request, res: Response) => {
  console.log('BEGIN postInvoice');

  const grpc = new LndGrpc({
    lndconnectUri:
      'lndconnect://127.0.0.1:10003?cert=MIICJzCCAcygAwIBAgIQfPhwV_rMoOBdcv4dK599BjAKBggqhkjOPQQDAjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVjYXJvbDAeFw0yMjA4MDYwMTA5NTFaFw0yMzEwMDEwMTA5NTFaMDExHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxDjAMBgNVBAMTBWNhcm9sMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3eZS8wYYV3ea6Er-7Y8a-ZXcYo3h4cillp0auN3g8eEQBmj3IsA67hNW3A3kOADrKs1-je8gBqInTh_KbQTp-6OBxTCBwjAOBgNVHQ8BAf8EBAMCAqQwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDwYDVR0TAQH_BAUwAwEB_zAdBgNVHQ4EFgQUrz9DMK1-Gj8SNI05QYW9EqEz8q4wawYDVR0RBGQwYoIFY2Fyb2yCCWxvY2FsaG9zdIIFY2Fyb2yCDnBvbGFyLW41LWNhcm9sggR1bml4ggp1bml4cGFja2V0ggdidWZjb25uhwR_AAABhxAAAAAAAAAAAAAAAAAAAAABhwSsEgAEMAoGCCqGSM49BAMCA0kAMEYCIQDVR5jTQY4UZKj12whlSc9VzDGBejr2S7es_D3aF6NEgwIhAKHFy9IcLM3llwQ2eKt64Vq0aUqdLimP5Y35TNd1SdM0&macaroon=AgEDbG5kAvgBAwoQ5efPyl4IU1Gb2Q5nvAuhfhIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgBTf9jpgJ2NbtVltzI1qRbroQUhWpsaXsELGk6w_G7UA',
  });
  let request = {
    payment_request: req.body.paymentRequest,
    timeout_seconds: 30000,
  };

  await grpc.connect();

  /**
   * NOTE: below commented listeners do not seem to work
   */

  // Do something if we detect that the wallet is locked.
  // grpc.on(`locked`, () => console.log('wallet locked!'));

  // Do something when the wallet gets unlocked.
  // grpc.on(`active`, () => console.log('wallet unlocked!'));

  // Do something when the connection gets disconnected.
  // grpc.on(`disconnected`, () => console.log('disconnected from lnd!'));

  console.log(grpc.state);

  let call = await grpc.services.Router.sendPaymentV2(request);
  call.on('data', function (response) {
    // A response was received from the server.
    console.log(response);
    if (response.status.toLowerCase() === 'succeeded') {
      // TODO: need to mark post status as paid and return with confetti
    }
  });
  call.on('status', function (status) {
    // The current status of the stream.
    console.log(status);
  });
  call.on('end', async function () {
    // The server has closed the stream.
    console.log('END');
    // Disconnect from all services.
    await grpc.disconnect();
  });
};
