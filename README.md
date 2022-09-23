# Coin Wizard

Open your browser and navigate to `http://localhost:3000`.

Notes:
1. In the file backend\routes.ts, under the function postInvoice, update lndconnectUri to Admin's LND Connect Admin Macaroon from Polar
2. Clear out db.json for both posts and connections
3. Polar network:
	1. If Alice is paying Bob, there must be an outgoing channel from Alice to Bob.
	2. Just for reference, at the time this is working, we had one backend node for Alice and another for Bob
