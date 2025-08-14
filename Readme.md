# Omni Personal Assistant
        
I’d like to build an AI-powered personal assistant that simplifies daily planning, goal tracking, shopping, mood logging, travel planning, and more, all driven by OpenAI’s GPT-4o.

Key Features to Develop 
* AI Chat Assistant 
* Goal Management 
* Smart Shopping List 
* Calendar Integration 
* Mood Tracking 
* Travel Planning 
* Push Notifications 
* Photo/Vision AI 
* User Profile & Personalization

Features should include 
* AI-generated action items 
* Progress tracking and motivational dashboard 
* AI voice commands + image recognition for item input 
* Category grouping, quantities, swipe-to-complete 
* Offline support 
* Sync with Apple iCloud, Google, Yahoo calendars 
* AI-powered event creation via natural language 
* Conflict detection, category tagging, color coding 
* Emoji-based logging with notes 
* Streak system, historical trends, AI mood pattern insights 
* Gamified rewards and milestones 
* Budget, destination, and traveler setup 
* AI travel suggestions 
* Real-time itinerary and booking management 
* Daily summaries, reminders for goals, calendar, and travel 
* Quiet hours and customizable alerts 
* Camera and gallery photo input 
* GPT-4o Vision to extract goals, shopping items, or documents 
* Batch recognition and editing before saving 
* Avatar 
* Personal values, shopping, and notification preferences 
* Apple/Google/email login

I will need full UI/UX support — I’m looking for a clean, modern, mobile-first experience that aligns with the app’s AI and productivity themes.
Suggested branding direction 
* Color palette: Calm tech 
* Fonts: Sora, Inter, or SF Pro 
* Logo: Minimal and AI-focused 

The app should integrate with Skyscanner and Booking.com APIs. 
I will provide all API/backend services integrated with OpenAI.

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, request a `pg_dump` from support, upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
