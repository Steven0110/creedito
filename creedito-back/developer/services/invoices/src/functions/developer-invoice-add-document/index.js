'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const investusDocuments = require("investus-documents")

const isDocumentUploaded = (documents, type) => documents.some(d => d.type == type)

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
            userId: ObjectID( event.enhancedAuthContext._id ),
            _id: ObjectID( event.path.id )
        }

        /*  Agrega el nuevo archivo a reemplazar  */
        let newDocument = {
            createdAt: new Date(),
            key: event.body.key,
            type: event.body.type,
            valid: false,
            processing: true,
            processed: false,
            status: "uploaded",
            metadata: {}
        }

        let update = {
            $push: {
                documents: newDocument
            }
        }

        await db.collection( "invoices" ).updateOne( query, update)
        await client.close()
        
        return {message: "Ok"}

    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }
};
