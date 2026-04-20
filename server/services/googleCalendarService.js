const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.getAuthUrl = (state) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state, // Pass role/context through state
    prompt: 'consent'
  });
};

exports.getTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

exports.getUserInfo = async (tokens) => {
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
};

exports.createMeetLink = async (refreshToken, bookingData) => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: `TutorConnect Session: ${bookingData.subject}`,
      description: `Live session between Tutor and ${bookingData.studentName}`,
      start: {
        dateTime: bookingData.startDateTime, // ISO string
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: bookingData.endDateTime, // ISO string
        timeZone: 'Asia/Kolkata',
      },
      conferenceData: {
        createRequest: {
          requestId: `TC-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      attendees: [
        { email: bookingData.studentEmail },
      ],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.data.hangoutLink;
  } catch (error) {
    console.error('Google Calendar Error:', error);
    throw error;
  }
};
