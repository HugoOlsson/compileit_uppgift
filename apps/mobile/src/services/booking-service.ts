import type {
  Booking,
  BookingsQuery,
  CancelBookingRequest,
  CreateBookingRequest,
  CreateBookingResponse,
  Room,
} from '@/types/booking';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function getResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const error = (await response.json()) as { message?: string };
  throw new ApiError(response.status, error.message ?? 'API request failed.');
}

export async function getRooms() {
  const response = await fetch(`${API_URL}/rooms`);
  return getResponse<Room[]>(response);
}

export async function getBookings(query: BookingsQuery) {
  const searchParams = new URLSearchParams({
    startsAt: query.startsAt,
    endsAt: query.endsAt,
  });

  const response = await fetch(`${API_URL}/bookings?${searchParams}`);
  return getResponse<Booking[]>(response);
}

export async function createBooking(
  request: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  const response = await fetch(`${API_URL}/bookings`, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return getResponse<CreateBookingResponse>(response);
}

export async function cancelBooking(request: CancelBookingRequest) {
  const response = await fetch(`${API_URL}/bookings/${request.bookingId}`, {
    body: JSON.stringify({ cancellationToken: request.cancellationToken }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });

  if (!response.ok) {
    await getResponse(response);
  }
}
