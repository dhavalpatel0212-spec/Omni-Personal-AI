import { schema, OutputType } from "./packages_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import superjson from 'superjson';
import { nanoid } from "nanoid";

const airlines = [
  { name: "British Airways", logo: "/logos/british-airways.svg" },
  { name: "EasyJet", logo: "/logos/easyjet.svg" },
  { name: "Virgin Atlantic", logo: "/logos/virgin-atlantic.svg" },
];

const hotelChains = [
  { name: "Hilton", image: "/images/hotels/hilton.jpg" },
  { name: "Marriott", image: "/images/hotels/marriott.jpg" },
  { name: "Premier Inn", image: "/images/hotels/premier-inn.jpg" },
];

const allAmenities = ["Free WiFi", "Pool", "Spa", "Gym", "Free Breakfast"];

function generateMockPackages(destination: string, budget?: number): OutputType {
  const results = [];
  const count = Math.floor(Math.random() * 5) + 4; // 4 to 8 results

  for (let i = 0; i < count; i++) {
    const hotel = hotelChains[Math.floor(Math.random() * hotelChains.length)];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
    const numAmenities = Math.floor(Math.random() * 3) + 2; // 2 to 4 amenities
    const amenities = [...allAmenities].sort(() => 0.5 - Math.random()).slice(0, numAmenities);
    
    let totalPrice = Math.floor(Math.random() * 1500) + 500; // £500 - £2000
    if (budget) {
      // Ensure some results are within budget
      totalPrice = Math.floor(Math.random() * (budget * 0.4)) + (budget * 0.6);
    }

    results.push({
      id: nanoid(),
      title: `Amazing Getaway to ${destination}`,
      hotelName: `${hotel.name} ${destination}`,
      hotelImageUrl: hotel.image,
      hotelRating: parseFloat(rating),
      airlineName: airline.name,
      airlineLogoUrl: airline.logo,
      inclusions: ["Return Flights", "Hotel Stay", ...amenities.slice(0, 2)],
      totalPrice,
      bookNowUrl: `https://www.booking.com/deals`,
    });
  }

  // Sort by price
  results.sort((a, b) => a.totalPrice - b.totalPrice);

  return results;
}

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const mockPackages = generateMockPackages(input.destination, input.budget);

    return new Response(superjson.stringify(mockPackages satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Package search error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}