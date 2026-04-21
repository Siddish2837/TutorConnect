const { google } = require('googleapis');

// Helper to resolve the backend base URL
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '');
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  return `http://localhost:${process.env.PORT || 5000}`;
};

const getRedirectUri = () => `${getBackendUrl()}/api/auth/google/callback`;

const createOAuth2Client = (redirectUri) => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

exports.getAuthUrl = (state) => {
  const redirectUri = getRedirectUri();
  const client = createOAuth2Client(redirectUri);

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    state: state, // Pass role/context through state
    prompt: 'consent',
    redirect_uri: redirectUri
  });
};

exports.getTokens = async (code) => {
  const client = createOAuth2Client(getRedirectUri());
  const { tokens } = await client.getToken(code);
  return tokens;
};

exports.getUserInfo = async (tokens) => {
  const client = createOAuth2Client(getRedirectUri());
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();
  return data;
};
