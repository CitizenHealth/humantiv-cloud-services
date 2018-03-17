// Webhook for Nevercode to send a Slack notification when a 
// Humantiv app build is succesful
const request = require('request');

exports.slackNotification = function(req, res, database) {


    const epoch = Math.round((new Date()).getTime() / 1000);
    console.log(`Epoch: ${Date.now()}`);
    console.log(`Epoch: ${epoch}`);
    // Check if change description is available
    var description = "";
    if (req.body.changes !== undefined) {
        description = req.body.changes.description || "";
    }
     
    var iOSBinaryURL = "";
    var androidBinaryURL = "";

    // Find iOS and Android binary links
    const artefacts = req.body.build.artefacts;
    for (var i = 0; i < artefacts.length; i++) {

        if (artefacts[i].type === "ipa") {
            iOSBinaryURL = artefacts[i].url;
        }
        if (artefacts[i].type === "apk") {
            androidBinaryURL = artefacts[i].url;
        }
    }

    var jsonObj = {
        "attachments": [
            {
                "fallback": `Humantiv Build ${req.body.build.build_number} is available on www.nevercode.io`,
                "color": "danger",
                "pretext": `Humantiv Build ${req.body.build.build_number} is available`,
                "author_name": "from NEVERCODE",
                "author_link": `${req.body.project.web_url}`,
                "author_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2017-05-29/189204375635_2495bddc13941c5776de_512.png",
                "title": "Branch",
                "text": `${req.body.build_config.branch}`,
                "fields": [
                    {
                        "title": "Change Log",
                        "value": `${description}`,
                        "short": false,
                        "mrkdwn": true
                    }
                ],
                "actions": [
                    {
                        "name": "iOS",
                        "text": "iOS",
                        "type": "button",
                        "url": `${iOSBinaryURL}`
                    },
                    {
                        "name": "Android",
                        "text": "Android",
                        "type": "button",
                        "url": `${androidBinaryURL}`
                    }
                ],
                "footer": "Humantiv Build Bot",
                "footer_icon": "https://s3-eu-west-1.amazonaws.com/files.greenhouseci.com/projects/679a112b-d03e-4998-9ec5-b7380f833b18/icon.png?234016e19c425db86ed795a40e49ac7d",
                "ts": `${epoch}`
            }
        ]
    };
    
    request({
        method: 'POST',
        uri: 'https://hooks.slack.com/services/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',
        json: jsonObj
      }, (err, resp, body) => {
        if(err) {
            console.log(`error = ${err}`);
            return res.send(422);
        }
        console.log(`Slack response = ${JSON.stringify(req.body)}`);

        res.setHeader('Content-Type', 'application/json');
        res.status(201).send({result: "Ok"});
    });
 }
 
 