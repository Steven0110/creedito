'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const adminRecipients = process.env.ADMIN_AGENT_EMAILS
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const providerApp = process.env.PROVIDER_APP

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

            let hash = randomString(50)

            const q = {
                userId: ObjectID( event.enhancedAuthContext._id ),
                _id: ObjectID( event.path.id )
            }
            const u = {
                $set: {
                    status: "revision",
                    goal: {
                        months: event.body.months
                    },
                    hash: hash
                }
            }
            const { value } = await db.collection( "invoices" ).findOneAndUpdate( q, u, {returnNewDocument: true} )

            if( value ){

                /*  Notifica a los agentes de Creedito  */
                let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Se ha dado de alta una factura en la plataforma<br/></h2> <p style="text-align: center;">Le informamos que un solicitante ha dado de alta una factura a la plataforma para su correspondiente revisión. La factura la podrá encontrar en la sección <strong>Facturas</strong> en la pestaña <strong>Pendientes por revisar</strong>.</p></div>`
                let params = {
                    html: html,
                    from: "Creedito <no-reply@creedito.mx>",
                    subject: "Factura subida | Creedito",
                    to: adminRecipients,
                }
                await sendMail( params )

                /*  Notifica al receptor de la factura  */
                if( event.body.type == "first" ){
                    let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Notificación de operación con factura<br/></h2> <p style="text-align: center;">Por este medio lo contactamos para informarlo que su factura con UUID <strong>${value.uuid}</strong> y emisor <strong>${value.emisor.nombre}</strong>con RFC <strong>${value.emisor.rfc}</strong> ha sido subida a nuestra plataforma para que sea fondeada. Por favor, ingrese a nuestra plataforma para indicar que está enterado.</p><p style="text-align: center;"> <a href="${providerApp}/?token=${hash}" style="text-decoration: none;background-color: #113f67;padding-left: 40px;padding-right:40px;padding-top: 10px;padding-bottom:10px;color:white;font-weight: 700; font-size: 20px;border-radius: 5px">Ir a CREEDITO</a> </p></div>`
                    let params = {
                        html: html,
                        from: "Creedito <no-reply@creedito.mx>",
                        subject: "Notificación de uso de su factura | Creedito",
                        to: event.body.email,
                    }
                    await sendMail( params )
                }
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
