'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const appURL = process.env.APP_URL

const selectQuestion = questions => {
    let length = questions.length
    let randomIndex = Math.floor( Math.random() * length )

    return questions[ randomIndex ]
}

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

        let query = { resetHash: hash }
        let project = {
        	projection: {
        		username: 1,
        		"securityQuestions.question": 1,
                "securityQuestions.id": 1
        	}
        }
        let user = await db.collection( "developers" ).findOne( query, project )
        
        client.close()
        
        if( user ){
            // Validation Ok
            console.info(`Se ingresó al enlace de reset de ${user.username}`)
            if( user.securityQuestions && user.securityQuestions.length > 0 ){

                /*  Select a random question    */
                user.question = selectQuestion( user.securityQuestions )

                let response = {
                    username: user.username,
                    question: user.question
                }

            	let encodedUser = encodeURIComponent(JSON.stringify( response ))
	            return {
	                statusCode: 301,
	                headers: {
	                    Location: appURL + "reset-account?" + `user=${encodedUser}`
	                }
	            }
            }else{
	            return {
	                statusCode: 301,
	                headers: {
	                    Location: appURL + "reset-no-questions"
	                }
	            }
            }

        }else{
            // Invalid hash
            console.info("Se ingresó a un enlace de reset inválido")
            return {
                statusCode: 301,
                headers: {
                    Location: appURL + "invalid-reset"
                }
            }
        }
    }catch(e) {
        client.close()
        console.error( e )
        return {
            statusCode: 301,
            headers: {
                Location: appURL + "invalid-reset"
            }
        }
    }
}