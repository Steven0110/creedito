'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const generatePolicy = (principalId, effect, resource, params) => {
    // Required output:
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {

        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];

        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    // Optional output with custom properties of the String, Number or Boolean type.
    if( params ){
        console.log(JSON.stringify( params ))
        authResponse.context = params
    }

    return authResponse
}


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

module.exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    // Registro de auditoría genérico
    console.info(`Recurso=${event.path}, Método=${event.httpMethod}, IP de Origen=${event.requestContext.identity.sourceIp}, User Agent=${event.requestContext.identity.userAgent}, Env= ${event.requestContext.stage}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db
    
    if( !event.headers.Cookie ){
        console.info("Se detectó una sesión inválida")
        return callback(null, generatePolicy('me', 'Deny', event.methodArn))
    }

    client.connect()
    .then(() => {

        // Obtiene al usuario de la sesión
        db = client.db( dbName )
        let sessionToken = findToken( event.headers.Cookie )
        let query = { sessionToken: sessionToken }
        let project = {
            _id: 1,
            username: 1
        }
        return db.collection( "admins" ).findOne( query, {projection: project} )
    })
    .then(user => {
        client.close()

        if( user )
            callback(null, generatePolicy('me', 'Allow', event.methodArn, user))
        else
            callback(null, generatePolicy('me', 'Deny', event.methodArn))
    })
    .catch( err => {
        client.close()
        console.error( e )
        callback(null, generatePolicy('me', 'Deny', event.methodArn))
    })
};
