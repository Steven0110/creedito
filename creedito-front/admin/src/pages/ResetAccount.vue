<template lang="pug">
	.forgot
		v-row
			v-col.pt-0.pb-0(cols="12", md="4", offset-md="4")
				v-row
					v-col.pt-0.pb-0(cols="12")
						.forgot-panel
							
							img.login-logo(src="/assets/images/logo.png")
							p.welcome-message
								|Recuperación de cuenta

							// Bloque para solución de pregunta de seguridad
							.answer-block(v-show="stage == 'question'")
								.instructions
									|Por favor responde a la siguiente pregunta de seguridad
								v-form(ref="questionForm", v-on:submit.prevent="")
									v-text-field(
										append-icon="mdi-question",
										v-model="input.answer",
										:label="user.question.question",
										background-color="transparent",
										color="primary",
										:rules="form.validations.required",
										v-on:keyup.enter="confirmAnswer",
										outlined,
										dense,
										required)
										
									v-alert(color="warning", transition="scale-transition", v-show="message")
										|{{ message }}

									v-btn(
										color="primary",
										:loading="status.loading",
										raised,
										block,
										x-large,
										@click="confirmAnswer")
										|Continuar

							// Bloque para reseteo de contraseña
							.reset-block(v-show="stage == 'reset'")
								.instructions
								v-alert(background-color="white", type="success", elevation="2")
									|La respuesta es correcta.
								.instructions
									|Por favor escribe una nueva contraseña para tu cuenta:
								v-form(ref="resetForm", v-on:submit.prevent="")

									v-tooltip(top, v-model="passwordFocus")
										template(v-slot:activator="{ on, attrs }")
											.tooltip-anchor(dark, v-on="on")
										.password-tooltip-validator
											.lowercase-validation
												v-icon(color="green", left, v-if="passwordChecker.lowercase")
													|mdi-check-circle
												v-icon(color="red", left, v-else)
													|mdi-close-circle
												span
													|Contiene al menos una #[strong letra minúscula]
											.uppercase-validation
												v-icon(color="green", left, v-if="passwordChecker.uppercase")
													|mdi-check-circle
												v-icon(color="red", left, v-else)
													|mdi-close-circle
												span
													|Contiene al menos una #[strong letra mayúscula]
											.number-validation
												v-icon(color="green", left, v-if="passwordChecker.number")
													|mdi-check-circle
												v-icon(color="red", left, v-else)
													|mdi-close-circle
												span
													|Contiene al menos un #[strong número]
											.special-validation
												v-icon(color="green", left, v-if="passwordChecker.special")
													|mdi-check-circle
												v-icon(color="red", left, v-else)
													|mdi-close-circle
												span
													|Contiene al menos un #[strong carácter especial] (!@#$%^&amp;?_+-=)
											.length-validation
												v-icon(color="green", left, v-if="passwordChecker.length")
													|mdi-check-circle
												v-icon(color="red", left, v-else)
													|mdi-close-circle
												span
													|Tiene al menos #[strong 8 carácteres de longitud]
									v-text-field(
										append-icon="mdi-lock",
										v-model="input.password",
										label="Nueva contraseña",
										:rules="form.validations.password",
										outlined,
										dense,
										background-color="transparent",
										color="primary",
										@input="validatePassword",
										@focus="passwordFocus = true",
										@blur="passwordFocus = false",
										type="password",
										required)
									v-text-field(
										append-icon="mdi-lock",
										v-model="input.rpassword",
										label="Repeetir contraseña",
										:rules="form.validations.password",
										color="primary",
										outlined,
										dense,
										background-color="transparent",
										@input="validatePassword",
										type="password",
										required)

									v-alert(color="warning", transition="scale-transition", v-show="message")
										|{{ message }}

									v-btn(
										color="primary",
										:loading="status.loading",
										raised,
										block,
										x-large,
										@click="confirmReset")
										|Cambiar contraseña

							p.forgot-message.text-center
								span
									|
								span
									router-link(:to="{path: '/login'}")
										|&lt; Regresar
							.copyright
								p
									|Copyright Creedito &copy; 2020
								p
									span
										router-link(:to="{path: '/'}")
											|Terḿinos de Uso 
									span
										|/ 
									span
										router-link(:to="{path: '/'}")
											|Política de Privacidad

			.contact.d-none.d-md-block
				.social-networks
					.social-icon
						a(href="#")
							v-img(src="assets/icons/ic_facebook.svg")
					.social-icon
						a(href="#")
							v-img(src="assets/icons/ic_twitter.svg")
					.social-icon
						a(href="#")
							v-img(src="assets/icons/ic_instagram.svg")
				.contact-info
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

</template>

<script>
	export default {
		data() {
			return {
				user: {
					username: "",
					question: {
						question: "",
						id: ""
					}
				},
				input: {
					answer: "",
					password: "",
					rpassword: "",
				},
				passwordFocus: false,
				status: {
					loading: false,
				},
				stage: "question",
				message: "",
				form: {
					validations: {
						required: [
				        	v => !!v || 'Debes responder la pregunta de seguridad para continuar',
				      	],
				      	password: [
				        	v => !!v || 'La contraseña es requerida',
				        	v => this.input.password === this.input.rpassword || 'Las contraseñas no coinciden',
				        	v => this.input.password === this.input.rpassword || 'Las contraseñas no coinciden',
				        	v => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z\d*.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\])[A-Za-z\d*.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\]{8,}/g.test(this.input.password) || "La contraseña no tiene el formato requerido"
				      	],
					}
				}
			}
		},
		methods: {
			confirmAnswer: function(){
				if( this.validateQuestion() ){

					this.message = ""
					this.status.loading = true

					let body = {
						type: 		"answer",
						questionId: this.$sanitizer.sanitizeXSS(this.user.question.id),
						answer: 	this.$sanitizer.sanitizeXSS(this.input.answer),
						username: 	this.$sanitizer.sanitizeXSS(this.user.username)
					}

					this.$security.post("confirm-reset-account", body)
					.then(result => {
						this.stage = "reset"
					})
					.catch(err => {
						if( err.response.status == 401 ){
							this.message = "La respuesta es incorrecta"
						}else{
							this.$sentry.captureException( err )
						}
					})
					.finally(() => {
						this.status.loading = false
					})

				}
			},
			confirmReset: function() {
				if( this.validatePassword() ){

					this.status.loading = true
					this.message = ""

					let body = {
						type: 		"reset",
						questionId: this.$sanitizer.sanitizeXSS(this.user.question.id),
						username: 	this.$sanitizer.sanitizeXSS(this.user.username),
						answer: 	this.$sanitizer.sanitizeXSS(this.input.answer),
						newPassword:this.$sanitizer.sanitizeXSS(this.input.password)
					}

					this.$security.post("confirm-reset-account", body)
					.then(result => {
						return this.$swal("Contraseña modificada exitosamente", "Ahora ya puedes iniciar sesión en tu cuenta. Se ha desactivado el segundo factor en tu cuenta por lo que será necesario volverlo a configurar.", "success")
					})
					.then(result => {
						this.$router.push({ path: "/" })
					})
					.catch(err => {
						if( err.response.status == 401 ){
							this.message = "La respuesta es incorrecta"
						}else if( err.response.status == 406 ){
							this.message = "No se pudo actualizar tu contraseña, por favor vuelve a intentarlo"
						}else{
							this.message = "Algo salió mal, por favor vuelve a intentarlo"
							this.$sentry.captureException( err )
						}
					})
					.finally(() => {
						this.status.loading = false
					})
				}
			},
			validatePassword: function() {
				return this.$refs.resetForm.validate()
			},
			validateQuestion: function() {
				return this.$refs.questionForm.validate()
			},
			back: function(){
				this.$router.go(-1)
			},
		},
		computed: {
			passwordChecker: function() {
				let check = {
					length: false,
					lowercase: false,
					uppercase: false,
					number: false,
					special: false,
				}

				if( this.input.password.match(/[A-Z]/g) )
					check.uppercase = true
				if( this.input.password.match(/[a-z]/g) )
					check.lowercase = true
				if( this.input.password.match(/[0-9]/g) )
					check.number = true
				if( this.input.password.match(/[*\.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\]/g) )
					check.special = true
				if( this.input.password.length >= 8 )
					check.length = true

				return check
			}
		},
		mounted() {
			const user = JSON.parse( decodeURIComponent( this.$route.query.user ) )
			if( user && user.question){
				this.user = user
			}else
				this.message = "Hubo un error al obtener las preguntas de seguridad de la cuenta"
		}
	}
</script>

<style lang="sass">
	.forgot
		background: url("/assets/images/login-wallpaper.jpg")
		background-repeat: no-repeat
		background-size: cover
		background-position: center
		height: 100vh
		overflow-x: hidden

		&>.row
			height: 100%
			&>div
				//height: 100%
				&>.row
					height: 100%

		.forgot-panel
			background-color: rgba(255, 255, 255, 0.9)
			position: relative
			top: 50%
			-webkit-transform: translateY(-50%)
			-moz-transform: translateY(60%)
			text-align: center
			padding: 35px
			.login-logo
				display: inline-block
				max-height: 150px
			.forgot-topbar
				.v-icon
					margin-left: -3px
			.welcome-message
				font-size: 18pt
				font-family: Roboto, sans-serif
				font-weight: 800
				margin-bottom: 5px
			.instructions
				color: #555555
				font-family: Roboto, sans-serif
				margin-bottom: 10px
				font-size: 18px
				font-weight: 500

			.simple-message
				font-size: 12pt
				font-family: Roboto, sans-serif
				font-weight: 600
				color: #555555
			.forgot-message
				text-align: left
				color: #aaa
				font-family: Roboto, sans-serif
				font-weight: 700
				a
					padding-left: 5px
					font-size: 12pt
					font-family: Roboto, sans-serif
					font-weight: 800
					color: #3f9690
					text-decoration: none
					transition: 0.2s linear all
					&:hover
						color: #33537d
						text-decoration: none
						transition: 0.2s linear all
			.accept-terms
				text-align: center
				color: #aaa
				font-family: Roboto, sans-serif
				font-weight: 700
				margin-top: 25px
				margin-bottom: 25px
				a
					padding-left: 5px
					font-size: 12pt
					font-family: Roboto, sans-serif
					font-weight: 800
					color: #3f9690
					text-decoration: none
					transition: 0.2s linear all
					&:hover
						color: #33537d
						text-decoration: none
						transition: 0.2s linear all
			.forgot-password
				text-align: center
				margin-bottom: 25px
				a
					color: #3f9690
					font-size: 12pt
					font-family: Roboto, sans-serif
					font-weight: 800
					text-decoration: none
					&:hover
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
					font-family: Roboto, sans-serif
					font-size: 8pt
					font-weight: 700
					span
						a
							color: black
							text-decoration: none
							transition: 0.2s linear all
							&:hover
								color: #3f9690
								text-decoration: none
								transition: 0.2s linear all
			.v-form
				.v-text-field
					label
						font-size: 12pt
						color: #999999
						font-family: Roboto, sans-serif
				.v-input--switch
					label
						font-size: 12pt
						font-family: Roboto, sans-serif
						font-weight: 700
				.v-input--radio-group
					margin-top: 0px
					.v-radio
						.v-input--selection-controls__ripple
							z-index: 10
				.v-btn
					font-size: 12pt
					font-family: Roboto, sans-serif
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
						font-family: Roboto, sans-serif
						font-size: 10pt
						font-weight: 600
	@media only screen and (max-width: 768px)
		.forgot
			height: auto
			min-height: 100vh
			&>.row
				min-height: 100vh
				&>div
					//height: 100%
					&>.row
						height: 100%
			.forgot-panel
				padding-left: 30px
				padding-right: 30px
				height: 100%
				.welcome-message
					text-align: center
				.simple-message
					text-align: center
				.create-account
					text-align: center
				.copyright
					position: relative
					margin-top: 30px
					p
						font-size: 16px
</style>