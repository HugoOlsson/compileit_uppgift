import type { CreateBookingRequest, CreateBookingResponse } from '@/types/booking';

export async function createBooking(
  request: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  const id = Math.random().toString(36).slice(2, 10);

  // Replace this return value with a fetch call when the backend is available.
  return {
    booking: {
      id,
      ...request,
      createdAt: new Date().toISOString(),
    },
    cancellationToken: Math.random().toString(36).slice(2),
  };
}
