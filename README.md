# Humantiv Backend

Cloud functions supporting the Humantiv app.

## Installation

```
cd functions
npm install
```
## Deployment
Install the firebase CLI:
```
npm install -g firebase-tools
```
Read the Google \[Get Started\](https://firebase.google.com/docs/functions/get-started) documentation.
```
firebase deploy --only functions
```

## Functions List
**humanAPITokenExchange**:
Exchanges a handshake with the Human API to get the user publicToken
-  *Input*: Human API user sessionTokenObject.
-  *Returns*: Human API user publicToken
---
**buildSlackNotification:**
Triggered by Nevercode Humantiv app build. Posts to the slack channel *mobile_app_build*
-  *Input*: Nevercode webhook post.
-  *Returns*: ok
---
**sendWelcomeEmail:**
Triggered by creation of a new user. Sends a welcome email to the user email address.
-  *Input*:User login info.
-  *Returns*: ok
---
**sendGoodbyeEmail:**
Triggered by deleting a user account. Sends a goodbye email to the user email address.
-  *Input*:User login info.
-  *Returns*: ok
---
**sendInitialMedits:**
Triggered by creation of a user account. Sends an initial amount of medits to the user.
-  *Input*:User login info.
-  *Returns*: ok
---
**setInitialHealthScore:**
Triggered by creation of a user account. Creates a baseline health score for the user.
-  *Input*:User login info.
-  *Returns*: ok
---
**sendMeditsNotification:**
Triggered by the change of the medits number assigned to a user.
-  *Input*:medits number.
-  *Returns*: ok