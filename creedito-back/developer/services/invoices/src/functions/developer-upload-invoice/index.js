'use strict';

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME

const catalog = require("investus-documents")
const xml2js = require('xml2js')

const AWS = require('aws-sdk')
AWS.config.update({ accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: "us-west-2" })
const lambda = new AWS.Lambda({region: "us-west-2"})
const s3 = new AWS.S3()
const BUCKET = process.env.S3_BUCKET

const crypto = require("crypto")
const sha512 = require('js-sha512').sha512

const axios = require("axios")
const timboxURL = process.env.TIMBOX_URL
const timboxSearch = process.env.TIMBOX_SEARCH
const timboxUser = process.env.TIMBOX_USER
const timboxPassword = process.env.TIMBOX_PASSWORD

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

const randomString = length => {
    let result           = ''
    let characters       = '0123456789'
    let charactersLength = characters.length
    for( let i = 0; i < length; i++ )
       result += characters.charAt(Math.floor(Math.random() * charactersLength))

    return result
}

const validateInvoice = xmlB64 => {
    let xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:WashOut">
       <soapenv:Header/>
       <soapenv:Body>
          <urn:validar_cfdi soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
             <username xsi:type="xsd:string">${timboxUser}</username>
             <password xsi:type="xsd:string">${timboxPassword}</password>
             <validar xsi:type="urn:comprobante">
                <Comprobante xsi:type="urn:Comprobante">
                   <external_id xsi:type="xsd:string">${randomString(29)}</external_id>
                   <sxml xsi:type="xsd:string">${xmlB64}</sxml>
                </Comprobante>
             </validar>
          </urn:validar_cfdi>
       </soapenv:Body>
    </soapenv:Envelope>`

    let config = {
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "validar_cfdi"
        }
    }
    return axios.post(timboxURL, xml, config)
}

const findRelatedInvoices = (rfcEmisor, rfcReceptor) => {
    console.info(`Se buscan facturas relacionadas para RFC Emimsor: ${rfcEmisor} y RFC Receptor: ${rfcReceptor}`)

    const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:WashOut">
       <soapenv:Header/>
       <soapenv:Body>
          <urn:buscar_cfdis soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
             <username xsi:type="xsd:string">${timboxUser}</username>
             <password xsi:type="xsd:string">${timboxPassword}</password>
             <parametros_cfdis xsi:type="urn:parametros_cfdis">
                <rfc_emisor xsi:type="xsd:string">${rfcEmisor}</rfc_emisor>
                <rfc_receptor xsi:type="xsd:string">${rfcReceptor}</rfc_receptor>
                <limit xsi:type="xsd:string">12</limit>
             </parametros_cfdis>
          </urn:buscar_cfdis>
       </soapenv:Body>
    </soapenv:Envelope>`

    let config = {
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "buscar_cfdis"
        }
    }
    return axios.post(timboxSearch, xml, config)
}

const generateKey = email => crypto.createHash('sha256').update(sha512( email )).digest('base64').substr(0, 32)

/*  Encrypt Files   */
const encrypt = (buffer, secret) => {
    const algorithm = 'aes-256-ctr'
    const key = generateKey( secret )
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

    return result
}

const parseSATResponse = async response => {

    let validations = {}
    let parser = new xml2js.Parser()
    let json = await parser.parseStringPromise( response )

    let xmlResult = json["soap:Envelope"]["soap:Body"][0]["tns:validar_cfdi_response"][0].validar_cfdi_result[0].resultados[0]._
    let result = await parser.parseStringPromise( xmlResult )

    validations.respuestaSAT = result.comprobante.consulta_sat[0]
    validations.validezSAT = result.comprobante.informacion_cfdi[0].validez_certificado[0].value[0].replace("UTC", "UTC ")
    validations.lco = result.comprobante.informacion_cfdi[0].lco[0].message[0]
    validations.respuestaTimbox = result.comprobante.estatus_validacion[0].message[0]

    return validations

}

const parseSearchResponse = async response => {

    let relatedInvoices = []

    let parser = new xml2js.Parser()
    let json = await parser.parseStringPromise( response )

    let quantity = Number(json["soap:Envelope"]["soap:Body"][0]["tns:buscar_cfdis_response"][0]["buscar_cfdis_result"][0]["cantidad"][0]._ || 0)
    if( quantity > 0){
        let xmlResult = json["soap:Envelope"]["soap:Body"][0]["tns:buscar_cfdis_response"][0]["buscar_cfdis_result"][0]["comprobantes"][0]._
        let result = await parser.parseStringPromise( xmlResult )
        relatedInvoices = result.comprobantes.cfdi

        relatedInvoices = relatedInvoices.map(obj => {
            return {
                UUID:           obj.UUID[0],
                Serie:          obj.Serie[0],
                Folio:          obj.Folio[0],
                FechaEmision:   obj.FechaEmision[0],
                FechaTimbrado:  obj.FechaTimbrado[0],
                RFCEmisor:      obj.RFCEmisor[0],
                NombreEmisor:   obj.NombreEmisor[0],
                RFCReceptor:    obj.RFCReceptor[0],
                NombreReceptor: obj.NombreReceptor[0],
                Tipo:           obj.Tipo[0],
                Estatus:        obj.Estatus[0],
                Total:          obj.Total[0]._,
            }
        })
    }

    return relatedInvoices
}

const parseCFDI = async response => {

    let parser = new xml2js.Parser()
    let json = await parser.parseStringPromise( response )

    let invoice = {}

    try{

        // Emisor
        invoice.emisor = {}
        invoice.emisor.rfc = json["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]["Rfc"]
        invoice.emisor.nombre = json["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]["Nombre"]
        invoice.emisor.regimen = json["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]["RegimenFiscal"]

        // Receptor
        invoice.receptor = {}
        invoice.receptor.rfc = json["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]["Rfc"]
        invoice.receptor.nombre = json["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]["Nombre"]
        invoice.receptor.usoCFDI = json["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]["UsoCFDI"]
        
        invoice.formaPago = json["cfdi:Comprobante"]["$"]["FormaPago"]
        invoice.tipoComprobante = json["cfdi:Comprobante"]["$"]["TipoDeComprobante"]
        invoice.metodoPago = json["cfdi:Comprobante"]["$"]["MetodoPago"]
        invoice.moneda = json["cfdi:Comprobante"]["$"]["Moneda"]
        invoice.lugarExpedicion = json["cfdi:Comprobante"]["$"]["LugarExpedicion"]
        invoice.fechaEmision = new Date(json["cfdi:Comprobante"]["$"]["Fecha"])
        invoice.total = Number(json["cfdi:Comprobante"]["$"]["Total"])
        invoice.subtotal = Number(json["cfdi:Comprobante"]["$"]["SubTotal"])
        invoice.version = json["cfdi:Comprobante"]["$"]["Version"]
        invoice.certificado = json["cfdi:Comprobante"]["$"]["Certificado"]
        invoice.noCertificado = json["cfdi:Comprobante"]["$"]["NoCertificado"]
        invoice.sello = json["cfdi:Comprobante"]["$"]["Sello"]

        invoice.conceptos = []
        for(let obj of json["cfdi:Comprobante"]["cfdi:Conceptos"]){
            let _concepto = obj["cfdi:Concepto"][0]

            let concepto = {}
            concepto.claveProdServ  = _concepto["$"]["ClaveProdServ"]
            concepto.cantidad       = Number(_concepto["$"]["Cantidad"])
            concepto.claveUnidad    = _concepto["$"]["ClaveUnidad"]
            concepto.unidad         = _concepto["$"]["Unidad"]
            concepto.descripcion    = _concepto["$"]["Descripcion"]
            concepto.valorUnitario  = Number(_concepto["$"]["ValorUnitario"])
            concepto.importe        = Number(_concepto["$"]["Importe"])

            //concepto.impuestos = {traslados: [], retencion: []}
            /*for(let imp of _concepto["cfdi:Impuestos"]){

                if( imp["cfdi:Traslados"]){
                    let _impuesto = 
                }else if(imp["cfdi:Traslados"]){

                }
                let _impuesto = imp["cfdi:Traslados"][0]["cfdi:Traslado"]
                let impuesto = {}
            }*/

            invoice.conceptos.push( concepto )
        }

        let impuestos = {trasladados: {}}

        impuestos.trasladados.impuesto = Number(json["cfdi:Comprobante"]["cfdi:Impuestos"][0]["$"]["TotalImpuestosTrasladados"])        
        invoice.impuestos = impuestos

        /*  Timbre  */
        invoice.uuid = json["cfdi:Comprobante"]["cfdi:Complemento"][0]["tfd:TimbreFiscalDigital"][0]["$"]["UUID"]
        invoice.fechaTimbrado = new Date(json["cfdi:Comprobante"]["cfdi:Complemento"][0]["tfd:TimbreFiscalDigital"][0]["$"]["FechaTimbrado"])
        invoice.selloSAT = json["cfdi:Comprobante"]["cfdi:Complemento"][0]["tfd:TimbreFiscalDigital"][0]["$"]["SelloSAT"] // Timbre Fiscal Digital (TFD)

        return invoice
    }catch(err){
        return false
    }

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
            throw " unauthorized "
        else{            

            db = client.db( dbName )

            /*  Revisa si el usuario ya está validado   */
            const q = {_id: ObjectID( event.enhancedAuthContext._id )}

            let user = await db.collection( "developers" ).findOne( q )

            //if( user && user.valid ){ //Los documentos del usuario están en regla y su cuenta ha sido validada
            if( true ){ //Temporalmente se omite la validacion de la cuenta
                
                /*  Se extrae la información del XML    */
                let buffer = Buffer.from(event.body.data, 'base64')
                let xmlString = buffer.toString()

                let invoice = await parseCFDI( xmlString )

                /*  Se valida la factura en el SAT via Timbox   */
                let { data } = await validateInvoice( event.body.data )
                let validations = await parseSATResponse( data )
                invoice.validations = validations

                /*  Se buscan facturas con mismo receptor y emisor   */
                let result = await findRelatedInvoices( invoice.emisor.rfc, invoice.receptor.rfc )
                let relatedInvoices = await parseSearchResponse( result.data )
                invoice.relatedInvoices = relatedInvoices

                /* -------------------- */
                /*  Reglas de negocio para aprobación y rechazo automático de facturas */
                /* -------------------- */

                /*  Valida con Timbox   */

                /*  Almacena en S3  */
                let encrypted = encrypt(buffer, event.enhancedAuthContext.username)
                let key = `facturas/${new Date().toISOString()}.xml` // UUID
                let params = {
                    "Bucket": BUCKET,
                    "Key": key,
                    "Body": encrypted,
                    "ACL": "private"
                }
                let uploadResponse = await s3.putObject( params ).promise()
                if( uploadResponse.ETag){ //OK
                    invoice.userId = ObjectID( event.enhancedAuthContext._id )
                    invoice.status = "waiting" //Temporalmente se asume que la factura está OK
                    invoice.createdAt = new Date()
                    invoice.key = key

                    let response = await db.collection( "invoices" ).insertOne( invoice )
                    client.close()

                    if( response.result.ok === 1 && response.result.n === 1 )
                        return {_id: response.insertedId}
                    else
                        throw "[upload]"
                }else
                    throw "[upload]"

            }else{
                throw "[forbidden]"
            }


        }

    }catch(e) {
        client.close()
        console.error( e )
        throw new Error( e )
    }
};
