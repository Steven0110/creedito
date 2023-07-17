'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const obfuscateName = name => {
    let obfuscatedName = ""
    let names = name.split(" ")

    for( let n of names ){
        obfuscatedName += (n.charAt(0).toUpperCase() + "∗∗∗∗ ")
    }

    return obfuscatedName
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db
    let username = event.path.username

    try{
        await client.connect()

        db = client.db( dbName )

        let query = {
            username: username
        }

        let user = await db.collection( "investors" ).findOne( query )
        client.close()

        if( user ){
            console.info(`Usuario ${username} encontrado`)
            return {
                user: {
                    name: obfuscateName( user.name ),
                    secretImage: user.secretImage
                }
            }
        }else{
            console.info(`No se encontró al usuario ${username}`)
            throw " notfound "
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
