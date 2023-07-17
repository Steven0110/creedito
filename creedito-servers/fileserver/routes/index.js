require('dotenv').config()

/*	EXPRESS 	*/
var express = require('express')
var router = express.Router()
const bodyParser = require("body-parser")
const busboy = require('connect-busboy')

/*	S3 	*/
const AWS = require('aws-sdk')
AWS.config.update({ accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: "us-west-2" })
const lambda = new AWS.Lambda({region: "us-west-2"})
const s3 = new AWS.S3()
const BUCKET = process.env.BUCKET

/* SUMA MÉXICO - VeriDocID*/
const axios = require("axios")
const sumaAPI = process.env.SUMA_URL
const querystring = require('querystring')

/*	ENCRYPTION 	*/
const fs = require("fs")
const crypto = require("crypto")
const sha512 = require('js-sha512').sha512

/*	FIEL 	*/
const tmpPath = "/tmp/creedito"
const Asn1js = require('asn1js')
const Pkijs = require('pkijs')
const openssl = require('openssl-nodejs')
const formats = require("./sign/sign.js")

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(busboy())

const randomString = length => {
	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let string = ""
	for( let i = 0 ; i < length ; i++ )
		string += alphabet.charAt( Math.ceil( Math.random() * ( alphabet.length - 1 ) ) )

	return string
}

/*	Get file extension (.xlsx, .mp4, etc)  	*/
const getFileExtension = filename => {
	let parts = filename.split(".")
	return parts[ parts.length - 1 ]
}


const generateKey = email => crypto.createHash('sha256').update(sha512( email )).digest('base64').substr(0, 32)
/*	Encrypt Files 	*/
const encrypt = (buffer, secret) => {
	const algorithm = 'aes-256-ctr'
    const key = generateKey( secret )
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

    return result
}
/*	Decrypt Files 	*/
const decrypt = (encrypted, secret) => {
	console.log( secret )
	const algorithm = 'aes-256-ctr'
    const key = generateKey( secret )
	const iv = encrypted.slice(0, 16)
	encrypted = encrypted.slice(16)
	const decipher = crypto.createDecipheriv(algorithm, key, iv)
	const result = Buffer.concat([decipher.update(encrypted), decipher.final()])

	return result
}

/* S3 STORAGE 	*/
const s3Upload = params => s3.putObject( params ).promise()
const s3Download = params => s3.getObject( params ).promise()

/* FIEL 	*/
const signString = (string, key) => {
	var signerObject = crypto.createSign("SHA256")
	signerObject.update( string )
	let signature = signerObject.sign( key, "base64" )
	return signature
}
const getCertificateInfo = cer => {
	try{
		const der = Buffer.from(cer, 'base64')
		const ber = new Uint8Array(der).buffer

		// And now Asn1js can decode things \o/
		const asn1 = Asn1js.fromBER(ber)

		let map = new Pkijs.Certificate({ schema: asn1.result })
		let info = {}

		for( let i = 0 ; i < map.subject.typesAndValues.length ; i++ ){
			let item = map.subject.typesAndValues[ i ]

			switch( item.type ){
				case "2.5.4.45":
					info.rfc = item.value.valueBlock.value
					break
				case "2.5.4.5":
					info.curp = item.value.valueBlock.value
					break
				case "2.5.4.3":
				case "2.5.4.10":
				case "2.5.4.41":
					info.name = item.value.valueBlock.value
					break
			}
		}

		info.expired = new Date() > new Date(map.notAfter.value)

		return info

	}catch(e) {
		return {error: e.message}
	}
}


/*		EXPRESS ROUTES	 */
router.get('/', function(req, res){
	res.status(200).json({message: "Hello"})
})

router.post('/test', function(req, res){
	res.status(200).json({message: "Ok"})
})

router.post('/upload', function(req, res){

	let formData = new Map()
	let chunk = null,
		tmpFilename,
		originalFilename,
		originalMimetype

	req.pipe(req.busboy)

	req.busboy.on('field', function(fieldname, val) {
		formData.set(fieldname, val)
    });

	req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		
		originalFilename = filename

		file.on('data', function(data) {
			chunk = data
      	})

		tmpFilename = formData.get("dzuuid") + "." + getFileExtension( filename )

		fstream = fs.createWriteStream('/tmp/creedito/' + tmpFilename, {flags: 'a'})
		file.pipe(fstream)

	})
	req.busboy.on('finish', function () {
		// Se sube a S3
		res.status(200).json({
			file: {
				size: formData.get("dztotalfilesize"),
				path: `/tmp/creedito/${tmpFilename}`,
				filename: tmpFilename,
				originalFilename: originalFilename,
			}
		})
	})
})

router.post('/upload-b64', function(req, res){
	let data 	 	= req.body.data
	let extension 	= req.body.extension
	if( data && extension ){
		let tmpFileName = `${randomString(20)}.${extension}`
		let tmpFilePath = `${tmpPath}/${tmpFileName}`

		fs.writeFileSync(tmpFilePath, data, "base64")

		res.status(200).json({
			path: tmpFilePath,
			filename: tmpFileName
		})

	}else{
		res.status(403).json({message: "Solicitud inválida"})
	}

})

router.post('/process', function(req, res){
	let tmpFile = fs.readFileSync( req.body.tmpPath )

	/*	Encripta 	*/
	let encrypted = encrypt(tmpFile, req.body.username)
	//fs.writeFileSync(`${req.body.type}_${req.body.tmpPath}.enc`, encrypted)

	let filename = req.body.tmpPath.replace("/tmp/creedito/", "")
	let key = `documentos/${req.body.type}/${filename}`

	let params = {
		"Bucket": BUCKET,
		"Key": key,
		"Body": encrypted,
		"ACL": "private"
	}

	let sumaToken

	s3Upload( params )
	.then(() => {
		fs.unlinkSync( req.body.tmpPath ) //Borra el archivo temporal
		res.status(200).json({ key: key })
	})
	.catch(err => {
		res.status(500).json( err )
	})

})

router.post('/bypass-process', function(req, res){
	let tmpFile = fs.readFileSync( req.body.tmpPath )

	let filename = req.body.tmpPath.replace("/tmp/creedito/", "")
	let key = `unprocessed/${req.body.type}/${filename}`

	let params = {
		"Bucket": BUCKET,
		"Key": key,
		"Body": tmpFile,
		"ACL": "authenticated-read"
	}

	s3Upload( params )
	.then(() => {
		fs.unlinkSync( req.body.tmpPath ) //Borra el archivo temporal
		res.status(200).json({ key: key })
	})
	.catch(err => {
		res.status(500).json( err )
	})

})

router.post('/sign', function(req, res){
	const cer = req.body.cer
	const key = req.body.key
	const pass = req.body.pass
	const username = req.body.username
	const doc = req.body.doc
	const string = fs.readFileSync(`./formatos/${doc}.pdf`).toString("base64")
	const tmpName = `fiel-${randomString(5)}`

	let info = getCertificateInfo( cer )

	if( info.error )
		return res.status(500).json({message: info.error})

	if( info.expired )
		return res.status(406).json({message: "La FIEL no es vigente"})

	const keyBuffer = Buffer.from(key, "base64")
	fs.writeFileSync(`${tmpPath}/${tmpName}.key`, keyBuffer)

	openssl(`pkcs8 -inform DER -in ${tmpPath}/${tmpName}.key -out ${tmpPath}/${tmpName}.pem -passin pass:${pass}`, async function (err, buffer){
		if( err && err.length > 0 ){
			
			fs.unlinkSync(`${tmpPath}/${tmpName}.key`)

			for(let e of err )
				if( e.toString().includes("EVP_DecryptFinal_ex") )
					return res.status(406).json({message: "La contraseña de la FIEL es incorrecta"})

			return res.status(500).json({ message: JSON.stringify(err) })
		}else{
			let pemKey = fs.readFileSync(`${tmpPath}/${tmpName}.pem`)
			let signature = signString( string, pemKey )

			fs.unlinkSync(`${tmpPath}/${tmpName}.key`)

			/*	Imprime la firma digital 	*/
			const result = await formats.signDocument(req.body.doc, signature, info.name)
			
			if( result && result.filePath ){

				/*	Encripta el PDF y sube a S3 	*/
				let encrypted, tmpFile
				try{
					tmpFile = fs.readFileSync( result.filePath )

					/*	Encripta 	*/
					encrypted = encrypt(tmpFile, username)
				}catch( e ){
					return res.status(500).json({
						message: e.message,
						stack: e.stack
					})
				}

				let filename = result.filePath.replace("/tmp/creedito/", "")
				let key = `documentos/${doc}/${filename}`

				let params = {
					"Bucket": BUCKET,
					"Key": key,
					"Body": encrypted,
					"ACL": "private"
				}

				s3Upload( params )
				.then(() => {
					fs.unlinkSync( result.filePath ) //Borra el archivo temporal
					res.status(200).json({ key: key })
				})
				.catch(err => {
					res.status(500).json( err )
				})
			}else{
				return res.status(500).json({
					message: result.message,
					stack: result.stack
				})
			}
		}
	})

})

router.get('/download', function(req, res){
	let key = req.query.key
	let username = req.query.username
	if( key && username ){
		let params = {
			"Bucket": BUCKET,
			"Key": key
		}
		s3Download( params )
		.then(data => {
			const decrypted = decrypt( data.Body, username )

			/*	Obtiene el formato 	*/
			let aux = key.split(".")
			let ext = aux[ aux.length - 1 ]
			let contentType

			switch( ext ){
				case "pdf":
					contentType = "application/pdf"
					break
				case "jpg":
					contentType = "image/jpg"
					break
				case "jpeg":
					contentType = "image/jpeg"
					break
				case "png":
					contentType = "image/png"
					break
				case "gif":
					contentType = "image/gif"
					break
				default:
					contentType = "application/octet-stream"
					break
			}

			res.set('Content-Type', contentType)

			return res.end( decrypted )

			/*		Guarda y desencripta 	*/
		})
		.catch(error => {
			if( error.message == "The specified key does not exist.")
				return res.status(404).json({message: "Archivo no encontrado"})
			else if( error.message == "The request signature we calculated does not match the signature you provided. Check your key and signing method.")
				return res.status(403).json({message: "Acceso denegado."})
			else
				return res.status(500).json({message: error.message, stack: error.stack})
		})

	}else
		return res.status(404).json({message: "Archivo no encontrado"})
})

module.exports = router