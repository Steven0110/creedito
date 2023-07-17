'use strict';

const jwt = require('jsonwebtoken')
const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
AWS.config.update({ accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: "us-west-2" })
const BUCKET = process.env.S3_BUCKET
const signedUrlExpireSeconds = 60 * 30

const presignURL = key => {
    let signedURL = s3.getSignedUrl('getObject', {
        Bucket: BUCKET,
        Key: key,
        Expires: signedUrlExpireSeconds
    })

    return signedURL
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

const sanitizeUser = user => {
    delete user._id
    delete user.otpToken
    delete user.otpTmpToken
    delete user.origins
    delete user.blocked
    delete user.suspended
    delete user.active

    user.securityQuestions = (user.securityQuestions || []).length
    user.secretImage = !!user.secretImage
    
    if( user.profilePicture )
        user.profilePicture = presignURL( user.profilePicture )
    
    return user
}


module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico
    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db
    
    try{

        if( !event.headers.Cookie ){
            console.info("Se detectó una sesión inválida")
            throw new Error(" notok ")
        }

        let sessionToken = findToken( event.headers.Cookie )
        console.log("sessionToken:", sessionToken)

        await client.connect()

        db = client.db( dbName )

        let query = {
            sessionToken: sessionToken
        }

        let project = {
            password: false,
            verificationHash: false,
            sessionToken: false,
            otpToken: false,
            otpTmpToken: false,
            documents: 0
        }

        let user = await db.collection( "developers" ).findOne( query, {projection: project} )

        client.close()
        
        if( user ){ // La sesión sí existe

            // Verifica JWT
            let decoded = jwt.verify( sessionToken, event.identity.sourceIp )
            if(user._id == decoded.id){
                delete user._id
                console.info("Sesión validada correctamente")
                return {user: sanitizeUser( user ) }
            }else{
                console.info("Se detectó una sesión inválida")
                throw new Error(" notok ")
            }

        }else{ // La sesión no existe
            console.info("Se detectó una sesión inválida")
            throw new Error(" notok ")
        }


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( "notok" )
    }
};
