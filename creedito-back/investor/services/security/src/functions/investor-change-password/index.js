'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const sha512 = require('js-sha512').sha512

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

    if( !event.headers.Cookie ){
        console.info("Se detecta sesión inválida")
        throw " invalidsession "
    }

    let sessionToken = findToken( event.headers.Cookie )

    try{
        await client.connect()

        db = client.db( dbName )

        //Hashear respuestas
        let query = {
            sessionToken: sessionToken,
            password: sha512( event.body.oldPassword )
        }

        const user = await db.collection( "investors" ).findOne( query )

        if( user ){

            /*  Actualiza la contraseña     */
            console.info(`Se procede a cambiar la contraseña de ${user.username}`)

            query = {_id: ObjectID( user._id )}
            let update = {
                $set: {
                    password: sha512( event.body.newPassword )
                }
            }

            const op = await db.collection( "investors" ).updateOne( query, update )
            client.close()

            if( op.result.n === 1 ){
                // Envía notificación de cambio de contraseña
                let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Notificación de operación<br/></h2> <p style="text-align: center;">Apreciable ${user.name}. Le informamos que la contraseña de su cuenta acaba de ser modificada exitosamente.</p><p style="text-align: center;"> Si no reconoce ésta operación, por favor envíenos un correo a <strong>soporte@creedito.mx</strong>. </p></div>`;
                let params = {
                    html: html,
                    from: "Creedito <noreply@creedito.mx>",
                    to: user.username,
                    subject: "Notificación de operación | Creedito"
                }

                await sendMail( params )

                return {message: "ok"}
            }else
                throw " wrong "


        }else{
            console.info("Contraseña actual incorrecta")
            throw " wrong "
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
}