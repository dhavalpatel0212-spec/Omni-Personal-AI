import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  from: z.string().min(1, "Departure location is required"),
  to: z.string().min(1, "Destination is required"),
  departDate: z.date({ required_error: "Departure date is required" }),
  returnDate: z.date().optional(),
  travelers: z.number().int().min(1, "At least one traveler is required"),
  tripType: z.enum(['one-way', 'return']),
});

export type InputType = z.infer<typeof schema>;

export type FlightResult = {
  id: string;
  airline: string;
  airlineLogoUrl: string;
  departTime: string; // ISO date string
  arriveTime: string; // ISO date string
  duration: string; // e.g., "7h 30m"
  price: number; // in GBP
  stops: number;
  bookNowUrl: string;
};

export type OutputType = FlightResult[];

export const postTravelSearchFlights = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/travel/search/flights`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
    throw new Error((errorObject as any).error || "Flight search failed");
  }
  return superjson.parse<OutputType>(await response.text());
};