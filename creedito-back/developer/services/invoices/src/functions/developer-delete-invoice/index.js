'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME


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
        await client.connect()

        let sessionToken = findToken( event.headers.Cookie )

        if( !sessionToken )
            throw " notfound "
        else{            

            db = client.db( dbName )

            const q = {
                userId: ObjectID( event.enhancedAuthContext._id ),
                _id: ObjectID( event.path.id ),
            }

            const u = {
                $set: {
                    deleted: true
                }
            }

            const { result } = await db.collection( "invoices" ).updateOne( q, u )

            if( result.n === 1 )
                return {message: "ok"}
            else
                throw " undeleted "
        }


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
