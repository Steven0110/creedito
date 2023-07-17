'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID


const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

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
        const query = {_id: ObjectID( event.enhancedAuthContext._id )}
        const project = {
            _id: 1,
            documents: 1
        }

        let user = await db.collection( "developers" ).findOne( query, {projection: project} )
        let update

        if( isDocumentUploaded( user.documents || [], event.body.type ) ){
            /*  El archivo se sube en sustitución de otro   */
            /*  Elimina el archivo anterior    */
            update = {
                $pull: {
                    documents: {
                        type: event.body.type
                    }
                }
            }
            await db.collection( "developers" ).updateOne( query, update)
        }

        /*  Agrega el nuevo archivo a reemplazar  */
        let newDocument = {
            createdAt: new Date(),
            key: event.body.key,
            type: event.body.type,
            valid: false,
            processing: false,
            processed: false,
            metadata: {}
        }

        update = {
            $push: {
                documents: newDocument
            }
        }
        await db.collection( "developers" ).updateOne( query, update)

        /*  Retira el documento subido de los documentos pendientes del inversionista*/
        update = {
            $pull: {
                pendingDocuments: {
                    type: event.body.type
                }
            }
        }
        await db.collection( "developers" ).updateOne( query, update)

        /*  Lógica adicional */
        if( event.body.type == "tyc" ){
            update = {
                $set: {
                    agreed: true
                }
            }
            await db.collection( "developers" ).updateOne( query, update)
        }

        client.close()
        return {message: "Ok"}

    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }
};
