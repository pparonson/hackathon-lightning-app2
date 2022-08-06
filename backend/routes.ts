import fs from 'fs';
import { Request, Response } from 'express';
import nodeManager from './node-manager';
import db from './posts-db';
import { createRouterRpc, SendPaymentRequest } from '@radar/lnrpc';
// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

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
 * POST /api/posts/:id/upvote
 */
// export const upvotePost = async (req: Request, res: Response) => {
// const { id } = req.params;
// const { hash } = req.body;

// validate that a invoice hash was provided
// if (!hash) throw new Error('hash is required');
// find the post
// const post = db.getPostById(parseInt(id));
// if (!post) throw new Error('Post not found');
// find the node that made this post
// const node = db.getNodeByPubkey(post.pubkey);
// if (!node) throw new Error('Node not found for this post');

// const rpc = nodeManager.getRpc(node.token);
// const rHash = Buffer.from(hash, 'base64');
// const { settled } = await rpc.lookupInvoice({ rHash });
// if (!settled) {
// throw new Error('The payment has not been paid yet!');
// }

// db.upvotePost(post.id);
// res.send(post);
// };

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

/**
 * POST /api/posts/:id/verify
 */
// export const verifyPost = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { token } = req.body;
//   // find the post
//   const post = db.getPostById(parseInt(id));
//   if (!post) throw new Error('Post not found');
//   // find the node that's verifying this post
//   const verifyingNode = db.getNodeByToken(token);
//   if (!verifyingNode) throw new Error('Your node not found. Try reconnecting.');

//   if (post.pubkey === verifyingNode.pubkey)
//     throw new Error('You cannot verify your own posts!');

//   const rpc = nodeManager.getRpc(verifyingNode.token);
//   const msg = Buffer.from(post.content).toString('base64');
//   const { signature } = post;
//   const { pubkey, valid } = await rpc.verifyMessage({ msg, signature });

//   if (!valid || pubkey !== post.pubkey) {
//     throw new Error('Verification failed! The signature is invalid.');
//   }

//   db.verifyPost(post.id);
//   res.send(post);
// };

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
export const postInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  // find the post
  // const post = db.getPostById(parseInt(id));
  // if (!post) throw new Error('Post not found');
  // find the node that made this post
  // const node = db.getNodeByPubkey(post.pubkey);
  // if (!node) throw new Error('Node not found for this post');

  const host = '127.0.0.1:10001';
  const cert =
    '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a4343416332674177494241674952414a6b56434d2f3058437749554f7241584e4576464d4577436759494b6f5a497a6a3045417749774d5445660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a575167593256796444454f4d4177474131554541784d4659577870593255770a4868634e4d6a49774e4449774d54517a4f544d315768634e4d6a4d774e6a45314d54517a4f544d31576a41784d523877485159445651514b45785a73626d51670a595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a54425a4d424d4742797147534d3439416745470a43437147534d343941774548413049414244416c397761737968644f505654454433474579646b4c535235647268756243743247433939306c42646d703777390a4431345835364b376f72792b2f463471375772314d4d6243372f546d546c586b796c6941764a696a676355776763497744675944565230504151482f424151440a41674b6b4d424d47413155644a51514d4d416f47434373474151554642774d424d41384741315564457745422f7751464d414d4241663877485159445652304f0a42425945464a6446314c7a6154646367566c465435444c30687858584c6b67354d477347413155644551526b4d474b434257467361574e6c67676c7362324e680a62476876633353434257467361574e6c6767357762327868636931754d79316862476c6a5a594945645735706549494b64573570654842685932746c644949480a596e566d59323975626f6345667741414159635141414141414141414141414141414141414141414159634572424941416a414b42676771686b6a4f505151440a41674e4841444245416942526a582b71696867346d686a365a7474456f646172635a6e2b6b7a2f536d5047734c38706d746b6d3965674967415a655551376d6f0a79756155312f67676c7431776b3271514c6b586175666d47682b735031614e426732413d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a';
  const macaroon =
    '0201036c6e6402f801030a10490aa0750fae2f2bce6f34b8065fe8d81201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006206d5a99ce9a989c3c982960b0d4f7caf723746ea738c6c3539a55398424fab957';
  // "token": "cfcbec13723e4ae3b8fdcb814ad45a97",
  // "pubkey": "032cf52a69c92f81c4692db977cade41ec59c6702dd69f066f71524fea006851ad"

  let config = {
    server: host,
    cert: Buffer.from(cert, 'hex').toString('utf-8'), // utf8 encoded certificate
    macaroon, // hex encoded macaroon
  };

  let payment_request = req.body.paymentRequest;

  (async () => {
    const routerRpc = await createRouterRpc(config);

    // All requests are promisified and typed
    // const { confirmedBalance } = await lnRpcClient.walletBalance();

    // ...and you're off!
    // console.log(confirmedBalance);

    // subscribe to LND server events
    // const subscriber = await lnRpcClient.subscribeInvoices();
    // subscriber.on('data', invoice => {
    //   console.log(invoice); // do something with invoice event
    // });

    // const { id } = req.params;
    // find the post
    // const post = db.getPostById(parseInt(id));
    // if (!post) throw new Error('Post not found');
    // find the node that made this post

    // const tkn = 'cfcbec13723e4ae3b8fdcb814ad45a97';
    // const node = db.getNodeByToken(tkn);
    // if (!node) throw new Error('Node not found with this token');

    // create a payment to the poster's node
    // const routerRpc = nodeManager.getRpc(node.token);

    const request: SendPaymentRequest = <SendPaymentRequest>{
      payment_request,
      timeout_seconds: 15000,
    };

    // const stream = routerRpc.sendPaymentV2(request);

    // stream.on('data', payment => {
    //   console.log(`payment: ${payment}`);
    //   // this.emit(NodeEvents.invoicePaid, { hash, amount, pubkey });
    // });

    // res.send({
    //   payreq: inv.paymentRequest,
    //   hash: (inv.rHash as Buffer).toString('base64'),
    //   amount,
    // });

    let call = routerRpc.sendPaymentV2(request);
    call.on('data', function (response) {
      // A response was received from the server.
      console.log(response);
    });
    call.on('status', function (status) {
      // The current status of the stream.
    });
    call.on('end', function () {
      // The server has closed the stream.
    });
  })();
};

// /**
//  * POST /api/posts/:id/invoice
//  */
export const postInvoice2 = async (req: Request, res: Response) => {
  console.log('BEGIN postInvoice2');
  const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };
  const packageDefinition = protoLoader.loadSync(
    ['lightning.proto', 'routerrpc/router.proto'],
    loaderOptions,
  );
  const routerrpc = grpc.loadPackageDefinition(packageDefinition).routerrpc;
  // const macaroon = fs.readFileSync("LND_DIR/data/chain/bitcoin/simnet/admin.macaroon").toString('hex');
  const macaroon = fs
    .readFileSync(
      '/home/brightbug/.polar/networks/3/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
    )
    .toString('hex');
  process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
  // const lndCert = fs.readFileSync('LND_DIR/tls.cert');
  const lndCert = fs.readFileSync(
    '/home/brightbug/.polar/networks/3/volumes/lnd/alice/tls.cert',
  );
  const sslCreds = grpc.credentials.createSsl(lndCert);
  const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (
    args,
    callback,
  ) {
    let metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon);
    callback(null, metadata);
  });
  let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
  // let router = new routerrpc.Router('localhost:10009', creds);
  let router = new routerrpc.Router('127.0.0.1:10001', creds);

  let request = {
    // dest: <bytes>,
    // amt: <int64>,
    // amt_msat: <int64>,
    // payment_hash: <bytes>,
    // final_cltv_delta: <int32>,
    // payment_addr: <bytes>,
    // payment_request: <string>,
    payment_request: req.body.paymentRequest,
    // timeout_seconds: <int32>,
    timeout_seconds: 30000,
    // fee_limit_sat: <int64>,
    // fee_limit_msat: <int64>,
    // outgoing_chan_id: <uint64>,
    // outgoing_chan_ids: <array uint64>,
    // last_hop_pubkey: <bytes>,
    // cltv_limit: <int32>,
    // route_hints: <array RouteHint>,
    // dest_custom_records: <array DestCustomRecordsEntry>,
    // allow_self_payment: <bool>,
    // dest_features: <array FeatureBit>,
    // max_parts: <uint32>,
    // no_inflight_updates: <bool>,
    // max_shard_size_msat: <uint64>,
    // amp: <bool>,
    // time_pref: <double>,
  };

  let call = router.sendPaymentV2(request);
  call.on('data', function (response) {
    // A response was received from the server.
    console.log(response);
  });
  call.on('status', function (status) {
    // The current status of the stream.
  });
  call.on('end', function () {
    // The server has closed the stream.
  });
};
