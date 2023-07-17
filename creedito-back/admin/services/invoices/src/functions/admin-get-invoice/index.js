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

            const pipeline = [
                {
                    $match: {
                        _id: ObjectID( event.path.id ),
                        deleted: {
                            $exists: false
                        }
                    },
                },
                {
                    $lookup: {
                        from: "developers",
                        let: {
                            "id": "$userId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        "$eq": ["$_id", "$$id"]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                    username: 1,
                                    info: 1
                                }
                            }
                        ],
                        as: "developer"
                    }
                },
                {
                    $unwind: {
                        path: "$developer"
                    }
                },
                {
                    $project: {
                        userId: 0
                    }
                }
            ]

            const invoice = (await db.collection( "invoices" ).aggregate( pipeline ).toArray())[0]
            client.close()

            return {invoice: invoice}
        }


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
