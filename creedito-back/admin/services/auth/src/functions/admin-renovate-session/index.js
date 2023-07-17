'use strict';

const jwt = require('jsonwebtoken')
const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const cookieDefinition = process.env.COOKIE_DEF

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
AWS.config.update({ accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: "us-west-2" })
const BUCKET = process.env.S3_BUCKET
const signedUrlExpireSeconds = 60 * 30
const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || "5m"

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

const generateSessionToken = async (user, ip, db) => {
    let params = {
        id: user._id
    }

    let sessionToken = jwt.sign( params, ip, {
        expiresIn: SESSION_TIMEOUT
    })

    // Stores Token to User
    let currentDate = new Date()
    let setter = {
        $set: {
            sessionToken: sessionToken,
            lastAction: currentDate
        }
    }
    let query = {_id: ObjectID( user._id )}

    await db.collection( "admins" ).updateOne( query, setter )
    console.info(`Sesión renovada exitosamente para ${user.username}`)
    console.log({newSessionToken: sessionToken, currentDate: currentDate})
    return {newSessionToken: sessionToken, currentDate: currentDate}
}

const sanitizeUser = user => {
    console.log("antes de sanitizar", JSON.stringify( user ))
    delete user._id
    delete user.otpToken
    delete user.otpTmpToken
    delete user.origins
    delete user.blocked
    delete user.suspended
    delete user.active

    user.securityQuestions = (user.securityQuestions || []).length
    user.secretImage = !!user.secretImage
    
    //if( user.profilePicture )
    //    user.profilePicture = presignURL( user.profilePicture )

    console.log("después de sanitizar", JSON.stringify( user ))
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

        await client.connect()

        db = client.db( dbName )

        let query = {
            sessionToken: sessionToken
        }

        let project = {
            password: false,
            verificationHash: false,
            resetHash: false,
            sessionToken: false,
            otpToken: false,
            otpTmpToken: false
        }

        let user = await db.collection( "admins" ).findOne( query, {projection: project} )
        if( user ){
            let { newSessionToken, currentDate } = await generateSessionToken(user, event.identity.sourceIp, db)
            let cookie = `token=${newSessionToken}; ${cookieDefinition}`
            console.log("Cookie: " + cookie)
            delete user._id
            user.lastAction = currentDate

            client.close()
            return {message: "ok", user: sanitizeUser( user ), cookie: cookie}
        }else{
            console.info("Sesión inválida")
            throw new Error(" notok ")
        }


    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
