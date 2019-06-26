// Function sending a welcome email to a user when onboarding 
// or deleting their account
const request = require('request');
const nodemailer = require('nodemailer');

// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = "humantiv@citizenhealth.io";
const gmailPassword = "udrgowrhacmnagwy";
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'Humantiv';

exports.welcomeEmail = (user) => {

  return new Promise( (resolve, reject) => {
    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    sendWelcomeEmail(email, displayName)
    .then( result => {
      return resolve(result);
    })
    .catch( error => {
      reject(error);
    })
  })
}

exports.goodbyeEmail = function(event, callback) {
    const user = event.data; // The Firebase user.

    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    sendGoodbyeEmail(email, displayName, callback);
}

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@citizenhealth.io>`,
      to: email,
    };
  
    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hello ${displayName || ''}! 
                        Congratulations! You are now part of the Humantiv Community! You joined a place exclusively for rewarding health, having fun, and engaging with others!`;
    mailOptions.html = `<p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"><img src="https://firebasestorage.googleapis.com/v0/b/health-score-6740b.appspot.com/o/emails%2FWelcome-email.png?alt=media&amp;token=e2d2a673-a4a0-43da-b077-37aa525f44ef" alt="Humantiv logo" width="512" height="256" /></span></p>
    <p style="line-height: 1.68; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 12pt; color: #339966;"><span style="color: #36d410; font-family: Roboto;"><span style="white-space: pre-wrap;">Hello ${displayName || ''}</span></span></span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Congratulations! You are now part of the Humantiv Community! </span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">You joined a place exclusively for rewarding health, having fun, and engaging with others!</span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;">&nbsp;</p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt; font-family: Roboto; color: #36d410; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Let&rsquo;s get started!</span></p>
    <ul>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Log into your Account and connect your data source</span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">For all Apple users, Select the Apple Watch data source</span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Check out the Tutorial for a quick walk-through </span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Complete your Profile in the Settings Tab</span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Get Started! Begin earning Medit Rewards today! Just walk, sleep, and move!*</span></li>
    </ul>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 11pt; font-family: Roboto; color: #36d410; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"><span style="font-size: 10pt;">Daily Goals:</span> </span></p>
    <ul>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-size: 10pt;"><span style="font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Visit the App throughout the day to see your Medit Rewards increase!</span></span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap; font-size: 10pt;">Check the Leaderboard! Where are you in the Humantiv Community? Who&rsquo;s got Medit?</span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap; font-size: 10pt;">Look at your Health Stats and Health Score: Can you increase your Health Score?*</span></li>
    <li style="list-style-type: disc; font-size: 11pt; font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre;"><span style="font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"><span style="font-size: 10pt;">Check to see how much Medit you earned for each category; steps, sleep, and activity!</span> </span></li>
    </ul>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt;"><span style="font-family: Roboto; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Stay tuned as we unveil a Marketplace and other additions for you to spend your Medit!</span></span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt;"><span style="font-family: Arial; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Right now, go earn those Medit Rewards! Watch where you stand in the Leaderboard!</span></span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 11pt; font-family: Arial; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"><span style="font-size: 10pt;">See you in the App,</span> </span></p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;">&nbsp;</p>
    <p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><span style="font-size: 10pt;"><span style="font-family: Arial; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">~The Humantiv</span><span style="font-family: Arial; color: #434343; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"> Team </span></span></p>

    <span style="font-size: 8pt;">
    <span style="font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">
    *Please use Humantiv responsibly. You should always check with your doctor before adding anything new to your routine. Please see our <a style="color: #339966;" href="https://humantiv.com/privacy-policy/">Privacy Policy</a> and <span style="text-decoration: underline;"> <a style="color: #339966; text-decoration: underline;" href="http://humantiv.com/terms/">Terms of Use</a></span> for more information. By using this App, you are agreeing to the Terms.</span> </span></p>`
    return new Promise ( (resolve, reject) => {
      return mailTransport.sendMail(mailOptions)
      .then(() => {
        return resolve(email);
      })
      .catch( error => {
        reject(error);
      });
    });
}

// Sends a welcome email to the given user.
function sendGoodbyeEmail(email, displayName) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@citizenhealth.io>`,
      to: email,
    };
  
    // The user subscribed to the newsletter.
    mailOptions.subject = `Bye!`;
    mailOptions.text = `Hey ${displayName || ''}! We confirm that we have deleted your ${APP_NAME} account.`;
    return mailTransport.sendMail(mailOptions).then(() => {
      return console.log('Account deletion confirmation email sent to:', email);
    });
}
  