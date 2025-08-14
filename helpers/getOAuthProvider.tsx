import { OAuthProviderInterface, OAuthProviderType } from "./OAuthProvider";
import { FlootOAuthProvider } from "./FlootOAuthProvider";
import { GoogleCalendarOAuthProvider } from "./GoogleCalendarOAuthProvider";

export function getOAuthProvider(
  providerName: OAuthProviderType,
  redirectUri: string
): OAuthProviderInterface {
  switch (providerName) {
    case "floot":
      return new FlootOAuthProvider(redirectUri);
    case "google_calendar":
      return new GoogleCalendarOAuthProvider(redirectUri);
    // add more providers here
    default:
      throw new Error(`Unsupported OAuth provider: ${providerName}. Currently supported providers are: 'floot', 'google_calendar'.`);
  }
}
