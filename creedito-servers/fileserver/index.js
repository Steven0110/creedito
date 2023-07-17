"use strict";

require('dotenv').config()

const querystring = require('querystring')

const express = require("express");
const crypto = require("crypto")

const app = express();
const secret = process.env.SECRET;
const port = process.env.PORT;

const router = require('./routes/index')
const cors = require('cors')

// Certificate
const http = require("http")
const https = require("https")
const fs = require("fs")

// Middlewares
const origins = require("./middleware/origins")

var privateKey, certificate, ca

if( process.env.LOCAL ){
	privateKey = fs.readFileSync('certs/local/private.key', 'utf8')
	certificate = fs.readFileSync('certs/local/certificate.pem', 'utf8')
}else{
	privateKey = fs.readFileSync('certs/prod/', 'utf8')
	certificate = fs.readFileSync('certs/prod/', 'utf8')
}

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


/*	CORS Settings 	*/
const corsOptions = {
	origin: process.env.ALLOWED_ORIGIN
}
app.use(cors(corsOptions))

app.use(origins)

/* 	Request Resolver for Express.js 	*/
const resolveRequest = function(res, status, body){
	return res.status(status).send(body);
}

app.use(router)

/*	HTTPS 	*/
let server = https.createServer(credentials, app).listen(port, function() {
    console.log('HTTPS (local=' + !!process.env.LOCAL + ') server listening on port ' + port);

    if( !fs.existsSync("/tmp/creedito") )	 //Creates tmp directory for assets if not exists
    	fs.mkdirSync("/tmp/creedito")
})

/* 	Ends node server execution 	*/
process.on('SIGINT', function() {
    console.log("SERVER KILLED!");
    return server.close(function(err) {
		if(err) console.error(err)
		return process.exit();
	});
});
