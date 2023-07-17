'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

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
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}, Path ID= ${event.path.id}`)


    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        let sessionToken = findToken( event.headers.Cookie )

        if( !sessionToken )
            throw " notfound "
        else{            

            db = client.db( dbName )
                        //_id: ObjectID( event.path.id ),
            let q = {
                _id: ObjectID( event.path.id ),
            }
            let u = {
                $set: {
                    status: "publishing",
                    discount: event.body.discount,
                    defaultRate: 2,
                    risks: event.body.risks || []
                }
            }

            let o = {
                returnNewDocument: true
            }

            const { value: invoice } = await db.collection( "invoices" ).findOneAndUpdate( q, u, o )

            q._id = ObjectID( invoice.userId )
            const developer = await db.collection( "developers" ).findOne( q )
            
            let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Actualización de factura<br/></h2> <p style="text-align: center;">Apreciable ${developer.name}. Le informamos que su factura con UUID: <strong>${invoice.uuid}</strong> ha sido revisada y aprobada para su publicación. En el panel de solicitante podrás finalizar este proceso.</p></div>`
            let params = {
                html: html,
                from: "Creedito <no-reply@creedito.mx>",
                to: developer.username,
                subject: "Actualización de factura | Creedito"
            }
            
            await sendMail( params )
            
            return { message: "ok" }
        }

    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
