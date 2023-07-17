/*	Métodos globales */

export default {
	methods: {
		renovateSession: function() {
			if( !this.$store.getters.renovating && !this.$store.getters.checkingSession ){
				this.$store.commit("setRenovationStatus", true)
				return this.$auth.get("renovate-session")
				.then(result => this.$store.commit("setUser", result.data.user ))
				.finally(() => this.$store.commit("setRenovationStatus", false ))
			}
		},
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