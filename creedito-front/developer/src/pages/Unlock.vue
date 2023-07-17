<template lang="pug">
	.unlock
		v-row
			v-col.unlock-container(cols="12", lg="3", md="4")
				.unlock-panel
					
					p.welcome-message
						|Desbloqueo de cuenta

					p.instructions
						|Por favor ingresa el correo electrónico de cuenta

					v-form(ref="unlockForm", v-on:submit.prevent="")
						v-text-field(
							append-icon="mdi-email",
							v-model="input.username",
							label="Correo electrónico",
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
							@click="sendUnlockEmail")
							|Confirmar

					p.unlock-message.text-center
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
				input: {
					username: "",
				},
				message: "",
				status: {
					loading: false,
				},
				form: {
					validations: {
						email: [
				        	v => !!v || 'El email es requerido',
				        	v => /.+@.+\..+/.test(v) || 'El email no es válido',
				      	],
					}
				}
			}
		},
		methods: {
			sendUnlockEmail: function() {

				this.status.loading = true
				
				let body = {
					username: this.input.username
				}

				this.$security.post("send-unlock-email", body)
				.then(result => {
					return this.$swal("¡Listo!", "Te hemos enviado un enlace a tu correo electrónico al que deberás ingresar para poder desbloquear tu cuenta.", "success")
				})
				.then(() => {
					this.$router.push({ path: "/" })
				})
				.catch(error => {
					if( error.response.status == 406 )
						this.message = "No existe alguna cuenta con el correo solicitado o ya se envió el correo electrónico para realizar el desbloqueo."
					else{
						console.error( error )
						this.$sentry.captureException( err )
					}
				})
				.finally(() => this.status.loading = false)
			},
			back: function(){
				this.$router.go(-1)
			},
		},
		computed: {
		},
		mounted() {
		}
	}
</script>

<style lang="sass">
	.unlock
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

		.unlock-container
			padding: 0
			margin-bottom: -12px
			background: white
			display: table
			height: 100%

			.unlock-panel
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
				.unlock-topbar
					.v-icon
						margin-left: -3px
				.welcome-message
					font-size: 18pt
					font-family: Raleway, sans-serif
					font-weight: 800
					margin-bottom: 5px
				.instructions
					color: #555555
					font-family: Raleway, sans-serif
					margin-bottom: 10px
					font-size: 18px
					font-weight: 500

				.simple-message
					font-size: 12pt
					font-family: Raleway, sans-serif
					font-weight: 600
					color: #555555
				.unlock-message
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
				.unlock-password
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
		.unlock
			height: auto
			min-height: 100vh
			&>.row
				min-height: 100vh
				&>div
					//height: 100%
					&>.row
						height: 100%
			.unlock-panel
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