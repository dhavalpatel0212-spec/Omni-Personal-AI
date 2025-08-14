import {
  OAuthProviderInterface,
  OAuthTokens,
  StandardUserData,
  OAuthError,
} from './OAuthProvider';
import { nanoid } from 'nanoid';
import { GOOGLE_CLIENT_ID } from './_publicConfigs';

export class GoogleCalendarOAuthProvider implements OAuthProviderInterface {
  name = 'google_calendar' as const;
  clientId: string;
  clientSecret: string;
  authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  tokenUrl = 'https://oauth2.googleapis.com/token';
  userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
  scopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  redirectUri: string;

  constructor(redirectUri: string) {
    this.redirectUri = redirectUri;
    
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Calendar OAuth not configured: GOOGLE_CLIENT_ID is missing from public configs');
    }
    
    if (!clientSecret) {
      throw new Error('Google Calendar OAuth not configured: GOOGLE_CLIENT_SECRET environment variable is missing');
    }
    
    this.clientId = GOOGLE_CLIENT_ID;
    this.clientSecret = clientSecret;
  }

  generateAuthorizationUrl(state: string) {
    const codeVerifier = nanoid(128);
    const url = new URL(this.authUrl);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scopes);
    url.searchParams.set('state', state);
    url.searchParams.set('access_type', 'offline'); // To get a refresh token
    url.searchParams.set('prompt', 'consent'); // To ensure refresh token is always sent
    
    // PKCE is recommended by Google
    // For simplicity in this implementation, we are omitting it, but it should be added in a real scenario.
    // const code_challenge = await pkce.createChallenge(codeVerifier);
    // url.searchParams.set('code_challenge', code_challenge);
    // url.searchParams.set('code_challenge_method', 'S256');

    return { url: url.toString(), codeVerifier };
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    // if (codeVerifier) {
    //   body.append('code_verifier', codeVerifier);
    // }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new OAuthError(
        'TOKEN_EXCHANGE_FAILED',
        `Failed to exchange code for tokens: ${errorData.error_description || response.statusText}`,
        this.name,
        errorData
      );
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
      tokenType: tokens.token_type,
    };
  }

  async fetchUserInfo(tokens: OAuthTokens): Promise<any> {
    const response = await fetch(this.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new OAuthError(
        'USER_INFO_FETCH_FAILED',
        `Failed to fetch user info: ${errorData.error?.message || response.statusText}`,
        this.name,
        errorData
      );
    }

    return response.json();
  }

  mapUserData(userInfo: any): StandardUserData {
    return {
      providerUserId: userInfo.sub,
      email: userInfo.email,
      displayName: userInfo.name || userInfo.email,
      avatarUrl: userInfo.picture || null,
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new OAuthError(
        'TOKEN_EXCHANGE_FAILED',
        `Failed to refresh token: ${errorData.error_description || response.statusText}`,
        this.name,
        errorData
      );
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: refreshToken, // Google doesn't always return a new refresh token
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
      tokenType: tokens.token_type,
    };
  }
}