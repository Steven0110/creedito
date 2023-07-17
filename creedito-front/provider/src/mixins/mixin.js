/*	Métodos globales */

export default {
	methods: {
		$clone: function( obj ) {
			return JSON.parse(JSON.stringify(obj))
		},
		$wait: function(ms, fn) {
			setTimeout(fn, ms)
		},
		$report: function(error, options) {
			console.error( error )
			if( options && options.swal)
				this.$swal("Error", "Sucedió un error al procesar su solicitud, por favor vuelva a intentarlo", "error")
			this.$sentry.captureException( new Error(error) )
		}
	}
}