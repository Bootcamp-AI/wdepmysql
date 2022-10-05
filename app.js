

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)


// Imports dependencies and set up http server
import request from "request";
import  express from "express";
import  body_parser from "body-parser";
import  axios from "axios";

const app = express();

app.use(body_parser.json()); 

// creates express http server
//const {WebhookClient} = require("@google-cloud/dialogflow");
//const dialogflow = require("@google-cloud/dialogflow");
//const sessionClient = new dialogflow.SessionsClient({keyFilename: './santacruz.json'});
//const {google} = require('googleapis');
//const {v4: uuidv4} = require('uuid');

import {pool} from './db1.js';
import {createConnection} from './db.js';
import {
	VERIFY_TOKEN,
	WHATSAPP_TOKEN,
    PORT
} from './config.js'

const token = WHATSAPP_TOKEN;



app.post("/webhookDialogflow", function(request, response){
	const agent = new WebhookClient({request, response});

	let intenMap = new Map();
	intenMap.set("nameFunction", nameFunction);
	agent.handleRequest(intenMap);
})

function nameFunction(agent){

}

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}))

function isBlank(str){
        return (!str || /^\s*$/.test(str));
}


app.get('/db', async (req, res)=>{
    const [rows] = await pool.query('SELECT * FROM users')
    res.json(rows)
})


/*
async function detectIntent(
        projectId,
        sessionId,
        query,
        contexts,
        languageCode
        )

        {
          
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        //Text query request
        const request = {
                session: sessionPath,
                queryInput: {
                        text: {
                                text: query,
                                languageCode: languageCode
                        }
                }
        };
        if(contexts && contexts.length > 10){
                request.queryParams = {
                        contexts: contexts
                }
        };

        const responses = await sessionClient.detectIntent(request);
        return responses[0]
}



async function executeQueries(projectId, sessionId, queries, languageCode){
        let context;
        let intentResponse;
        for(const query of queries){
                try{
                        console.log(`Pregunta: ${query}`);
                        intentResponse = await detectIntent(
                                projectId,
                                sessionId,
                                query,
                                context,
                                languageCode
                        );
                        //console.log('Enviando respuesta');
                        if(isBlank(intentResponse.queryResult.fulfillmentText)){
                                console.log('Su respuesta definida en Dialogflow');
                                return null;
                        }
                        else{
                                //console.log('Respuesta definida en Dialogflow');
                                //console.log(intentResponse.queryResult.fulfillmentText);


                                //return {data1, data2};

                                return intentResponse.queryResult;
                        }
                }catch(error){
                        console.log(error)
                }
        }
};
*/



// Sets server port and logs message on success
app.listen(PORT, () => console.log("webhook is listening"+PORT));




// Accepts POST requests at /webhook endpoint
app.post("/webhook", async(req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  //console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      
      console.log("Body: "+msg_body);
      /*
      let payload1 = await executeQueries("bot-egjq", from, [msg_body], "es");
      
      let responses = payload1.fulfillmentMessages;      

      const text1 = responses[0].text.text[0];
      console.log("Respuesta: "+responses[0].text.text[0])
      */

      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { "body": msg_body },
        },
        headers: { "Content-Type": "application/json" },
      });
      
      
      /*
        for (const response of responses){
        await sendMessageToWhatsapp(response,phone_number_id, from);
        }
        */    

    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

/*
function sendMessageToWhatsapp(response,phone_number_id, from) {
  
  console.log("Respuestasss:: "+JSON.stringify(response));
  
  try{
      
    const url = response.payload.fields.media.stringValue;

      console.log("URL: "+url);

      if(url.match(".mp3") == ".mp3" || url.match(".mpeg") == ".mpeg" || url.match(".amr") == ".amr" || url.match(".ogg") == ".ogg"){

        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            type: "audio",
            audio: { "link": url},
          },
          headers: { "Content-Type": "application/json" },
        });

      }
      
        else if(url.match(".mp4") == ".mp4" || url.match(".3gp") == ".3gp"){
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          type: "video",
          video: { "link": url },
        },
        headers: { "Content-Type": "application/json" },
      });

      }else if(url.match(".png") == ".png" || url.match(".jpeg") == ".jpeg"){
            axios({
              method: "POST", // Required, HTTP method, a string, e.g. POST, GET
              url:
                "https://graph.facebook.com/v12.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
              data: {
                messaging_product: "whatsapp",
                to: from,
                type: "image",
                image: { "link": url },
              },
              headers: { "Content-Type": "application/json" },
            });


      }else if(url.match(".pdf") == ".pdf" || 
      url.match(".ms-powerpoint") == ".ms-powerpoint" || 
      url.match(".msword") == ".msword" ||
      url.match(".ms-excel") == ".ms-excel" ||
      url.match(".openxmlformats-officedoc") == ".openxmlformats-officedoc" ||
      url.match(".document") == ".document" ||
      url.match(".openxmlformats-officedoc") == ".openxmlformats-officedoc" ||
      url.match(".presentation") == ".presentation" ||
      url.match(".openxmlformats-officedoc") == ".openxmlformats-officedoc" ||
      url.match(".sheet") == ".sheet")

               { 
            axios({
              method: "POST", // Required, HTTP method, a string, e.g. POST, GET
              url:
                "https://graph.facebook.com/v12.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
              data: {
                messaging_product: "whatsapp",
                to: from,
                type: "document",
                document: { "link": url },
              },
              headers: { "Content-Type": "application/json" },
            });


      };       
   
  }catch(error){
    console.log(error)
  }

}
*/


app.get("/webhook", (req, res) => {

  const verify_token = VERIFY_TOKEN;
  console.log("Token: "+req)

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  console.log("mode: "+mode)
  console.log("token: "+token)
  console.log("challenge: "+challenge)
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
      console.log("No Match")
    }
  }
});
