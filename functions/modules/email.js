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
const gmailEmail = "nabylb@gmail.com";
const gmailPassword = "fbiviacskmojbsnd";
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

exports.welcomeEmail = function(event, callback) {
    const user = event.data; // The Firebase user.

    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    sendWelcomeEmail(email, displayName);
    callback();
}

exports.goodbyeEmail = function(event, callback) {
    const user = event.data; // The Firebase user.

    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    sendGoodbyeEmail(email, displayName);
    callback();
}

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@citizenhealth.io>`,
      to: email,
    };
  
    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. 
                        I hope you will enjoy our app.`;
    return mailTransport.sendMail(mailOptions).then(() => {
      return console.log('New welcome email sent to:', email);
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
  