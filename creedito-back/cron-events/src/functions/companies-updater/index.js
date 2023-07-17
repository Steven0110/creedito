'use strict';

const axios = require("axios")
const FormData = require('form-data')
const { JSDOM } = require("jsdom")
const xlsx = require("node-xlsx")

const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const connectionStringURI = process.env.MONGO_CONNSTRING
const dbName = process.env.DB_NAME
const https = require("https")

const url = "https://www.hrratings.com/ratings/index.xhtml"
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})

const getHRToken = () => {
    return axios.get(url, {
        httpsAgent: httpsAgent
    })
    .then(result => {
        let JSESSION = result.headers["set-cookie"][0].split(";")[0].split("=")[1]

        let dom = new JSDOM( result.data )
        let { value: viewState } = dom.window.document.getElementById("j_id1:javax.faces.ViewState:0")
        
        return Promise.resolve({ viewState: viewState, token: JSESSION})
    })
}

const getCompanies = (viewState, token) => {
    let form = new FormData()
    form.append("principalForm", "principalForm")
    form.append("principalForm:dropdown", "en")

    form.append("principalForm:j_idt22", "")
    form.append("principalForm:j_idt52", "")
    form.append("principalForm:j_idt137", "")
    form.append("principalForm:j_idt139", "")
    form.append("principalForm:j_idt141", "")
    form.append("principalForm:j_idt153", "")
    form.append("principalForm:j_idt157", "")
    form.append("principalForm:j_idt159", "")
    form.append("principalForm:j_idt53", "00")
    form.append("principalForm:j_idt68", "00")
    form.append("principalForm:j_idt84_activeIndex", "0")
    form.append("javax.faces.ViewState", viewState)
    form.append("principalForm:j_idt43", "principalForm:j_idt43")

    let headers = form.getHeaders()
    headers["Content-Type"] = "application/x-www-form-urlencoded"
    headers.Cookie = `primefaces.download=null;JSESSIONID=${token};`
    let config = {
        headers: headers,
        responseType: 'arraybuffer',
        httpsAgent: httpsAgent
    }

    return axios.post(url, form, config)
}

const parseCompanies = string => {
    let buffer = Buffer.from( string )
    let excel = xlsx.parse( buffer )

    let companies = []

    for(let item of excel[0].data) {
        let company = {
            name: item[ 0 ],
            clave: item[ 1 ],
            areas: item[ 2 ].split(", "),
            subarea: item[ 3 ],
            emision: item[ 4 ],
            subemision: item[ 5 ],
            tipoAnalisis: item[ 6 ],
            fechaPublicacion: item[ 7 ],
            type: item[ 8 ],
            perspectiva: item[ 9 ],
            observaciones: item[ 10 ],
            isin: item[ 11 ],
            tv: item[ 12 ],
        }

        companies.push( company )
    }

    companies.shift() //Elimina la fila de los encabezados

    return companies
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let client = new mongoClient( connectionStringURI, { useNewUrlParser: true, useUnifiedTopology: true })
    let db

    try{

        await client.connect()

        db = client.db( dbName )

        const { viewState, token } = await getHRToken()
        const { data } = await getCompanies( viewState, token )
        const companies = await parseCompanies( data )

        await db.collection("companies").insertMany( companies, {ordered: false} )
        await client.close()

        return "Finished"
    }catch(e) {
        await client.close()
        console.error( e.message )
        throw new Error( e )
    }
};
