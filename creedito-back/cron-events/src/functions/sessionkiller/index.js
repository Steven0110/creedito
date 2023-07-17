'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const minutesTimeout = Number(process.env.SESSION_MINUTES_TIMEOUT || 5)

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{

        await client.connect()

        db = client.db( dbName )

        let query = {
            sessionToken: {$ne: false}
        }

        let activeInvestors = await db.collection( "investors" ).find( query ).toArray()

        if( activeInvestors ){
            // Cierra todas las sesiones de los usuarios cuya última acción sea mayor a 5 minutos
            let currentDate = new Date()

            for( let i = 0 ; i < activeInvestors.length ; i++ ){
                let user = activeInvestors[ i ]
                let lastAction = user.lastAction
                let diff = currentDate - lastAction
                let diffMinutes = Number(((diff % 86400000) % 3600000) / 60000)

                if( diffMinutes > minutesTimeout){
                    query = { _id: ObjectID(user._id) }
                    let setter = {$set: {sessionToken: false}}
                    await db.collection( "investors" ).updateOne( query, setter )
                    console.info(`Sesión de ${user.username} cerrada`)
                }
            }

        }

        let activeDevelopers = await db.collection( "developers" ).find( query ).toArray()

        if( activeDevelopers ){
            // Cierra todas las sesiones de los usuarios cuya última acción sea mayor a 5 minutos
            let currentDate = new Date()

            for( let i = 0 ; i < activeDevelopers.length ; i++ ){
                let user = activeDevelopers[ i ]
                let lastAction = user.lastAction
                let diff = currentDate - lastAction
                let diffMinutes = Number(((diff % 86400000) % 3600000) / 60000)

                if( diffMinutes > minutesTimeout){
                    query = { _id: ObjectID(user._id) }
                    let setter = {$set: {sessionToken: false}}
                    await db.collection( "developers" ).updateOne( query, setter )
                    console.info(`Sesión de ${user.username} cerrada`)
                }
            }

        }

        let activeAdmins = await db.collection( "admins" ).find( query ).toArray()

        if( activeAdmins ){
            // Cierra todas las sesiones de los usuarios cuya última acción sea mayor a 5 minutos
            let currentDate = new Date()

            for( let i = 0 ; i < activeAdmins.length ; i++ ){
                let user = activeAdmins[ i ]
                let lastAction = user.lastAction
                let diff = currentDate - lastAction
                let diffMinutes = Number(((diff % 86400000) % 3600000) / 60000)

                if( diffMinutes > minutesTimeout){
                    query = { _id: ObjectID(user._id) }
                    let setter = {$set: {sessionToken: false}}
                    await db.collection( "admins" ).updateOne( query, setter )
                    console.info(`Sesión de ${user.username} cerrada`)
                }
            }

        }

        client.close()
        return false


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
