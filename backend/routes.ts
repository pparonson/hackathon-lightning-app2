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
export const postInvoice = async (req: Request, res: Response) => {
  console.log('BEGIN postInvoice');

  let request = {
    payment_request: req.body.paymentRequest,
    timeout_seconds: 30000,
  };
  const grpc = new LndGrpc({
    lndconnectUri:
      'lndconnect://127.0.0.1:10001?cert=MIICJjCCAcygAwIBAgIQQjtsPC7wc7P4_6dr2kWNpjAKBggqhkjOPQQDAjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTAeFw0yMjA4MDYwMTA5NTFaFw0yMzEwMDEwMTA5NTFaMDExHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxDjAMBgNVBAMTBWFsaWNlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAECrEIZX53GVY4Eh75XmAhXH66wg3zVZVVy_oQi1EcsPt6bY3KGZZ4jH4tbTPj1Kgd2faRSIf6PC6mhlvaoaIDnqOBxTCBwjAOBgNVHQ8BAf8EBAMCAqQwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDwYDVR0TAQH_BAUwAwEB_zAdBgNVHQ4EFgQUcY_qHI5UDjKHUq7haX24zFDZkEEwawYDVR0RBGQwYoIFYWxpY2WCCWxvY2FsaG9zdIIFYWxpY2WCDnBvbGFyLW41LWFsaWNlggR1bml4ggp1bml4cGFja2V0ggdidWZjb25uhwR_AAABhxAAAAAAAAAAAAAAAAAAAAABhwSsEgAGMAoGCCqGSM49BAMCA0gAMEUCIGcSxREMPNa_A-ycXR7NeAoK--ghhZcr4ytyZXpR83lUAiEA4RFv91dL-CYd1pFH5ZBCJS5RgvPG0zky4-84dEuNefE&macaroon=AgEDbG5kAvgBAwoQB5X5RTFnsXFDNj9ZpeflKBIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgS84qQ_Cq92Trkzq3YZX60NNlZiSl-Mk_3p1ArUxd1VA',
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
};

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
      'lndconnect://127.0.0.1:10001?cert=MIICJjCCAcygAwIBAgIQQjtsPC7wc7P4_6dr2kWNpjAKBggqhkjOPQQDAjAxMR8wHQYDVQQKExZsbmQgYXV0b2dlbmVyYXRlZCBjZXJ0MQ4wDAYDVQQDEwVhbGljZTAeFw0yMjA4MDYwMTA5NTFaFw0yMzEwMDEwMTA5NTFaMDExHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxDjAMBgNVBAMTBWFsaWNlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAECrEIZX53GVY4Eh75XmAhXH66wg3zVZVVy_oQi1EcsPt6bY3KGZZ4jH4tbTPj1Kgd2faRSIf6PC6mhlvaoaIDnqOBxTCBwjAOBgNVHQ8BAf8EBAMCAqQwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDwYDVR0TAQH_BAUwAwEB_zAdBgNVHQ4EFgQUcY_qHI5UDjKHUq7haX24zFDZkEEwawYDVR0RBGQwYoIFYWxpY2WCCWxvY2FsaG9zdIIFYWxpY2WCDnBvbGFyLW41LWFsaWNlggR1bml4ggp1bml4cGFja2V0ggdidWZjb25uhwR_AAABhxAAAAAAAAAAAAAAAAAAAAABhwSsEgAGMAoGCCqGSM49BAMCA0gAMEUCIGcSxREMPNa_A-ycXR7NeAoK--ghhZcr4ytyZXpR83lUAiEA4RFv91dL-CYd1pFH5ZBCJS5RgvPG0zky4-84dEuNefE&macaroon=AgEDbG5kAvgBAwoQB5X5RTFnsXFDNj9ZpeflKBIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgS84qQ_Cq92Trkzq3YZX60NNlZiSl-Mk_3p1ArUxd1VA',
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
};
