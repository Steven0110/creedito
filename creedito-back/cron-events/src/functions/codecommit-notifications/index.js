'use strict';

const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })

const AWS = require("aws-sdk")
AWS.config.update({ accessKeyId: process.env.AWS_KEY_ID, secretAccessKey: process.env.AWS_SECRET, region: "us-west-2" })
const codecommit = new AWS.CodeCommit();

const sendMail = params => {
	return new Promise((resolve, reject) => {
		mg.messages().send(params, function (error, body) {
			if( error )
				reject( error )
			else
				resolve({ message: "ok" })
		});
	})
}

module.exports.handler = async event => {

	try{

		let notification = JSON.parse( event.Records[ 0 ].Sns.Message )
		let repositoryName = notification.detail.repositoryName
		let commitId = notification.detail.commitId

		let commitRequest = {
			commitId: commitId,
			repositoryName: repositoryName
		}

		let { commit } = await codecommit.getCommit( commitRequest ).promise()
		let { message, author } = commit

		let html = `<div><h2 style="text-align: center;color: #8396d3; font-family: Arial;">¡Nueva modificación realizada en Creedito!<br></h2><p style="text-align: center;"><strong>Repositorio:</strong> ${repositoryName} <br></p><p style="text-align: center;"><strong>Descripción:</strong> ${message} <br></p><p style="text-align: center;"><strong>Autor:</strong> ${author.name} <br></p></div>`
		let params = {
			html: html,
			from: "Creedito <no-reply@creedito.mx>",
			to: `cabello.acosta.gerardo@gmail.com;ltello@smartia.mx;investus.ifc@gmail.com`,
			subject: "Modificación realizada en el sistema | Creedito"
		}

		return sendMail( params )

	}catch(e) {
		console.error( e )
		return { message: "Error al notificar" }
	}

};
