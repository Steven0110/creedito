'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const appURL = process.env.APP_URL

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

        if( !event.headers.Cookie ){
            console.info("Se detectó una sesión inválida")
            throw new Error(" Error de sesion ")
        }

        let sessionToken = findToken( event.headers.Cookie )

        await client.connect()

        db = client.db( dbName )

        const query = {
            sessionToken: sessionToken
        }
        
        const { result } = await db.collection( "investors" ).updateOne( query, [{ $addFields: event.body }] )
        client.close()

        if( result.n === 1 )
            return { message: "ok" }
        else
            throw " nothing "

    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
