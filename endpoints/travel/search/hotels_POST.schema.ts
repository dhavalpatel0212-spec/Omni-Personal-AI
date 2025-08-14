import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  destination: z.string().min(1, "Destination is required"),
  checkIn: z.date({ required_error: "Check-in date is required" }),
  checkOut: z.date({ required_error: "Check-out date is required" }),
  travelers: z.number().int().min(1, "At least one traveler is required"),
}).refine(data => data.checkOut > data.checkIn, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

export type InputType = z.infer<typeof schema>;

export type HotelResult = {
  id: string;
  name: string;
  imageUrl: string;
  rating: number; // e.g., 4.5
  pricePerNight: number; // in GBP
  amenities: string[];
  location: string;
  bookNowUrl: string;
};

export type OutputType = HotelResult[];

export const postTravelSearchHotels = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/travel/search/hotels`, {
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
    throw new Error((errorObject as any).error || "Hotel search failed");
  }
  return superjson.parse<OutputType>(await response.text());
};