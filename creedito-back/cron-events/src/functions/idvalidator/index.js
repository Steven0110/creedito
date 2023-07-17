'use strict';

/*  S3  */
const AWS = require('aws-sdk')
AWS.config.update({ accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: "us-west-2" })
const lambda = new AWS.Lambda({region: "us-west-2"})
const s3 = new AWS.S3()

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const axios = require("axios")
const crypto = require("crypto")
const sha512 = require('js-sha512').sha512
const querystring = require('querystring')

/*  Métodos de SUMA     */
const getSumaAccessToken = async () => {
    
    let url = `${process.env.SUMA_URL}auth/token`

    console.log("Se solicita token de acceso de SUMA México")
    throw new Error("Interceptor")

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }

    const body = querystring.stringify({
        grant_type: "client_credentials",
        client_id: process.env.SUMA_ID,
        client_secret: process.env.SUMA_SECRET,
        audience: "veridocid",
    })

    console.log({
        grant_type: "client_credentials",
        client_id: process.env.SUMA_ID,
        client_secret: process.env.SUMA_SECRET,
        audience: "veridocid",
    })

    const result = await axios.post(url, body, config)
    return result.data.access_token
}

const generateKey = secret => crypto.createHash('sha256').update(sha512( secret )).digest('base64').substr(0, 32)

/*  Desencripta archivo    */
const decrypt = (encrypted, email) => {
    console.log("Email:", email)
    console.info("Descriptando archivo")
    const algorithm = 'aes-256-ctr'
    const key = generateKey( email )
    const iv = encrypted.slice(0, 16)
    encrypted = encrypted.slice(16)
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return result
}

/*  Descarga de S3  */
const getFile = async key => {
    console.info(`Descargando archivo ${key}`)
    const params = {
        Key: key,
        Bucket: process.env.S3_BUCKET
    }
    const { Body } = await s3.getObject(params).promise()
    return Body //Buffer
}
/*  Convierte a Base64  */
const toBase64 = buffer => buffer.toString('base64')

/*  Detecta si en los documentos del usuario el INE está completo y lo envía a SUMA    */
const getReverso = documents => {
    console.info("Revisando Reverso....")
    for(let doc of documents){
        if( doc.type == "ine_reverso" )
            return doc
    }
    return false
}
const getAnverso = documents => {
    console.info("Revisando Anverso....")
    for(let doc of documents){
        if( doc.type == "ine_anverso" )
            return doc
    }
    return false
}

/*  Actualizador genérico */
const updateUserINE = async (user, anverso, reverso, db, collection) => {
    const query = {
        _id: ObjectID( user._id )
    }

    let setter = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }


    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection( collection ).updateMany(query, setter)

    /*  Vuelva a insertar INE */
    setter = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection( collection ).updateMany(query, setter)

    return true
}

const updateInvestorINE = async (investor, anverso, reverso, db) => {
    const query = {
        _id: ObjectID( investor._id )
    }
    let setter = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }


    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("investors").updateMany(query, setter)

    /*  Vuelva a insertar INE */
    setter = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("investors").updateMany(query, setter)

    return true
}

const updateDeveloperINE = async (developer, anverso, reverso, db) => {
    const query = {
        _id: ObjectID( developer._id )
    }
    let setter = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }


    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("developers").updateMany(query, setter)

    /*  Vuelva a insertar INE */
    setter = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("developers").updateMany(query, setter)

    return true
}

const checkUserID = async (user, sumaToken, db, collection) => {
    console.info(`Buscando ID de ${user.username}`)

    let anverso = getAnverso( user.documents )
    let reverso = getReverso( user.documents )

    if( anverso && reverso ){
        console.info(`El usuario ${user.username} tiene ID pendiente por validar`)

        /*  Sube el documento a SUMA */

        if( !sumaToken )
            sumaToken = await getSumaAccessToken() //Solicita Token de Acceso

        let encryptedA = await getFile( anverso.key ) //Descarga anverso en base64 (encriptado)
        let encryptedR = await getFile( reverso.key ) //Descarga reverso en base64 (encriptado)

        let decryptedA = decrypt( encryptedA, user.username )
        let decryptedR = decrypt( encryptedR, user.username )
        
        const base64A = toBase64( decryptedA )
        const base64R = toBase64( decryptedR )

        const url = `${process.env.SUMA_URL}id/verify`
        let params = {}
        const config = {
            headers: {
                "Authorization": `Bearer ${sumaToken}`
            }
        }

        params.frontImage = base64A
        params.backImage  = base64R
        params.id = "id"

        const { data } = await axios.post(url, params, config)
        const uuid = data
        console.log("UUID de VerIDocID: " + uuid)

        /*  Actualiza INE (Anverso y reverso)  */
        reverso.validation = anverso.validation = {uuid: uuid}
        reverso.processing = anverso.processing = true

        await updateUserINE( user, anverso, reverso, db, collection)

        return sumaToken
    }else
        return false
}

const checkInvestorINE = async (investor, sumaToken, db) => {
    console.info("Revisando INE....")
    let anverso = getAnverso( investor.documents )
    let reverso = getReverso( investor.documents )

    if( anverso && reverso ){

        /*  Sube el documento a SUMA */
        let encryptedA = await getFile( anverso.key ) //Descarga anverso en base64 (encriptado)
        let encryptedR = await getFile( reverso.key ) //Descarga reverso en base64 (encriptado)

        let decryptedA = decrypt( encryptedA, investor.username )
        let decryptedR = decrypt( encryptedR, investor.username )
        
        const base64A = toBase64( decryptedA )
        const base64R = toBase64( decryptedR )

        const url = `${process.env.SUMA_URL}id/verify`
        let params = {}
        const config = {
            headers: {
                "Authorization": `Bearer ${sumaToken}`
            }
        }

        params.frontImage = base64A
        params.backImage  = base64R
        params.id = "id"

        const { data } = await axios.post(url, params, config)
        const uuid = data
        console.log("UUID:", uuid)

        /*  Actualiza INE (Anverso y reverso)  */
        reverso.validation = anverso.validation = {uuid: uuid}
        reverso.processing = anverso.processing = true

        await updateInvestorINE( investor, anverso, reverso, db)

    }
}

const checkDeveloperINE = async (developer, sumaToken, db) => {
    console.info("Revisando INE....")
    let anverso = getAnverso( developer.documents )
    let reverso = getReverso( developer.documents )

    if( anverso && reverso ){

        /*  Sube el documento a SUMA */
        let encryptedA = await getFile( anverso.key ) //Descarga anverso en base64 (encriptado)
        let encryptedR = await getFile( reverso.key ) //Descarga reverso en base64 (encriptado)

        let decryptedA = decrypt( encryptedA, developer.username )
        let decryptedR = decrypt( encryptedR, developer.username )
        
        const base64A = toBase64( decryptedA )
        const base64R = toBase64( decryptedR )

        const url = `${process.env.SUMA_URL}id/verify`
        let params = {}
        const config = {
            headers: {
                "Authorization": `Bearer ${sumaToken}`
            }
        }

        params.frontImage = base64A
        params.backImage  = base64R
        params.id = "id"

        const { data } = await axios.post(url, params, config)
        const uuid = data
        console.log("UUID:", uuid)

        /*  Actualiza INE (Anverso y reverso)  */
        reverso.validation = anverso.validation = {uuid: uuid}
        reverso.processing = anverso.processing = true

        await updateDeveloperINE( developer, anverso, reverso, db)

    }
}

/*
 *  Esta función se encarga de revisar que el INE se haya subido completo, para entonces crear la validación en SUMA
 */
const processUsers = async (db, collection, sumaToken) => {
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: false,
                processed: false,
                type: {
                    $in: ["ine_anverso", "ine_reverso"]
                }
            }
        }
    }

    const users = await db.collection( collection ).find( q ).toArray()
    if( users && users.length != 0 ){
        let result

        for(let user of users){
            result = await checkUserID( user, sumaToken, db, collection )

            if( result )
                sumaToken = result
        }

        return sumaToken
    }else
        return false

}

const processInvestors = async db => {
    /*  Obtiene usuarios con INEs pendientes sin procesar*/
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: false,
                processed: false
            }
        }
    }

    const investors = await db.collection( "investors" ).find( q ).toArray()
    if( investors && investors.length != 0 ){
        const sumaToken = await getSumaAccessToken() //Solicita Token de Acceso
        for(let investor of investors){
            await checkInvestorINE( investor, sumaToken, db )
        }
    }

}


const processDevelopers = async db => {
    /*  Obtiene usuarios con INEs pendientes sin procesar*/
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: false,
                processed: false
            }
        }
    }

    const developers = await db.collection( "developers" ).find( q ).toArray()
    if( developers && developers.length != 0 ){
        const sumaToken = await getSumaAccessToken() //Solicita Token de Acceso
        for(let developer of developers){
            await checkDeveloperINE( developer, sumaToken, db )
        }
    }

}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db, sumaToken

    try{

        await client.connect()

        db = client.db( dbName )


        /**
          *
          * Todos los métodos regresan el token de Suma, en caso de que alguno no lo haya solicitado
          * Tal que si el primero no lo solicita (porque no lo necesita), el segundo pueda solicitarlo y 
          * los métodos consecuentes puedan usarlo
          * 
          **/

        /*  Procesa primero el ID en los documentos del usuario per se  */
        sumaToken = await processUsers( db, "investors", false )
        sumaToken = await processUsers( db, "developers", sumaToken )

        await client.close()
        return "Done"
    }catch(e) {
        await client.close()
        console.error( e.message )
        throw new Error( e )
    }
};
