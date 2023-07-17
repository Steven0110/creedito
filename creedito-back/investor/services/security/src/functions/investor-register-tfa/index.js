'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const speakeasy = require("speakeasy")
const QRCode = require('qrcode')


const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

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

        db = client.db( dbName )
        console.log(JSON.stringify(event))
        if( !event.headers.Cookie ){
            console.info("Se detectó una sesión inválida")
            throw new Error(" invalidsession ")
        }

        let sessionToken = findToken( event.headers.Cookie )
        
        if( event.body.type == "verify" ){
            let query = {
                sessionToken: sessionToken
            }
            let user = await db.collection( "investors" ).findOne( query )
            let otpTmpToken = user.otpTmpToken
            let otp = event.body.otp

            if( otpTmpToken && otp ){
                let verified = speakeasy.totp.verify({ secret: otpTmpToken, encoding: 'base32', token: otp })

                if( verified ){
                    let query = {
                        _id: ObjectID( user._id )
                    }
                    let setter = {
                        $set: {
                            otpToken: otpTmpToken,
                            tfa: true
                        },
                        $unset: {
                            otpTmpToken: ""
                        }
                    }
                    await db.collection( "investors" ).updateOne( query, setter )

                    console.info(`Segundo factor activado correctamente para ${user.username}`)
                    return Promise.resolve({message: "TFA activado correctamente"})
                }else{
                    console.info("OTP inválido")
                    throw new Error(" badotp ")
                }
            }else{
                console.info("Error al obtener el token OTP")
                throw new Error(" notok ")
            }
        }else{
            
            let secret = speakeasy.generateSecret({name: "Inversionista (Creedito)"})

            let query = {
                sessionToken: sessionToken
            }

            let setter = {
                $set: {
                    otpTmpToken: secret.base32
                }
            }

            await db.collection( "investors" ).updateOne( query, setter )

            console.info("Código QR generado")
            client.close()
            return QRCode.toDataURL(secret.otpauth_url, {quality: 1, errorCorrectionLevel: "H"})
        }

    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
