import fs from 'fs';
import { Request, Response } from 'express';
import nodeManager from './node-manager';
import db from './posts-db';
import { createRouterRpc } from '@radar/lnrpc';
// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');
// import grpc from '@grpc/grpc-js';
// import protoLoader from '@grpc/proto-loader';
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
  // const { token, title, content } = req.body;
  const { username, title, customerId, agentId, invoice } = req.body;
  // const rpc = nodeManager.getRpc(token);

  // const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  // lnd requires the message to sign to be base64 encoded
  // const msg = Buffer.from(content).toString('base64');
  // sign the message to obtain a signature
  // const { signature } = await rpc.signMessage({ msg });

  // const post = await db.createPost(alias, title, content, signature, pubkey);
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
// export const postInvoice = async (req: Request, res: Response) => {
// const { id } = req.params;
// find the post
// const post = db.getPostById(parseInt(id));
// if (!post) throw new Error('Post not found');
// find the node that made this post
// const node = db.getNodeByPubkey(post.pubkey);
// if (!node) throw new Error('Node not found for this post');

// create an invoice on the poster's node
// const rpc = nodeManager.getRpc(node.token);
// const amount = 100;
// const inv = await rpc.addInvoice({ value: amount.toString() });
// res.send({
//   payreq: inv.paymentRequest,
//   hash: (inv.rHash as Buffer).toString('base64'),
//   amount,
// });
// };

// /**
//  * POST /api/posts/:id/invoice
//  */
export const postInvoice = async (req: Request, res: Response) => {};

// /**
//  * POST /api/posts/:id/invoice
//  */
export const postInvoice2 = async (req: Request, res: Response) => {
  console.log('BEGIN postInvoice2');

  let request = {
    payment_request: req.body.paymentRequest,
    timeout_seconds: 30000,
  };
  const grpc = new LndGrpc({
    lndconnectUri:
      'lndconnect://127.0.0.1:10004?cert=MIICITCCAcegAwIBAgIQNmO8DzAbD9X15rvqkf9w-DAKBggqhkjOPQQDAjAwMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ0wCwYDVQQDEwRkYXZlMB4XDTIyMDQyMTE0MjQwNloXDTIzMDYxNjE0MjQwNlowMDEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDENMAsGA1UEAxMEZGF2ZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABAbs8DH7SuKSv8i1Gyvt1eazaDXmpZ-GvphX0FVswIAevOrJgIBVSNrbgEXtIb_0qm9bx6RknFdG63Ea_osDYzqjgcIwgb8wDgYDVR0PAQH_BAQDAgKkMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA8GA1UdEwEB_wQFMAMBAf8wHQYDVR0OBBYEFC4KQjEav20lrrpjWrCBwSLtB6QqMGgGA1UdEQRhMF-CBGRhdmWCCWxvY2FsaG9zdIIEZGF2ZYINcG9sYXItbjMtZGF2ZYIEdW5peIIKdW5peHBhY2tldIIHYnVmY29ubocEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcErBIABjAKBggqhkjOPQQDAgNIADBFAiAuefass3uy2jF3BVcKwsN5PE1RDV6ek3ECmhaGGN5T6gIhAIkkpKic4PWgr8PTo8KGRiC-CfATkvNxPkxDZ0Pe_0Vr&macaroon=AgEDbG5kAvgBAwoQcoS9HCI0LzCTsiJYtPWGCRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgw9lXqz04wPmwDG5AKm00usU1NoPx3nwTS7EA37l0AxI',
  });

  await grpc.connect();

  // Do something if we detect that the wallet is locked.
  grpc.on(`locked`, () => console.log('wallet locked!'));

  // Do something when the wallet gets unlocked.
  grpc.on(`active`, () => console.log('wallet unlocked!'));

  // Do something when the connection gets disconnected.
  grpc.on(`disconnected`, () => console.log('disconnected from lnd!'));

  console.log(grpc.state);

  let call = grpc.services.Router.sendPaymentV2(request);
  call.on('data', function (response) {
    // A response was received from the server.
    console.log(response);
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

  // const loaderOptions = {
  //   keepCase: true,
  //   longs: String,
  //   enums: String,
  //   defaults: true,
  //   oneofs: true,
  // };
  // const packageDefinition = protoLoader.loadSync(
  //   ['lightning.proto', 'routerrpc/router.proto'],
  //   loaderOptions,
  // );
  // const routerrpc = grpc.loadPackageDefinition(packageDefinition).routerrpc;
  // // const macaroon = fs.readFileSync("LND_DIR/data/chain/bitcoin/simnet/admin.macaroon").toString('hex');
  // const macaroon = fs
  //   .readFileSync(
  //     '/home/brightbug/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
  //   )
  //   .toString('hex');
  // process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
  // // const lndCert = fs.readFileSync('LND_DIR/tls.cert');
  // const lndCert = fs.readFileSync(
  //   '/home/brightbug/.polar/networks/3/volumes/lnd/alice/tls.cert',
  // );
  // const sslCreds = grpc.credentials.createSsl(lndCert);
  // const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (
  //   args,
  //   callback,
  // ) {
  //   let metadata = new grpc.Metadata();
  //   metadata.add('macaroon', macaroon);
  //   callback(null, metadata);
  // });
  // let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
  // // let router = new routerrpc.Router('localhost:10009', creds);
  // let router = new routerrpc.Router('127.0.0.1:10001', creds);

  // let request = {
  //   payment_request: req.body.paymentRequest,
  //   timeout_seconds: 30000,
  // };

  // let call = router.sendPaymentV2(request);
  // call.on('data', function (response) {
  //   // A response was received from the server.
  //   console.log(response);
  // });
  // call.on('status', function (status) {
  //   // The current status of the stream.
  // });
  // call.on('end', function () {
  //   // The server has closed the stream.
  // });
};
