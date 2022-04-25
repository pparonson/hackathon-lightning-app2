export interface Post {
  id: number;
  username: string;
  title: string;
  customerId: string;
  agentId: string;
  invoice: string;
  votes: number;
  paid: boolean;
  // signature: string;
  // pubkey: string;
  // verified: boolean;
}

export const SocketEvents = {
  postUpdated: 'post-updated',
  invoicePaid: 'invoice-paid',
};
