const allowedOrigins = [
	"https://inversionista.creedito.mx",
	"https://qa.inversionista.creedito.mx",
	"https://solicitante.creedito.mx",
	"https://qa.solicitante.creedito.mx",
	"https://admin.creedito.mx",
	"https://qa.admin.creedito.mx",
	"https://0.0.0.0:9000",
]

module.exports = function(req, res, next) {
	if( req.headers.origin ){
		if( allowedOrigins.includes( req.headers.origin ))
			next()
		else
			res.status(403).json({message: "Acceso denegado"})
	}else
		res.status(403).json({message: "Acceso denegado"})
}