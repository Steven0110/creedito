'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const apiBaseURL = process.env.API_BASE_URL
const env = process.env.STAGE

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

const randomString = length => {
    let result           = ''
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for( let i = 0; i < length; i++ )
       result += characters.charAt(Math.floor(Math.random() * charactersLength))

    return result
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)
    // Registro de auditoría individual
    console.info(`Email de entrada=${event.body.username}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        db = client.db( dbName )

        let unlockHash = randomString( 50 )

        let query = {
        	username: event.body.username,
            unlockHash: { $exists: false }
        }
        let setter = {
        	$set: {
        		unlockHash: unlockHash
        	}
        }
        let options = {
        	returnNewDocument: true
        }

        const { value } = await db.collection( "developers" ).findOneAndUpdate( query, setter, options )
        client.close()

        if( value ){
            console.info(`Unlock hash creado exitosamente para ${value.username}`)
            // Envía correo de reseteo de cuenta
            let unlockURL = apiBaseURL + "security/" + "unlock-account/" + unlockHash

            /*	reset-account.html 	*/
            let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Desbloqueo de cuenta<br/></h2> <p style="text-align: center;">Hemos recibido tu solicitud de desbloqueo de cuenta. Por favor entra al siguiente enlace para continuar:</p><p style="text-align:center;margin-top: 50px"> <a href="${unlockURL}" style="text-decoration: none;background-color: #113f67;padding-left: 40px;padding-right:40px;padding-top: 10px;padding-bottom:10px;color:white;font-weight: 700; font-size: 20px;border-radius: 5px">Desbloquea tu cuenta</a> </p></div>`
            let params = {
                html: html,
                from: "Creedito <no-reply@creedito.mx>",
                to: value.username,
                subject: "Desbloqueo de cuenta | Creedito"
            }

            await sendMail( params )
            console.info(`Email de desbloqueo de cuenta enviado a ${value.username}`)
            throw new Error( "success" )

        }else{
            throw new Error(" found ")
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }

}