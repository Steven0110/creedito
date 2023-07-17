'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })


const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

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

const findToken = cookiesString => {
    let cookies = cookiesString.split(";")

    for( let pair of cookies ){
        if( pair.match(/token=/g) ){
            let tokenCookie = pair.split("=")
            return tokenCookie[ 1 ]
        }
    }

    return false
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false
    
    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        db = client.db( dbName )

        if( !event.headers.Cookie ){
            console.info("Se detectó una sesión inválida")
            throw new Error(" invalidsession ")
        }

        let sessionToken = findToken( event.headers.Cookie )
        
        const query = {
            sessionToken: sessionToken
        }
        const setter = {
            $set: {
                tfa: false,
                lastAction: new Date(),
                otpTmpToken: null,
                otpToken: null,
            }
        }
        const options = { returnNewDocument: true }

        const { value } = await db.collection( "investors").findOneAndUpdate( query, setter, options )
        client.close()
        
        if( value ){
            console.info(`TFA desactivado para ${value.username}`)
            
            let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Notificación de operación<br/></h2> <p style="text-align: center;">Apreciable ${value.name}. Le informamos que el doble factor de autenticación de su cuenta ha sido desactivado en éste momento.</p><p style="text-align: center;"> Si no reconoce ésta operación, por favor envíenos un correo a <strong>soporte@creedito.mx</strong>. </p></div>`
            let params = {
                html: html,
                from: "Creedito <no-reply@creedito.mx>",
                to: value.username,
                subject: "Notificación de operación | Creedito"
            }
            
            await sendMail( params )
            return {message: "Segundo factor desactivado correctamente"}
        }else{
            console.info("Se detectó una sesión inválida")
            throw new Error(" invalidsession ")
        }

    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }
};
