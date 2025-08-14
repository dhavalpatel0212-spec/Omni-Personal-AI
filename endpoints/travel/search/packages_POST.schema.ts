import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  destination: z.string().min(1, "Destination is required"),
  departDate: z.date({ required_error: "Departure date is required" }),
  returnDate: z.date({ required_error: "Return date is required" }),
  travelers: z.number().int().min(1, "At least one traveler is required"),
  budget: z.number().positive("Budget must be a positive number").optional(),
}).refine(data => data.returnDate > data.departDate, {
  message: "Return date must be after departure date",
  path: ["returnDate"],
});

export type InputType = z.infer<typeof schema>;

export type PackageResult = {
  id: string;
  title: string;
  hotelName: string;
  hotelImageUrl: string;
  hotelRating: number;
  airlineName: string;
  airlineLogoUrl: string;
  inclusions: string[];
  totalPrice: number; // in GBP
  bookNowUrl: string;
};

export type OutputType = PackageResult[];

export const postTravelSearchPackages = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const response = await fetch(`/_api/travel/search/packages`, {
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
    throw new Error((errorObject as any).error || "Package search failed");
  }
  return superjson.parse<OutputType>(await response.text());
};