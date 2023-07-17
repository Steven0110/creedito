<template lang="pug">
	.forgot
		v-row
			v-col.forgot-container(cols="12", lg="3", md="4")
				.forgot-panel
					p.welcome-message
						|Recuperación de cuenta
					v-form(ref="forgotForm", v-on:submit.prevent="")
						v-text-field(
							append-icon="mdi-email",
							v-model="forgot.username",
							label="Correo electrónico de tu cuenta",
							background-color="transparent",
							color="primary",
							:rules="form.validations.email",
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
							@click="sendResetMail")
							|Confirmar
					
					p.forgot-message.text-center
						span
							|
						span
							router-link(:to="{path: '/login'}")
								|&lt; Regresar
					.copyright
						p
							|Copyright Creedito &copy; 2021
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

</template>

<script>
	export default {
		data() {
			return {
				forgot: {
					username: "",
				},
				status: {
					loading: false,
				},
				stage: "email",
				message: "",
				form: {
					validations: {
						email: [
				        	v => !!v || 'El email es requerido',
				        	v => /.+@.+\..+/.test(v) || 'El email debe ser válido',
				      	],
					}
				}
			}
		},
		methods: {
			sendResetMail: function(){
				if( this.validate() ){

					this.message = ""
					this.status.loading = true

					let body = {
						username: this.$sanitizer.sanitizeXSS( this.forgot.username )
					}

					this.$security.post("send-reset-email", body)
					.then(result => {
						this.forgot.username = ""
						return this.$swal("¡Listo!", "Te hemos enviado un correo electrónico para continuar con el proceso de recuperación de tu cuenta.", "success")
					})
					.then(() => {
						this.$router.push({ path: "/" })
					})
					.catch(err => {
						if( err.response.status == 401 )
							this.message = "La cuenta no existe o ya inició el proceso de recuperación"
						else{
							this.message = "Algo salió mal, por favor vuelve a intentarlo. Si el problema persiste comuníquese a soporte@creedito.mx"
							this.$sentry.captureException( err )
						}
					})
					.finally(() => this.status.loading = false)
				}
			},
			back: function(){
				this.$router.go(-1)
			},
			validate: function(){
				return this.$refs.forgotForm.validate()
			}
		}
	}
</script>

<style lang="sass">
	.forgot
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

		.forgot-container
			padding: 0
			margin-bottom: -12px
			background: white
			display: table
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
					font-family: Raleway, sans-serif
					font-weight: 800
					margin-bottom: 5px
				.simple-message
					font-size: 12pt
					font-family: Raleway, sans-serif
					font-weight: 600
					color: #555555
				.forgot-message
					text-align: left
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
						transition: 0.2s linear all
						&:hover
							color: #33537d
							text-decoration: none
							transition: 0.2s linear all
				.accept-terms
					text-align: center
					color: #aaa
					font-family: Raleway, sans-serif
					font-weight: 700
					margin-top: 25px
					margin-bottom: 25px
					a
						padding-left: 5px
						font-size: 12pt
						font-family: Raleway, sans-serif
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
						font-family: Raleway, sans-serif
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
						font-family: Raleway, sans-serif
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
							font-family: Raleway, sans-serif
					.v-input--switch
						label
							font-size: 12pt
							font-family: Raleway, sans-serif
							font-weight: 700
					.v-input--radio-group
						margin-top: 0px
						.v-radio
							.v-input--selection-controls__ripple
								z-index: 10
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