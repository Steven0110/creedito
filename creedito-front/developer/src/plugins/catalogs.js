import Vue from 'vue'

const catalogs = {
	risks: [
		"Los factores de riesgo externos que podrían afectar la capacidad del solicitante son los propios del mercado, tales como: liquidez, regulatorios y de desempeño macroeconómico.",
		"No existe riesgo por tasa de interés ya que el préstamo se otorgará en tasa fija.",
		"La calificación de riesgo asignada con base la metodología de Cumplo se basa en información histórica, por lo cual no asume el desempeño futuro del Solicitante.",
		"No se identifican riesgos ambientales."
	],
	invoicingTypes: [
		"Factoraje a proveedores"
	]
}

Vue.prototype.$catalogs = catalogs

export default {}