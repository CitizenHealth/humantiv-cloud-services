
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
Read the Google [Get Started](https://firebase.google.com/docs/functions/get-started) documentation.

## Functions List

**humanAPITokenExchange**: 
Exchanges a handshake with the Human API to get the user publicToken
 - *Input*: Human API user sessionTokenObject.
 - *Returns*:  Human API user publicToken
---
**buildSlackNotification:**
Triggered by Nevercode Humantiv app build. Posts to the slack channel *mobile_app_build* 
- *Input*: Nevercode webhook post.
 - *Returns*:  ok