'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)


    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        db = client.db( dbName )

        const query = {
            hash: event.path.hash
        }

        const invoice = await db.collection( "invoices" ).findOne( query )

        if( invoice )
            return {invoice: invoice}
        else
            throw "[notfound]"

    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
