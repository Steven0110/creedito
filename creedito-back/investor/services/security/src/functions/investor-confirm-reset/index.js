'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const sha512 = require('js-sha512').sha512
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })

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

const removeSecurityQuestion = (questions, id) => {
    for( let i = 0 ; i < questions.length ; i++ )
        if( questions[ i ].id === id )
            return questions.slice( i, 1 )

    return questions
}

const sanitizeAnswer = answer => {
    answer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    answer = answer.replace(/\s/g, "")
    answer = answer.toUpperCase()
    answer = sha512( answer )
    return answer
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

        if( event.body.type == "answer" ){

            /*  Verifica respuesta a pregunta de seguridad  */
            let query = {
                username: event.body.username,
                securityQuestions: {
                    $elemMatch: {
                        id: event.body.questionId,
                        answer: sanitizeAnswer( event.body.answer )
                    }
                }
            }

            let user = await db.collection( "investors" ).findOne( query )
            client.close()

            if( user )
                return { message: "ok" }
            else
                throw new Error(" wronganswer ")
            
        }else{

            /*  Verifica respuesta a pregunta de seguridad  */
            let query = {
                username: event.body.username,
                securityQuestions: {
                    $elemMatch: {
                        id: event.body.questionId,
                        answer: sanitizeAnswer( event.body.answer )
                    }
                }
            }
            let setter = {
                $set: {
                    password: sha512( event.body.newPassword ),
                    tfa: false,
                    lastAction: new Date(),
                    resetHash: null,
                    otpTmpToken: null,
                    otpToken: null,
                }
            }
            let options = {
                returnNewDocument: true
            }

            const { value } = await db.collection( "investors" ).findOneAndUpdate( query, setter, options )

            if( value ){
                console.info(`La cuenta ${value.username} ha sido recuperada`)

                /*  Retira pregunta de seguridad usada  */
                let securityQuestions = value.securityQuestions
                let newSecurityQuestions = removeSecurityQuestion( securityQuestions, event.body.questionId )

                query = {
                    _id: ObjectID( value._id )
                }
                setter = {
                    $set: {
                        securityQuestions: newSecurityQuestions
                    }
                }

                await db.collection( "investors" ).updateOne( query, setter)

                /*  notification-password-changed.html  */
                let html = `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Notificación de operación<br/></h2> <p style="text-align: center;">Apreciable ${value.name}. Le informamos que el proceso de recuperación en su cuenta ha finalizado en este momento y su contraseña ha sido modificada exitosamente.</p><p style="text-align: center;"> Si no reconoce ésta operación, por favor envíenos un correo a <strong>soporte@creedito.mx</strong>. </p></div>`
                let params = {
                    html: html,
                    from: "Creedito <no-reply@creedito.mx>",
                    to: value.username,
                    subject: "Notificación de operación | Creedito"
                }
                
                await sendMail( params )
                client.close()

                return { message: "ok" }
            }
            else
                throw new Error(" runtime ")
        }
    }catch(e) {
        client.close()
        console.error( e )
        throw e
    }
}