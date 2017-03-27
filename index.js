'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express();

const apiai = require('apiai')
const apiaiApp = apiai(APIAI_TOKEN)




app.set('port', (process.env.PORT || 5000))

//Allows to process data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ROUTE
app.get('/', function(req, res) {
	res.send("Welcome i am talkbot!")
})

let token = "EAAStBoBcmPYBAGY8J6xZAEcAeFmBGrHk4HmpRAEqnf3IMOk4i4gwemSKTXDwAFB55Y5cp4QXQaw2xxRrWoy7lZA9oWZCDfJfai2NneZA4HO3wpUTK8seIOnbdvjb6lCZAvBwCnDZBo0DoCParHKXd2hk3WgRmbs4E4xFIDj6G1OAZDZD"
//Facebook

app.get('/webhook/', function(req, res) {
	if(req.query['hub.verify_token'] === "gone") {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

/*Handling messages*/
app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
		//sendText(sender, "Text echo: " + text.substring(0,100))
		sendText(event, text)
	}
  }
  res.sendStatus(200)
})

/*function sendText(sender, text) {
	let messageData = {text : text}
	request({
		url: "https://graph.facebook.com/v2.8/me/messages",
		qs: {access_token : token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if(error) {
			console.log("sending error")
		} else if(response.body.error) {
			console.log("response body error")
		}
	})
}
*/

function sendText(sender, text) {
	let apiai = apiaiApp.textRequest(text, {
		sessionId: 'tabby_cat'
	})

	apiai.on('response', (response) => {
		console.log(response)
		let aiText = response.result.fullfillment.speech;

		request({
		url: "https://graph.facebook.com/v2.8/me/messages",
		qs: {access_token : token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: {text, aiText}
		}
	}, (error, response) => {
		if(error) {
			console.log("sending error")
		} else if(response.body.error) {
			console.log("response body error")
		}
	}
	})

		apiai.on('error', (error) => {
			console.log(error)
		})

		apiai.end()
}












app.listen(app.get('port'), function() {
	console.log("running: port")
})