export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface Booking {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  bookerName: string;
}

export interface NewBooking {
  roomId: string;
  startsAt: string;
  endsAt: string;
  bookerName: string;
}
