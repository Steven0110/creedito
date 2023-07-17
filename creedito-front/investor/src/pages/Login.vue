<template lang="pug">
	.login
		v-row
			v-col.login-container(cols="12", lg="3", md="4")
				.login-panel
					img.login-logo(src="/assets/images/logo.jpg")
					p.dashboard-title
						|Panel de Inversionista
					p.simple-message
						|Ingresa tu correo electrónico.
					v-form(ref="preLoginForm", onSubmit="return false;")
						v-text-field(
							append-icon="mdi-email",
							name="email",
							v-model="login.username",
							label="Correo electrónico",
							background-color="transparent",
							color="primary",
							:rules="form.validations.email",
							outlined,
							v-on:keyup.enter="prepareLogin",
							dense,
							required)
						v-alert.text-center(color="warning", transition="scale-transition", v-show="preGetError")
							|{{ preGetError }}
						v-btn(
							color="primary",
							:loading="status.preparing",
							raised,
							block,
							x-large,
							@click="prepareLogin")
							|Continuar

					.action-buttons
						.forgot-password
							router-link(:to="{path: '/forgot'}")
								|¿Olvidaste tu contraseña?&nbsp;&nbsp;&nbsp;
						.blocked-account
							router-link(:to="{path: '/unlock'}")
								|¿Tu cuenta está bloqueada?
					p.create-account
						span
							|¿Aún no tienes una cuenta?
						span
							router-link(:to="{path: '/register'}")
								|Crea una cuenta
					.copyright
						p
							|Copyright Creedito &copy; 2021
						p
							span
								router-link(:to="{path: '/'}")
									|Términos de uso 
							span
								|/ 
							span
								router-link(:to="{path: '/'}")
									|Política de privacidad

			.contact.d-none.d-md-block
				.social-networks
					.social-icon
						a(href="https://www.facebook.com/#", target="_blank")
							v-img(src="assets/icons/ic_facebook.svg")
					.social-icon
						a(href="https://twitter.com/#", target="_blank")
							v-img(src="assets/icons/ic_twitter.svg")
					.social-icon
						a(href="https://www.instagram.com/#", target="_blank")
							v-img(src="assets/icons/ic_instagram.svg")
				//.contact-info
					.contact-item
						.contact-icon
							v-img(src="assets/icons/ic_communicate.svg")
						span
							|+55 1234 5678
					.contact-item
						.contact-icon
							v-img(src="assets/icons/ic_communicate.svg")
						span
							|contacto@creedito.mx

		v-dialog(v-model="extendLogin", max-width="700", persistent, content-class="overflow-unset")
			v-card.login-card
				v-card-title
				v-card-text

					v-btn(color="primary", fab, absolute, top, right, @click="extendLogin = false")
						v-icon(color="white")
							|mdi-close

					v-form(ref="loginForm", onSubmit="return false;")
						.instructions
							|Estimado cliente, por favor verifique la siguiente información previo a ingresar su contraseña de acceso:
						.secret-image(v-if="pre.secretImage")
							img(:src="'/assets/images/secret/' + pre.secretImage")
						.obfuscated-name-container
							.title
								|Nombre:
							.obfuscated-name
								|{{ pre.name }}
						v-text-field(
							ref="password",
							append-icon="mdi-lock",
							v-model="login.password",
							label="Contraseña",
							:rules="form.validations.password",
							outlined,
							dense,
							background-color="transparent",
							color="primary",
							v-on:keyup.enter="submitLogin"
							type="password",
							required)
						transition(name="slide-x-transition")
							input.otp-input(
								ref="otp-input",
								v-model="login.otp",
								v-if="status.otp",
								v-mask="'# # # # # #'",
								placeholder="1 2 3 4 5 6",
								v-on:keyup.enter="submitLogin")
						v-alert.text-center(color="warning", transition="scale-transition", v-show="error")
							|{{ error }}
						v-alert.text-center(color="success", dark, transition="scale-transition", v-show="message")
							|{{ message }}
						v-btn(
							color="primary",
							:loading="status.loading",
							raised,
							block,
							dark,
							x-large,
							@click="submitLogin")
							|Iniciar sesión
				v-card-actions
</template>

<script>
	export default {
		data() {
			return {
				pre: {
					name: "G**** C***** A*****",
					secretImage: ""
				},
				login: {
					username: "",
					password: "",
					otp: ""
				},
				error: "",
				message: "",
				preGetError: "",
				extendLogin: false,
				status: {
					otp: false,
					loading: false,
					preparing: false,
				},
				form: {
					validations: {
						email: [
				        	v => !!v || 'El email es requerido',
				        	v => /.+@.+\..+/.test(v) || 'El email no es válido',
				      	],
				      	password: [
				        	v => !!v || 'La contraseña es requerida',
				      	]
					}
				}
			}
		},
		filters: {
		},
		methods: {
			obfuscateEmail: function( value ){
				let parts = value.split("@")
				let obfuscated = parts[0].charAt(0) + parts[0].charAt(1) + parts[0].charAt(2) + "...@" + parts[1]
				return obfuscated
			},
			prepareLogin: function(){
				this.preGetError = ""
				if( this.$refs.preLoginForm.validate() ){

					this.status.preparing = true
					/*	Obtiene imagen secreta e iniciales del usuario */
					this.$auth.get("preget-user/" + this.login.username)
					.then(result => {
						this.extendLogin = true

						this.pre = result.data.user
						setTimeout(() =>  {
							this.$refs.password.focus()
						}, 200)
					})
					.catch( err => {
						if( err.response ){
							if( err.response.status == 404 ){
								this.preGetError = `El usuario ${this.login.username} no se encuentra registrado.`
							}else{
								this.preGetError = "Error al iniciar sesión. Por favor vuelve a intentarlo."
								this.$sentry.captureException( err )
							}
						}else{
							this.preGetError = "Error al iniciar sesión. Por favor vuelve a intentarlo."
							this.$sentry.captureException( err )
						}
					})
					.finally( () => this.status.preparing = false)
				}
			},
			submitLogin: function(){
				if( this.$refs.loginForm.validate() ){
					this.status.loading = true
					this.error = ""
					this.message = ""

					let body = {
						"username": this.$sanitizer.sanitizeXSS(this.login.username),
						"password": this.$sanitizer.sanitizeXSS(this.login.password)
					}

					if( this.login.otp )
						body.otp = this.login.otp.replace(/\s/g, "")
					
					let resource = "login"

					this.$auth.post(resource, body)
					.then( response => {
						this.status.loading = false
						let user = response.data.user
						if( user.name ){
							this.$store.commit("setUser", user)
							this.$store.commit("setSessionActive", true)
						
							this.$swal({
								title: `Bienvenido ${user.name}.`,
								text: "En breve serás redireccionado a tu dashboard",
								type: "success",
								showConfirmButton: false,
								timer: 3000,
								onClose: () => {
									this.$router.push({path: "/dashboard"})
								}
							})
						}else{
							/*	Algo ocurrió al iniciar sesión 	*/
							this.$swal("No se pudo iniciar sesión", "Por favor, espera un momento y vuelve a intentarlo", "warning")
						}
					})
					.catch( error => {
						this.status.loading = false
						if( error.response.status == 401 )
							this.error = "Usuario y contraseña incorrectos"
						else if( error.response.status == 409 )
							this.error = "Código de verificación inválido"
						else if( error.response.status == 402 )
							this.error = "La cuenta ha sido bloqueada tras 3 intentos de inicio de sesión fallidos"
						else if( error.response.status == 410 )
							this.error = "La cuenta se encuentra bloqueada"
						else if( error.response.status == 408 )
							this.error = "Ya hay una sesión activa en otro equipo. Si acabas de cerrarla, por favor espera 5 minutos y vuelve a intentarlo."
						else if( error.response.status == 406 ){
							this.message = "Por favor ingresa el código que aparece en Google Authenticator:"
							this.status.otp = true

							this.$nextTick(() => {
								this.$refs["otp-input"].focus()
							})
						}else
							this.error = "Error al procesar la solicitud."
					})
				}
			}
		},
		mounted(){
		}
	}
</script>

<style lang="sass">
	.login
		background: url("/assets/images/login-wallpaper.webp")
		background-repeat: no-repeat
		background-size: cover
		background-position: center
		height: 100vh
		overflow-x: hidden

		&>.row
			height: calc(100% + 12px)
			&>div
			&>.row
				height: 100%

		.login-container
			padding: 0
			margin-bottom: -12px
			background: white
			display: table
			height: 100%
			.login-panel
				background-color: rgba(255, 255, 255, 0.9)
				position: relative
				top: 50%
				-webkit-transform: translateY(-50%)
				-moz-transform: translateY(60%)
				text-align: center
				padding: 35px
				.login-logo
					display: inline-block
					max-height: 100px
				.dashboard-title
					text-align: center
					letter-spacing: 3px
					text-transform: uppercase
					font-size: 26px
					font-weight: 700
					font-family: Raleway
				.simple-message
					font-size: 12pt
					font-family: Raleway
					font-weight: 600
					color: #555555

				.create-account
					text-align: center
					color: #aaa
					font-family: Raleway, sans-serif
					font-weight: 700
					a
						padding-left: 5px
						font-size: 12pt
						font-family: Raleway, sans-serif
						font-weight: 800
						color: #3f9690
						text-decoration: none
						transition: 0.1s linear all
						&:hover
							transition: 0.1s linear all
							color: #4f7fbf
							text-decoration: none
				.action-buttons
					text-align: center
					.forgot-password,.blocked-account
						display: inline-block
						text-align: center
						margin-bottom: 25px
						a
							color: #3f9690
							font-size: 12pt
							font-family: Raleway, sans-serif
							font-weight: 800
							text-decoration: none
							transition: 0.1s linear all
							&:hover
								transition: 0.1s linear all
								color: #2963b4
								text-decoration: none
				.copyright
					position: absolute
					width: 100%
					bottom: 5px
					left: 0
					p
						text-align: center
						margin-bottom: 0px
						font-family: Raleway, sans-serif
						font-size: 8pt
						font-weight: 700
						span
							a
								color: black
								text-decoration: none
								transition: 0.2s linear all
								&:hover
									color: #2963b4
									text-decoration: none
									transition: 0.2s linear all
				.v-form
					.v-text-field
						label
							font-size: 12pt
							color: #999999
							font-family: Raleway, sans-serif
					.v-input--switch
						label
							font-size: 12pt
							font-family: Raleway, sans-serif
							font-weight: 700
					.v-btn
						font-size: 12pt
						font-family: Raleway, sans-serif
						font-weight: 700
						color: white
						border-radius: 15px
						margin-bottom: 25px

		.contact
			text-align: right
			padding-right: 40px
			position: absolute
			right: 0
			bottom: 15px
			.social-networks
				text-align: right
				.social-icon
					display: inline-block
					height: 15px
					width: 15px
					margin-left: 15px
					transition: 0.2s linear all
					&:hover
						border-bottom: 1px solid white
						transition: 0.2s linear all
			.contact-info
				margin-top: 5px
				.contact-item
					display: inline-block
					margin-left: 15px
					.contact-icon
						height: 14px
						width: 14px
						display: inline-block
						margin-right: 5px
					span
						display: inline-block
						color: white
						font-family: Raleway, sans-serif
						font-size: 10pt
						font-weight: 600
	.login-card
		text-align: center
		.instructions
			margin-top: 15px
			margin-bottom: 25px
			font-size: 1.2em
			text-align: center
		.secret-image
			padding-left: 25%
			padding-right: 25%
			img
				display: inline-block
				max-width: 100%
		.obfuscated-name-container
			margin-bottom: 10px
			.title
				text-align: center
			.obfuscated-name
				margin-top: 7px
				margin-bottom: 15px
				font-size: 3em
				text-align: center
				font-family: Raleway
				font-weight: 700
				letter-spacing: 1px
		.otp-input
			display: inline-block
			font-family: Raleway
			font-size: 30px
			border: 1px solid rgba(0, 0, 0, 0.5)
			border-radius: 5px
			padding: 10px
			margin-bottom: 10px
			width: 50%
			text-align: center


	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
		.login
			height: 100%

			&>.row
				//min-height: 100vh
				&>div
					//height: 100%
					&>.row
						//height: 100%
			.login-panel
				padding-left: 30px
				padding-right: 30px
				min-height: 100%
				.welcome-message
					text-align: center
				.simple-message
					text-align: center
				.create-account
					text-align: center

				.otp-input
					font-family: Raleway
					font-size: 30px
					border: 1px solid rgba(0, 0, 0, 0.5)
					border-radius: 5px
					padding: 10px
					margin-bottom: 5px
					width: 100%
					text-align: center
				.copyright
					position: relative
					margin-top: 30px
					p
						font-size: 16px
	@media only screen and (max-width: 600px)
		.login
			.login-panel
				.v-form
					.v-btn
						margin-bottom: 10px
				.v-input--switch
					margin-bottom: 0
				.action-buttons
					.forgot-password
						text-align: center
						margin-bottom: 5px
						margin-top: 15px
				.copyright
					p
						span
							&:first-child
								a
									color: #3f9690
							&:last-child
								a
									color: #3f9690
		.login-card
			.secret-image
				padding-left: 15px
				padding-right: 15px
				img
					display: inline-block
					max-width: 100%
			.obfuscated-name-container
				.obfuscated-name
					line-height: 2.5rem
					font-size: 2rem

</style>