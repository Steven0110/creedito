'use strict';

/*  S3      */
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
const querystring = require('querystring')

const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN })
const urlUBCubo = process.env.UBCUBO_SEARCH
const UBCuboApiKey = process.env.UBCUBO_API_KEY

const catalog = require("investus-documents")
var FormData = require('form-data')

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

const getAnverso = documents => {
    for(let doc of documents){
        if( doc.type == "ine_anverso" )
            return doc
    }
    return false
}
const getReverso = documents => {
    for(let doc of documents){
        if( doc.type == "ine_reverso" )
            return doc
    }
    return false
}

/*  Métodos de SUMA     */
const getSumaAccessToken = async () => {
    
    let url = `${process.env.SUMA_URL}auth/token`

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

    const result = await axios.post(url, body, config)
    return result.data.access_token
}

const extractMetadata = documentData => {
    console.info("Extrayendo metadatos de la validación")
    let metadata = {}
    let address = {}

    for(let data of documentData) {
        switch(data.type){
            case "FatherSurname":
                metadata.fatherSurname = data.value
                break
            case "MotherSurname":
                metadata.motherSurname = data.value
                break
            case "Name":
                metadata.fullname = data.value
                break
            case "DateOfBirth":
                metadata.birth = new Date(data.value)
                break
            case "PersonalNumber":
                metadata.curp = data.value
                break
            case "Sex":
                metadata.sex = data.value
                break
            case "Voter_Key":
                metadata.claveElector = data.value
                break
            case "AddressCountry":
                address.country = data.value
                break
            case "AddressCounty":
                address.state = data.value
                break
            case "AddressCity":
                address.city = data.value
                break
            case "AddressArea":
                address.county = data.value
                break
            case "AddressStreet":
                address.street = data.value
                break
            case "AddressPostalCode":
                address.zip = data.value
                break
            case "PermanentAddress":
                address.fullAddress = data.value
                break
        }
    }

    metadata.address = address
    return metadata
}

const rejectUserINE = async (user, anverso, reverso, results, db, collection) => {
    console.info(`Se rechaza INE de ${user.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "Documento de Identificación"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${user.name}. Le informamos que la validación del ${documentName} ha finalizado de manera fallida. En la sección Documentos de tu dashboard podrás encontrar detalles acerca del resultado de la validación.</p></div>`,
        from: "Creedito <no-reply@creedito.mx>",
        to: user.username,
        subject: "Validación de documento finalizada | Creedito"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( user._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection(collection).updateMany(query, update)

    reverso = catalog.ine_anverso
    anverso = catalog.ine_reverso

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = false
    reverso.validation = anverso.validation = results

    /*  Vuelva a insertar INE como documento pendiente mas el resultado de la validación*/
    update = {
        $push: {
            pendingDocuments: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection(collection).updateMany(query, update)

}

const rejectInvestorINE = async (investor, anverso, reverso, results, db) => {
    console.info(`Se rechaza INE de ${investor.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "INE"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${investor.name}. Le informamos que la validación del ${documentName} ha finalizado de manera fallida. En la sección Documentos de tu dashboard podrás encontrar detalles acerca del resultado de la validación.</p></div>`,
        from: "Creedito <no-reply@creedito.mx>",
        to: investor.username,
        subject: "Validación de documento finalizada | Creedito"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( investor._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("investors").updateMany(query, update)

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = false
    reverso.validation = anverso.validation = results
    reverso.name = "INE (Reverso)"
    anverso.name = "INE (Anverso)"

    /*  Vuelva a insertar INE como documento pendiente mas el resultado de la validación*/
    update = {
        $push: {
            pendingDocuments: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("investors").updateMany(query, update)

}

const rejectDeveloperINE = async (developer, anverso, reverso, results, db) => {
    console.info(`Se rechaza INE de ${developer.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "INE"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${developer.name}. Le informamos que la validación del ${documentName} ha finalizado de manera fallida. En la sección Documentos de tu dashboard podrás encontrar detalles acerca del resultado de la validación.</p></div>`,
        from: "Creedito <no-reply@creedito.mx>",
        to: developer.username,
        subject: "Validación de documento finalizada | Creedito"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( developer._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("developers").updateMany(query, update)

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = false
    reverso.validation = anverso.validation = results
    reverso.name = "INE (Reverso)"
    anverso.name = "INE (Anverso)"

    /*  Vuelva a insertar INE como documento pendiente mas el resultado de la validación*/
    update = {
        $push: {
            pendingDocuments: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("developers").updateMany(query, update)

}

const updateUserINE = async (user, anverso, reverso, results, db, collection)=> {
    console.info(`Se valida correctamente INE de ${user.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "Documento de Identificación"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${user.name}. Le informamos que la validación del ${documentName} ha finalizado de manera exitosa.</p></div>`,
        from: "Creedito <no-reply@creedito.mx>",
        to: user.username,
        subject: "Validación de documento finalizada | Creedito"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( user._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection( collection ).updateMany(query, update)

    reverso = catalog.ine_anverso
    anverso = catalog.ine_reverso

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = true
    reverso.validation = anverso.validation = results

    /*  Vuelva a insertar INE */
    update = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection( collection ).updateMany(query, update)

}

const updateInvestorINE = async (investor, anverso, reverso, results, db)=> {
    console.info(`Se valida correctamente INE de ${investor.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "INE"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${investor.name}. Le informamos que la validación del ${documentName} ha finalizado de manera exitosa.</p></div>`,
        from: "Investus <no-reply@investus.mx>",
        to: investor.username,
        subject: "Validación de documento finalizada | Investus"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( investor._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("investors").updateMany(query, update)

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = true
    reverso.validation = anverso.validation = results

    /*  Vuelva a insertar INE */
    update = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("investors").updateMany(query, update)

}

const updateDeveloperINE = async (developer, anverso, reverso, results, db)=> {
    console.info(`Se valida correctamente INE de ${developer.username}: ${results.message}`)

    /*  Notificar al inversionista  */
    let documentName = "INE"
    let params = {
        html: `<div> <h2 style="text-align: center; color: #8396d3; font-family: Arial;">Validación de documento<br/></h2> <p style="text-align: center;">Apreciable ${developer.name}. Le informamos que la validación del ${documentName} ha finalizado de manera exitosa.</p></div>`,
        from: "Investus <no-reply@investus.mx>",
        to: developer.username,
        subject: "Validación de documento finalizada | Investus"
    }
    sendMail( params )

    const query = {
        _id: ObjectID( developer._id )
    }
    let update = {
        $pull: {
            documents: {
                key: {
                    $in: [anverso.key, reverso.key]
                }
            }
        }
    }

    /*  Borra INE para modificarlo y volverlo a agregar     */
    await db.collection("developers").updateMany(query, update)

    reverso.processed = anverso.processed = true
    reverso.processing = anverso.processing = false
    reverso.valid = anverso.valid = true
    reverso.validation = anverso.validation = results

    /*  Vuelva a insertar INE */
    update = {
        $push: {
            documents: {
                $each: [anverso, reverso]
            }
        }
    }
    await db.collection("developers").updateMany(query, update)

}
const updateUser = async (user, metadata, db, collection) => {
    const query = {
        _id: ObjectID( user._id )
    }
    const update = {
        $set: {
            info: metadata
        }
    }
    await db.collection( collection ).updateMany(query, update)
}

const updateInvestor = async (investor, metadata, db) => {
    const query = {
        _id: ObjectID( investor._id )
    }
    const update = {
        $set: {
            info: metadata
        }
    }
    await db.collection("investors").updateMany(query, update)
}

const updateDeveloper = async (developer, metadata, db) => {
    const query = {
        _id: ObjectID( developer._id )
    }
    const update = {
        $set: {
            info: metadata
        }
    }
    await db.collection("developers").updateMany(query, update)
}

const checkUserValidation = async (user, sumaToken, db, collection) => {
    console.info("Revisando INE....")
    const anverso = getAnverso( user.documents )
    const reverso = getReverso( user.documents )
    
    const uuid = anverso.validation.uuid

    /*  Consulta estatus de verificación     */
    let params = {}
    params.uuid = uuid
    let url = `${process.env.SUMA_URL}id/status`
    const config = {
        headers: {
            "Authorization": `Bearer ${sumaToken}`
        }
    }
    const { data } = await axios.post(url, params, config)
    console.info(`Estatus de validación para INE de ${user.username}: ${ data }`)
    if( data == "Checked" ){ // Verificación terminada
        /*  Consulta resultados de verificación     */
        url = `${process.env.SUMA_URL}id/results`
        params.includeImages = false

        let response = await axios.post(url, params, config)
        let validationData = response.data

        let result = {}
        result.message      = validationData.globalResultDescription
        result.altMessage   = validationData.securityLevelDescription
        result.comment      = validationData.expertComments
        result.globalResult = validationData.globalResult
        result.totalChecks  = validationData.totalChecks
        result.successChecks= validationData.successChecks
        result.failedChecks = validationData.failedChecks
        result.warningChecks= validationData.warningChecks

        if( validationData.globalResult == "Ok" ){
            /*  Actualiza INE con resultados de SUMA    */
            const metadata = extractMetadata( validationData.documentData )
            await updateUserINE(user, anverso, reverso, result, db, collection)
            await updateUser(user, metadata, db, collection)

            /*  Consulta en listas negras   */
            await searchPerson(metadata, user, db, collection)
        }else{
            /*  Rechaza INE     */
            await rejectUserINE(user, anverso, reverso, result, db, collection)
        }

    }else if( data == "Error" ){ // Error durante validación
        let result = {message: "Hubo un error durante el proceso de validación."}
        await rejectInvestorINE(user, anverso, reverso, result, db)
    }
}


const checkInvestorValidation = async (investor, sumaToken, db) => {
    console.info("Revisando INE....")
    const anverso = getAnverso( investor.documents )
    const reverso = getReverso( investor.documents )
    
    const uuid = anverso.validation.uuid

    /*  Consulta estatus de verificación     */
    let params = {}
    params.uuid = uuid
    let url = `${process.env.SUMA_URL}id/status`
    const config = {
        headers: {
            "Authorization": `Bearer ${sumaToken}`
        }
    }
    const { data } = await axios.post(url, params, config)
    console.info(`Estatus de validación para INE de ${investor.username}: ${ data }`)
    if( data == "Checked" ){ // Verificación terminada
        /*  Consulta resultados de verificación     */
        url = `${process.env.SUMA_URL}id/results`
        params.includeImages = false

        let response = await axios.post(url, params, config)
        let validationData = response.data

        let result = {}
        result.message      = validationData.globalResultDescription
        result.altMessage   = validationData.securityLevelDescription
        result.comment      = validationData.expertComments
        result.globalResult = validationData.globalResult
        result.totalChecks  = validationData.totalChecks
        result.successChecks= validationData.successChecks
        result.failedChecks = validationData.failedChecks
        result.warningChecks= validationData.warningChecks

        if( validationData.globalResult == "Ok" ){
            /*  Actualiza INE con resultados de SUMA    */
            const metadata = extractMetadata( validationData.documentData )
            await updateInvestorINE(investor, anverso, reverso, result, db)
            await updateInvestor(investor, metadata, db)

            /*  Consulta en listas negras   */
            await searchPerson(metadata, investor, db, "investors")
        }else{
            /*  Rechaza INE     */
            await rejectInvestorINE(investor, anverso, reverso, result, db)
        }

    }else if( data == "Error" ){ // Error durante validación
        let result = {message: "Hubo un error durante el proceso de validación."}
        await rejectInvestorINE(investor, anverso, reverso, result, db)
    }
}


const checkDeveloperValidation = async (developer, sumaToken, db) => {
    console.info("Revisando INE....")
    const anverso = getAnverso( developer.documents )
    const reverso = getReverso( developer.documents )
    
    const uuid = anverso.validation.uuid

    /*  Consulta estatus de verificación     */
    let params = {}
    params.uuid = uuid
    let url = `${process.env.SUMA_URL}id/status`
    const config = {
        headers: {
            "Authorization": `Bearer ${sumaToken}`
        }
    }
    const { data } = await axios.post(url, params, config)
    console.info(`Estatus de validación para INE de ${developer.username}: ${ data }`)
    if( data == "Checked" ){ // Verificación terminada
        /*  Consulta resultados de verificación     */
        url = `${process.env.SUMA_URL}id/results`
        params.includeImages = false

        let response = await axios.post(url, params, config)
        let validationData = response.data

        let result = {}
        result.message      = validationData.globalResultDescription
        result.altMessage   = validationData.securityLevelDescription
        result.comment      = validationData.expertComments
        result.globalResult = validationData.globalResult
        result.totalChecks  = validationData.totalChecks
        result.successChecks= validationData.successChecks
        result.failedChecks = validationData.failedChecks
        result.warningChecks= validationData.warningChecks

        if( validationData.globalResult == "Ok" ){
            /*  Actualiza INE con resultados de SUMA    */
            const metadata = extractMetadata( validationData.documentData )
            await updateDeveloperINE(developer, anverso, reverso, result, db)
            await updateDeveloper(developer, metadata, db)

            /*  Consulta en listas negras   */
            await searchPerson(metadata, developer, db, "developers")
        }else{
            /*  Rechaza INE     */
            await rejectDeveloperINE(developer, anverso, reverso, result, db)
        }

    }else if( data == "Error" ){ // Error durante validación
        let result = {message: "Hubo un error durante el proceso de validación."}
        await rejectDeveloperINE(developer, anverso, reverso, result, db)
    }
}


const processUsers = async (db, collection, sumaToken) => {
    /*  Obtiene usuarios con documentos en proceso*/
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: true,
                processed: false
            }
        }
    }

    const users = await db.collection( collection ).find( q ).toArray()
    if( users && users.length != 0 ){

        if( !sumaToken )
            sumaToken = await getSumaAccessToken() //Solicita Token de Acceso

        for(let user of users){
            await checkUserValidation( user, sumaToken, db, collection )
        }
    }else
        return false
}


const processInvestors = async db => {
    /*  Obtiene usuarios con documentos en proceso*/
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: true,
                processed: false
            }
        }
    }

    const investors = await db.collection( "investors" ).find( q ).toArray()
    if( investors && investors.length != 0 ){
        const sumaToken = await getSumaAccessToken() //Solicita Token de Acceso
        for(let investor of investors){
            await checkInvestorValidation( investor, sumaToken, db )
        }
    }
}

const processDevelopers = async db => {
    /*  Obtiene usuarios con documentos en proceso*/
    let q = {
        documents: {
            $elemMatch: {
                valid: false,
                processing: true,
                processed: false
            }
        }
    }

    const developers = await db.collection( "developers" ).find( q ).toArray()
    if( developers && developers.length != 0 ){
        const sumaToken = await getSumaAccessToken() //Solicita Token de Acceso
        for(let developer of developers){
            await checkDeveloperValidation( developer, sumaToken, db )
        }
    }
}

const searchPerson = async (metadata, user, db, collection) => {
    let formData = new FormData()
    formData.append("nombre", metadata.fullname)
    formData.append("apaterno", metadata.fatherSurname)
    formData.append("amaterno", metadata.motherSurname)
    formData.append("tipo_busqueda", "normal")
    formData.append("tipo_persona", (user.type || "fisica").toUpperCase())

    if( metadata.curp )
        formData.append("curp", metadata.curp)

    if( user.rfc )
        formData.append("rfc", user.rfc)

    console.log({
        nombre: metadata.fullname,
        apaterno: metadata.fatherSurname,
        amaterno: metadata.motherSurname,
        tipo_persona: (user.type || "fisica").toUpperCase()
    })

    console.log( formData )
    
    let config = {}
    config.headers = formData.getHeaders()
    config.headers["X-API-KEY"] = UBCuboApiKey

    const { data } = await axios.post(urlUBCubo, formData, config)

    if( data && data.parameters && data.parameters.result ){
        console.info(`Resultado de búsqueda de ${metadata.fullname}:`)
        console.info(JSON.stringify(data.parameters.result))

        const q = {
            _id: ObjectID( user._id )
        }
        const u = {
            $set: {
                searchResults: data.parameters.result
            }
        }

        await db.collection( collection ).updateOne( q, u )

        return true

    }else
        return false
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    // Registro de auditoría genérico

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{

        await client.connect()

        db = client.db( dbName )

        let sumaToken = await processUsers( db, "investors", false )
        await processUsers( db, "developers", sumaToken )
        
        await client.close()
        return "Done"
    }catch(e) {
        await client.close()
        //console.error( JSON.stringify(e) )
        console.error( e.message )
        throw new Error( e )
    }
};
