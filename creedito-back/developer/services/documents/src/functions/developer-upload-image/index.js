const AWS = require('aws-sdk')
const bucket = process.env.S3_PUBLIC_BUCKET

AWS.config.update({ accessKeyId: process.env.AWS_KEY_ID, secretAccessKey: process.env.AWS_SECRET, region: "us-west-2" })
const s3 = new AWS.S3()

const generateS3Key = (prefix, filetype, length) => {
    let alphabet = "abcdefghijlmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let hash = ""
    for( let i = 0 ; i < length ; i++ )
        hash += alphabet.charAt( Math.floor( Math.random() * alphabet.length ) )

    return prefix + "-" + hash + "." + filetype
}

const upload = params => s3.putObject(params).promise()

exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false

    console.info(`Recurso=${event.requestPath}, Método=${event.method}, IP de Origen=${event.identity.sourceIp}, User Agent=${event.identity.userAgent}, Env= ${event.stage}`)
    let key = `images/${generateS3Key("image", event.body.type, 30)}`
    let buffer = Buffer.from(event.body.data, "base64")
    let params = {
        "Bucket": bucket,
        "Key": key,
        "Body": buffer,
        "ACL": "public-read"
    }

    try{
        await upload( params )
        return {
            key: key
        }
    }catch(e){
        console.error( e )
        return null
    }
}