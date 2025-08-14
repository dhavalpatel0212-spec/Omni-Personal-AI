import { schema, OutputType } from "./flights_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import superjson from 'superjson';
import { nanoid } from "nanoid";

const airlines = [
  { name: "British Airways", logo: "/logos/british-airways.svg" },
  { name: "Ryanair", logo: "/logos/ryanair.svg" },
  { name: "EasyJet", logo: "/logos/easyjet.svg" },
  { name: "Virgin Atlantic", logo: "/logos/virgin-atlantic.svg" },
  { name: "Lufthansa", logo: "/logos/lufthansa.svg" },
];

function generateMockFlights(departDate: Date, returnDate?: Date): OutputType {
  const results = [];
  const count = Math.floor(Math.random() * 10) + 5; // 5 to 14 results

  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const price = Math.floor(Math.random() * 800) + 100; // £100 - £900
    const stops = Math.random() > 0.7 ? 1 : 0;
    const durationHours = Math.floor(Math.random() * 10) + 2;
    const durationMinutes = Math.floor(Math.random() * 60);

    const departHour = Math.floor(Math.random() * 24);
    const departMinute = Math.floor(Math.random() * 60);
    const departTime = new Date(departDate);
    departTime.setHours(departHour, departMinute);

    const arriveTime = new Date(departTime.getTime() + (durationHours * 60 + durationMinutes) * 60000);

    results.push({
      id: nanoid(),
      airline: airline.name,
      airlineLogoUrl: airline.logo,
      departTime: departTime.toISOString(),
      arriveTime: arriveTime.toISOString(),
      duration: `${durationHours}h ${durationMinutes}m`,
      price,
      stops,
      bookNowUrl: `https://www.skyscanner.net/`,
    });
  }

  // Sort by price
  results.sort((a, b) => a.price - b.price);

  return results;
}

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const mockFlights = generateMockFlights(input.departDate, input.returnDate);

    return new Response(superjson.stringify(mockFlights satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}