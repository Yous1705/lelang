export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  start_price: number;
  highest_bid: number;
  highest_bidder_id: number | null;
  seller_name: string | null;
  seller_info: string | null;
  organizer_name: string | null;
  organizer_info: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface AuctionImage {
  id: number;
  auction_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Bidder {
  id: number;
  auction_id: number;
  user_id: number | null;
  bidder_name: string;
  bidder_phone?: string;
  bid_amount: number;
  bid_count: number;
  created_at: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  bid_amount: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: "bid_outbid" | "auction_ending" | "auction_ended" | "bid_placed";
  title: string;
  message: string;
  auction_id: number;
  read: boolean;
  created_at: string;
}
