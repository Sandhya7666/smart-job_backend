const express = require('express');
const router = express.Router();
const oAuth2Client = require('./googleAuth');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
];

router.get('/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // You can save these tokens in DB linked to recruiter user
    console.log("Access Token: ", tokens.access_token);

    res.send('Authentication successful. You can now schedule interviews!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
