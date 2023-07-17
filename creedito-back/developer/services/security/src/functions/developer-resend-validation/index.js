'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const apiBaseURL = process.env.API_BASE_URL
const env = process.env.STAGE

const randomString = length => {
    let result           = ''
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for( let i = 0; i < length; i++ )
       result += characters.charAt(Math.floor(Math.random() * charactersLength))

    return result
}

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

    if( !event.headers.Cookie ){
        console.info("Se detectó una sesión inválida")
        throw new Error("Sesión inválida")
    }

    let sessionToken = findToken( event.headers.Cookie )

    try{
        await client.connect()

        db = client.db( dbName )

        let verificationHash = randomString( 50 )

        let query = {
            sessionToken: sessionToken
        }
        let setter = {
            $set: {
                verificationHash: verificationHash
            }
        }
        const options = { returnNewDocument: true }

        const { value } = await db.collection( "developers" ).findOneAndUpdate( query, setter, options )
        client.close()
        if( value ){
            // Envía correo de verificación

            let verificationURL = apiBaseURL + "auth/" + "validate/" + verificationHash
            let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">¡Bienvenido a Creedito!<br/></h2> <p style="text-align: center;">Tu cuenta ha sido creada exitosamente, pero aún necesita ser verificada. Por favor entra al siguiente enlace para verificarla:</p><p style="text-align:center;margin-top: 25px;"> <a href="${verificationURL}" style="text-decoration: none;background-color: #113f67;padding-left: 40px;padding-right:40px;padding-top: 10px;padding-bottom:10px;color:white;font-weight: 700; font-size: 20px;border-radius: 5px">Verificar cuenta</a> </p></div>`
            let params = {
                html: html,
                from: "Creedito <noreply@creedito.mx>",
                to: value.username,
                subject: "Verifica tu cuenta | Creedito"
            }

            await sendMail( params )
            console.info(`Email de verificación reenviado exitosamente a ${value.username}`)

            throw new Error(" emailok ") //200 OK

        }else{
            console.info("No se encontró al usuario de la sesión proporcionada")
            throw new Error("[error] Error al enviar correo de verificación.")
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
