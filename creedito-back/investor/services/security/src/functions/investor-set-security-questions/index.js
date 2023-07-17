'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const sha512 = require('js-sha512').sha512

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const apiBaseURL = process.env.API_BASE_URL
const env = process.env.STAGE

const randomString = length => {
    let result           = ''
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for( let i = 0; i < length; i++ )
       result += characters.charAt(Math.floor(Math.random() * characters.length))

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

const sanitizeAnswer = answer => {
    answer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    answer = answer.replace(/\s/g, "")
    answer = answer.toUpperCase()
    answer = sha512( answer )
    return answer
}

const formatQuestions = questions => {
    for( let i = 0 ; i < questions.length ; i++ ){
        questions[ i ].answer = sanitizeAnswer( questions[ i ].answer )
    }
    return questions
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
        console.info("Se detecta sesión inválida")
        throw new Error(" invalidsession ")
    }

    let sessionToken = findToken( event.headers.Cookie )

    try{
        await client.connect()

        db = client.db( dbName )
        let questions = formatQuestions( event.body.questions )

        //Hashear respuestas
        let query = {
            sessionToken: sessionToken
        }
        let setter = {
            $set: {
                securityQuestions: questions
            }
        }
        const options = { returnNewDocument: true }


        const { value } = await db.collection( "investors" ).findOneAndUpdate( query, setter, options )
        client.close()

        if( value ){

            // Envía notificación
            let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Notificación de operación<br/></h2> <p style="text-align: center;">Apreciable ${value.name}. Le informamos que las preguntas de seguridad han sido configuradas para su cuenta en éste momento.</p><p style="text-align: center;"> Si no reconoce ésta operación, por favor envíenos un correo a <strong>soporte@creedito.mx</strong>. </p></div>`
            let params = {
                html: html,
                from: "Creedito <noreply@creedito.mx>",
                to: value.username,
                subject: "Notificación de operación | Creedito"
            }

            await sendMail( params )

            return {message: "Ok"}

        }else{
            console.info("Se detecta sesión inválida")
            throw new Error(" invalidsession ")
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
