import Vue from 'vue'

const strictFormatText = text => {
	/*	Remueve minúsculas acentuadas	*/
	text = text.replace(/á/g, "A").replace(/é/g, "E").replace(/í/g, "I").replace(/ó/g, "O").replace(/ú/g, "U")

	/*	Remueve mayúsculas acentuadas	*/
	text = text.replace(/Á/g, "A").replace(/É/g, "E").replace(/Í/g, "I").replace(/Ó/g, "O").replace(/Ú/g, "U")

	/*	Remueve ñ's	*/
	text = text.replace(/ñ/g, "n").replace(/Ñ/g, "N")
	
	return text
}

const normalFormatText = text => {
	/*	Remueve minúsculas acentuadas	*/
	text = text.replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u")

	/*	Remueve mayúsculas acentuadas	*/
	text = text.replace(/Á/g, "A").replace(/É/g, "E").replace(/Í/g, "I").replace(/Ó/g, "O").replace(/Ú/g, "U")

	return text
}

/*	Remueve tags maliciosos	*/
const sanitizeXSS = text => text.replace(/<[^>]*>/g, "")

Vue.prototype.$sanitizer = {
	strictFormatText: strictFormatText,
	normalFormatText: normalFormatText,
	sanitizeXSS: sanitizeXSS
}

export default {}