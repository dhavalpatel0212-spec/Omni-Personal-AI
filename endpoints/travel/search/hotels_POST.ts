import { schema, OutputType } from "./hotels_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import superjson from 'superjson';
import { nanoid } from "nanoid";

const hotelChains = [
  { name: "Premier Inn", image: "/images/hotels/premier-inn.jpg" },
  { name: "Travelodge", image: "/images/hotels/travelodge.jpg" },
  { name: "Hilton", image: "/images/hotels/hilton.jpg" },
  { name: "Marriott", image: "/images/hotels/marriott.jpg" },
  { name: "The Ritz", image: "/images/hotels/ritz.jpg" },
  { name: "The Savoy", image: "/images/hotels/savoy.jpg" },
];

const allAmenities = ["Free WiFi", "Pool", "Spa", "Gym", "Free Breakfast", "Parking", "Pet Friendly"];

function generateMockHotels(destination: string): OutputType {
  const results = [];
  const count = Math.floor(Math.random() * 10) + 8; // 8 to 17 results

  for (let i = 0; i < count; i++) {
    const hotel = hotelChains[Math.floor(Math.random() * hotelChains.length)];
    const pricePerNight = Math.floor(Math.random() * 450) + 50; // £50 - £500
    const rating = (Math.random() * 2.5 + 2.5).toFixed(1); // 2.5 to 5.0
    
    const numAmenities = Math.floor(Math.random() * 4) + 2; // 2 to 5 amenities
    const amenities = [...allAmenities].sort(() => 0.5 - Math.random()).slice(0, numAmenities);

    results.push({
      id: nanoid(),
      name: `${hotel.name} ${destination}`,
      imageUrl: hotel.image,
      rating: parseFloat(rating),
      pricePerNight,
      amenities,
      location: `Central ${destination}`,
      bookNowUrl: `https://www.booking.com/`,
    });
  }

  // Sort by rating
  results.sort((a, b) => b.rating - a.rating);

  return results;
}

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const mockHotels = generateMockHotels(input.destination);

    return new Response(superjson.stringify(mockHotels satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Hotel search error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}