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
      'lndconnect://127.0.0.1:10001?cert=MIICJjCCAc2gAwIBAgIRAOltkfkMF2l6F_YYoQ_SnTIwCgYIKoZIzj0EAwIwMTEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEOMAwGA1UEAxMFYWxpY2UwHhcNMjIwODExMjEwNTU3WhcNMjMxMDA2MjEwNTU3WjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABOwkAz0Js8ZHnyxX5NYbGrp-PuWyoXOz98XHNS16l_8hr3Mb7yjN0j3LReKZj9zUR6nUaj0c-IU5GIGc3x3KpgGjgcUwgcIwDgYDVR0PAQH_BAQDAgKkMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA8GA1UdEwEB_wQFMAMBAf8wHQYDVR0OBBYEFJS5FSPqtw-oJZybttUM-pFXFfUiMGsGA1UdEQRkMGKCBWFsaWNlgglsb2NhbGhvc3SCBWFsaWNlgg5wb2xhci1uNC1hbGljZYIEdW5peIIKdW5peHBhY2tldIIHYnVmY29ubocEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcErBQAAjAKBggqhkjOPQQDAgNHADBEAiBycJKvte_IvaTbhahwa65Ux294bwtNAmHSRLV8Bnj93gIgBulGD39ZwK4L-0s8evyG1d7su542Thdh7er5kCgpZoc&macaroon=AgEDbG5kAvgBAwoQCIbSxfenIg62ObaXYAPFehIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgayjXw6gX012qd_nMc2BXVkqNxTBv2mORACvJnwX7bNo',
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
      res.send(response);
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
