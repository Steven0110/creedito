'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const appURL = process.env.APP_URL

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestContext.resourcePath}, Método=${event.httpMethod}, IP de Origen=${event.requestContext.identity.sourceIp}, User Agent=${event.requestContext.identity.userAgent}, Env= ${event.requestContext.stage}`)
    // Registro de auditoría individual
    console.info(`Hash de entrada=${event.pathParameters.hash}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db
    let hash = event.pathParameters.hash

    try{
        await client.connect()

        db = client.db( dbName )

        let setter = {
            $set: { blocked: false, failedLoginAttempts: 0 },
            $unset: { unlockHash: "" }
        }
        let query = { unlockHash: hash }
        let response = await db.collection( "investors" ).updateOne( query, setter )
        
        client.close()        

        if( response.result.n === 1 ){
            // Validation Ok
            console.info("Se ingresó a un enlace de verificación válido")
            return {
                statusCode: 301,
                headers: {
                    Location: appURL + "unlocked-account"
                }
            }

        }else{
            // Invalid hash
            console.info("Se ingresó a un enlace de verificación inválido")
            return {
                statusCode: 301,
                headers: {
                    Location: appURL + "unlock-error"
                }
            }
        }
    }catch(e) {
        client.close()
        console.error( e )
        return {
            statusCode: 301,
            headers: {
                Location: appURL + "unlock-error"
            }
        }
    }
};
