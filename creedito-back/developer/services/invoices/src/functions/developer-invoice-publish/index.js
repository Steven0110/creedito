'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const adminRecipients = process.env.ADMIN_AGENT_EMAILS
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })

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

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}, Usuario= ${event.enhancedAuthContext._id}, Path ID= ${event.path.id}`)


    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        let sessionToken = findToken( event.headers.Cookie )

        if( !sessionToken )
            throw "[invalidsession]"
        else{            

            db = client.db( dbName )

            const q = {
                userId: ObjectID( event.enhancedAuthContext._id ),
                _id: ObjectID( event.path.id )
            }
            const u = {
                $set: {
                    status: "published",
                    invoicingType: event.body.invoicingType,
                    creditTarget: event.body.creditTarget,
                    image: event.body.image
                }
            }
            
            const { value } = await db.collection( "invoices" ).findOneAndUpdate( q, u, {returnNewDocument: true} )

            if( value ){

                /*  Notifica a los agentes de Creedito  */
                let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Factura publicada<br/></h2> <p style="text-align: center;">Apreciable administrador. <br/>Le informamos que una factura de ${value.emisor.rfc}<strong>ha sido publicada</strong> en este momento.</p></div>`

                let params = {
                    html: html,
                    from: "Creedito <no-reply@creedito.mx>",
                    subject: "Factura publicada | Creedito",
                    to: adminRecipients,
                }
                await sendMail( params )

                return {message: "ok"}
            }else
                throw "[notfound]"
        }


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
