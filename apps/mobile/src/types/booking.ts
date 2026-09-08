export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface AvailabilitySlot {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
}

export interface BookingsQuery {
  startsAt: string;
  endsAt: string;
}

export interface CalendarData {
  rooms: Room[];
  bookings: Booking[];
  dateWindows: Date[][];
}

export interface Booking {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  bookerName: string;
}

export interface CreateBookingRequest {
  roomId: string;
  startsAt: string;
  endsAt: string;
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

export interface SavedBooking extends Booking {
  roomName: string;
  cancellationToken: string;
}
