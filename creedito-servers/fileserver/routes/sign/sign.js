const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require("fs")

const randomString = length => {
	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let string = ""
	for( let i = 0 ; i < length ; i++ )
		string += alphabet.charAt( Math.ceil( Math.random() * ( alphabet.length - 1 ) ) )

	return string
}

const signDocument = async (doc, signature, signer) => {
	try{
		const buffer = fs.readFileSync(`./formatos/${doc}.pdf`)
		const pdf = await PDFDocument.load( buffer )
		const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
		const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)

		const pages = pdf.getPages()
		const lastPage = pages[pages.length - 1]

		const { width, height } = lastPage.getSize()

		lastPage.drawText(`Firma digital [${signer}]:`, {
			x: 30,
			y: 80,
			size: 10,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		})

		let chunks = signature.match(/.{1,90}/g)
		for( let i = 0 ; i < chunks.length ; i++ ){
			lastPage.drawText(chunks[ i ], {
				x: 30,
				y: 65 - 10 * i,
				size: 10,
				font: helvetica,
				color: rgb(0, 0, 0),
			})
		}

		const bytes = await pdf.save()
		const filePath = `/tmp/creedito/pdf-${randomString(20)}.pdf`
		fs.writeFileSync(filePath, bytes)

		return {filePath: filePath}
	}catch( e ){
		return e
	}
}


module.exports = {
	signDocument: signDocument
}