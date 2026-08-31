export type IsoDateTime = string;

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface AvailabilitySlot {
  id: string;
  roomId: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
}

export interface AvailabilityQuery {
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  roomIds?: string[];
}

export interface AvailabilityResponse {
  rooms: Room[];
  slots: AvailabilitySlot[];
}

export interface Booking {
  id: string;
  roomId: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  bookerName: string;
  createdAt: IsoDateTime;
}

export interface CreateBookingRequest {
  roomId: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  bookerName: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  cancellationToken: string;
}

export interface CancelBookingRequest {
  bookingId: string;
  cancellationToken: string;
}
