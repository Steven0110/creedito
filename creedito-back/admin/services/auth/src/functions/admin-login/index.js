'use strict';

const jwt = require('jsonwebtoken')
const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const speakeasy = require("speakeasy")
const sha512 = require('js-sha512').sha512

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

const generateSessionToken = async (user, ip, db) => {
    let params = {
        id: user._id
    }

    let sessionToken = jwt.sign( params, ip, {
        expiresIn: SESSION_TIMEOUT
    })

    // Stores Token to User
    let setter = {
        $set: {
            sessionToken: sessionToken,
            failedLoginAttempts: 0,
            lastAction: new Date()
        }
    }
    let query = {_id: ObjectID( user._id )}
    //console.log("Debug Session Token: ", sessionToken)
    await db.collection( "admins" ).updateOne( query, setter )

    return sessionToken
}

const sendMail = params => {
    return new Promise((resolve, reject) => {
        mg.messages().send(params, function (error, body) {
            if( error )
                reject( error )
            else
                resolve({ message: "ok" })
        });
    })
}

const sanitizeUser = user => {
    delete user._id
    delete user.otpToken
    delete user.otpTmpToken
    delete user.origins
    delete user.blocked
    delete user.suspended
    delete user.active
    delete user.sessionToken

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
    // Registro de auditoría individual
    console.info(`Email de entrada=${event.body.username}`)


    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{
        await client.connect()

        db = client.db( dbName )

        let query = {
            username: event.body.username,
            password: sha512( event.body.password ),
        }

        let project = {
            password: false,
            verificationHash: false,
            failedLoginAttempts: false,
            resetHash: false,
            documents: 0
        }

        let user = await db.collection( "admins" ).findOne( query, {projection: project} )
        if( user ){

            console.log("Admin:", JSON.stringify( user ))

            if( user.blocked )
                throw new Error( " unable " )

            if( user.suspended )
                throw new Error( " suspended " )

            if( user.active === false )
                throw new Error( " inactive " )

            if( user.sessionToken )
                throw new Error( " multiple " )

            // Verifica que tenga TFA habilitado
            if( user.tfa === true ){
                if( event.body.otp ){

                    let otpToken = user.otpToken
                    let verified = speakeasy.totp.verify({ secret: otpToken, encoding: 'base32', token: event.body.otp })

                    if( verified ){
                        
                        // Código OTP válido
                        console.info("Login exitoso")

                        let sessionToken = await generateSessionToken(user, event.identity.sourceIp, db)
                        let cookie = `token=${sessionToken}; ${cookieDefinition}`

                        /*  Verifica IP de origen. Si no se encuentra en el historial, lo notifica */
                        if( !user.origins ){ // Primer login
                            let q = { _id: ObjectID(user._id) }
                            let s = { $set: { origins: [event.identity.sourceIp] } }
                            await db.collection( "admins" ).updateOne( q, s )
                        }else{
                            let origins = user.origins
                            if( !origins.includes( event.identity.sourceIp ) ) { // Origen no reconocido
                                
                                let q = { _id: ObjectID(user._id) }
                                let s = { $push: {origins: event.identity.sourceIp} }
                                await db.collection( "admins" ).updateOne( q, s )

                                /*  Envía notificación de alerta */
                                let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Inicio de sesión en nueva ubicación<br/></h2> <p style="text-align: center;">Apreciable ${user.name}. Hemos detectado que en este momento se ha iniciado sesión en tu cuenta desde un origen distinto al que sueles usar. Si has sido tú, puedes ignorar este alerta.</p><p style="text-align: center;"> En caso de no reconocer este inicio de sesión, por favor envíenos un correo a <strong>soporte@creedito.mx</strong>. </p></div>`
                                let params = {
                                    html: html,
                                    from: "Creedito <no-reply@creedito.mx>",
                                    to: event.body.username,
                                    subject: "Inicio de sesión sospechoso | Creedito"
                                }
                                await sendMail( params )

                            }
                        }
                        client.close()
                        return {message: "ok", user: sanitizeUser( user ), cookie: cookie}

                    }else{
                        // Código OTP incorrecto

                        // Incrementa en 1 el número de intentos fallidos
                        let setter = { $inc: { failedLoginAttempts: 1 } }
                        let tmpQuery = { username: event.body.username }


                        await db.collection( "admins" ).updateOne( tmpQuery, setter )

                        if( user.failedLoginAttempts >= 2 ){
                            setter = { $set: { blocked: true } }
                            tmpQuery = { username: event.body.username }

                            await db.collection( "admins" ).updateOne( tmpQuery, setter )
                            console.info(`Cuenta ${event.body.username} bloqueada por inicios de sesión fallidos`)

                            throw new Error(" blocked ")
                        }

                        console.info("OTP incorrecto")
                        throw new Error(" badotp ")
                    }
                }else{
                    // Solicita el código OTP
                    console.info("Se solicita OTP")
                    throw new Error(" otp_required ")
                }
            }else{
                // Dar acceso
                let sessionToken = await generateSessionToken(user, event.identity.sourceIp, db)
                let cookie = `token=${sessionToken}; ${cookieDefinition}`
                console.info("Login exitoso sin TFA")
                
                client.close()
                return {message: "ok", user: sanitizeUser( user ), cookie: cookie}
            }
        }else{
            
            console.info("Login inválido por datos incorrectos")

            // Incrementa en 1 el número de intentos fallidos
            let setter = { $inc: { failedLoginAttempts: 1 } }
            let tmpQuery = { username: event.body.username }
            let options = { returnNewDocument: true }

            const { value } = await db.collection( "admins" ).findOneAndUpdate( tmpQuery, setter, options )

            if( value.failedLoginAttempts >= 2 ){
                setter = { $set: { blocked: true } }
                tmpQuery = { _id: ObjectID( value._id ) }

                await db.collection( "admins" ).updateOne( tmpQuery, setter )
                console.info(`Cuenta ${value.username} bloqueada por inicios de sesión fallidos`)

                throw new Error(" blocked ")
            }

            throw new Error(" password ")
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }
}