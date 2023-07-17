<template lang="pug">
	.dashboard-menu
		investus-menu(ref="menu")
		.panel
			mobile-nav-bar(@toggle="toggleMenu")
			.sub-panel
				transition(name="slide-x-transition", mode="out-in")
					keep-alive
						router-view(name="panel")
</template>

<script>
	import InvestusMenu	from "@/components/dashboard/elements/InvestusMenu.vue"
	import MobileNavBar from "@/components/dashboard/elements/MobileNavBar.vue"

	export default {
		data() {
			return {
			}
		},
		mounted() {
			////this.$moment().locale("es")
			////console.log(this.$moment().locale("es"))
		},
		methods: {
			checkSession: function() {
				this.$store.commit("setCheckingSession", true)

				this.$auth.get("session/check")
				.then( response => {
					this.$store.commit("setCheckingSession", false)
					this.$store.commit("setSessionActive", true)
					this.$store.commit("setUser", response.data.user)

					// Agrega la información del usuario a todas las entradas de Sentry
					this.$sentry.configureScope( scope => {
  						scope.setUser({"user": response.data.user})
					})

					/*	Verifica la cuenta esté verificada y tenga configuradas las preguntas de seguridad */
					if( response.data.user.securityQuestions == 0 || !response.data.user.verified || !response.data.user.secretImage ){
						
						let title, text

						if( !response.data.user.verified ){
							title = "Tu cuenta aún no está verificada"
							text = "Por favor verifica tu cuenta, si no has recibido el correo de verificación puedes solicitarlo de nuevo en la sección de Autenticación."
						}else if( response.data.user.securityQuestions == 0 ){
							title = "Aún no tienes configuradas preguntas de seguridad"
							text = "Esta información es importante para poder reestablecer tu contraseña o cuenta en caso de requerirlo. Puedes configurarlas en la sección Autenticación"
						}else if( !response.data.user.secretImage ){
							title = "Aún no has configurado una imagen de seguridad"
							text = "Es importante configurarla para mejorar la seguridad en el inicio de sesión en tu cuenta"
						}

						this.$swal({
							title: title,
							text: text,
							type: "warning",
							showCancelButton: true,
							reverseButtons: true,
							confirmButtonText: "Configurar",
							cancelButtonText: "Cerrar.",
							showConfirmButton: this.$route.name != "m-auth",
						})
						.then( result => {
							if( result.value )
								this.$router.push({path: "/dashboard/autenticacion"})
						})

					}


					this.monitorSession()
				})
				.catch( err => {
					this.$swal("Sesión inválida", "Por favor vuelve a iniciar sesión para continuar", "warning")
					.then( result => {
						this.$router.push({path: "/"})
					})
				})
				.finally( () => {})
			},
			monitorSession: function() {
				setTimeout(() => {
					if( this.$store.getters.isSessionActive && !this.$store.getters.renovating ){ //Monitorea sólo si la sesión está activa, y no está siendo renovada

						this.$store.commit("setCheckingSession", true)

						/* Avisa de la finalización de sesión un minuto antes de que termine */
						let lastAction = new Date( this.$store.getters.user.lastAction )
						let current = new Date()
						let diff = current - lastAction

	                	let diffSeconds = Number((((diff % 86400000) % 3600000) / 60000)) * 60
	                	let remainingSeconds = Math.floor(300 - diffSeconds)

	                	console.log( remainingSeconds + " segundos" )

	                	if( remainingSeconds <= 60 ){

							let timerInterval
	                		this.$swal({
	                			title: "Tu sesión está a punto de expirar",
	                			html: "<b>"+remainingSeconds+"</b> segundos restantes",
	                			timer: remainingSeconds * 1000,
	                			confirmButtonText: "Volver a la plataforma",
	                			showConfirmButton: true,
	                			allowOutsideClick: false,
	                			allowEscapeKey: false,
	                			onBeforeOpen: () => {

	                				timerInterval = setInterval(() => {
								      const content = this.$swal.getContent()
								      if (content) {
								        const b = content.querySelector('b')
								        if (b) {
								          b.textContent = Math.floor( this.$swal.getTimerLeft() / 1000 )
								        }
								      }
								    }, 1000)
	                			}
	                		})
	                		.then( result => {
	                			if( result.value ){

	                				// Renueva la sesión del usuario
	                				this.$store.commit("setCheckingSession", false)
	                				this.$store.commit("setRenovationStatus", true)

	                				let resource = "renovate-session"
	                				this.$auth.get( resource )
	                				.then(response => {
	                					this.$store.commit("setUser", response.data.user )
	                					this.monitorSession()
	                				})
	                				.catch(err => {
	                					this.$swal({
	                						title: "Hubo un error al renovar tu sesión",
	                						text: "Por favor vuelve a iniciar sesión",
	                						type: "warning"
	                					})
	                					.then(() => {
	                						this.$router.push({path: "/"})
	                					})
	                				})
	                				.finally(() => {
	                					this.$store.commit("setRenovationStatus", false)
	                				})
	                			}else{

	                				clearInterval(timerInterval)

	                				// Cierra la sesión
	                				this.logout()
	                				.then(() => {})
	                				.catch(err => {})
	                				.finally(() => {
	                					this.$store.commit("setSessionActive", false)
	                					this.$store.commit("setCheckingSession", false)
	                					this.$swal({
	                						title: "Tu sesión ha sido cerrada automáticamente",
	                						text: "tras 5 minutos de inactividad.",
	                						type: "warning"
	                					})
	                					.then( result => {
	                						this.$router.push({path: "/"})
	                					})
	                				})
	                			}
	                		})
	                	}else{
	                		/*		Si la sesión se encuentra renovando, monitorea hasta el siguiente ciclo 	*/
	                		if( this.$store.getters.renovating ){
	                			this.monitorSession()
	                		}else{
								this.$auth.get("session/check")
								.then( response => {
									this.$store.commit("setUser", response.data.user)
									this.monitorSession()
								})
								.catch( err => {
									this.$store.commit("setSessionActive", false)
									this.$swal("Tu sesión ha finalizado", "Por favor vuelve a iniciar sesión para continuar", "warning")
									.then( result => this.$router.push({path: "/"}) )
								})
								.finally( () => {})
	                		}
	                	}
					}

				}, 1000 * 30)
			},
			toggleMenu: function() {
				this.$refs.menu.toggle()
			},
			logout: function() {
				let resource = "logout"
				return this.$auth.get( resource )
			}
		},
		created(){
			this.checkSession()
		},
		components: {
			InvestusMenu,
			MobileNavBar
		}
	}
</script>

<style lang="sass">
	.dashboard-menu
		.logout
			.v-btn__content
				font-family: Raleway
				color: white
				font-weight: 700
		.panel
			position: fixed
			top: 0
			left: 256px
			right: 0
			bottom: 0
			overflow: auto
			
			&::-webkit-scrollbar-track
				-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
				background-color: rgba(255, 255, 255, 0.2)
			&::-webkit-scrollbar
				width: 10px
				background-color: rgba(255, 255, 255, 0.2)
			&::-webkit-scrollbar-thumb
				background-color: #3f9690

			.sub-panel
				min-height: 100%
				padding: 15px
				padding-bottom: 25px
				background-color: rgba(0, 0, 0, 0.1)
	@media only screen and (min-width: 1904px)
		.dashboard-menu
			.logout
				.v-btn__content
			.panel
				left: 256px
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
		.dashboard-menu
			.logout
				.v-btn__content
			.panel
				left: 0
				top: 0

				.sub-panel
					overflow-x: hidden
	@media only screen and (max-width: 600px)
		.dashboard-menu
			.logout
				.v-btn__content
			.panel
				.sub-panel
					padding-top: 15px

</style>