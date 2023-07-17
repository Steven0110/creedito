<template lang="pug">
	.google-authenticator-factor
		v-card
			v-img(src="/assets/images/GoogleAuthenticator.png", :height="imgHeight")
			v-card-title
				|Google Authenticator
			v-card-subtitle
				|Ingresa un código temporal cada vez que inicies sesión. Éste código cambia cada 30 segundos. 
			v-card-actions
				v-spacer
				v-btn(color="red", text, dark, v-if="$store.getters.user.tfa", @click="disableTFA")
					|Desactivar
				v-btn(color="green", dark, v-if="$store.getters.user.tfa")
					|Activado
					v-icon(right)
						|mdi-check
				v-btn(color="primary", v-if="!$store.getters.user.tfa", @click="showConfig = true")
					|Activar

		v-dialog(v-model="showConfig", max-width="700", persistent, content-class="ga-config-dialog")
			v-card.google-authenticator-card()
				v-card-title
					|Configuración de Google Authenticator
				v-card-text
					v-stepper(v-model="step")
						v-stepper-header
							v-stepper-step(step="1")
								|Descargar la app
							v-divider
							v-stepper-step(step="2")
								|Vincular
							v-divider
							v-stepper-step(step="3")
								|Confirmar

						v-stepper-content(step="1")
							v-row
								v-col(md="6")
									platform-phone(platform="/assets/icons/android.png")
									v-btn(
										block,
										color= "primary",
										href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=es_MX",
										target="_blank")
										|Descargar para Android
										v-icon(right)
											|mdi-download
								v-col(md="6")
									platform-phone(platform="/assets/icons/apple.png")
									v-btn(
										block,
										color= "primary",
										href="https://apps.apple.com/es/app/google-authenticator/id388497605",
										target="_blank")
										|Descargar para iOS
										v-icon(right)
											|mdi-download

						v-stepper-content(step="2")
							v-row
								v-col(cols="12", md="4", offset-md="4")
									v-btn(
										block,
										x-large,
										color="primary",
										:loading="status.qr.loading",
										@click="generateQR",
										v-show="!status.qr.generated")
										|Generar código QR
										v-icon(right)
											|mdi-qrcode
								v-col(cols="12", md="6", offset-md="3" v-if="status.qr.result")
									v-img(:src="status.qr.result")
									v-alert(v-model="status.qr.generated", dark, color="success")
										|Escanea éste código en la app de Google Authenticator

						v-stepper-content(step="3")
							v-alert.text-center(color="info", dark)
								|Por favor ingresa el código que actualmente se muestra en la aplicación:
							v-row
								v-col(cols="12", md="4", offset-md="4")
									input.otp-input(
										ref="otp-input",
										v-model="status.otp.input",
										v-mask="'# # # # # #'",
										v-on:keyup.enter="validateOTP")
									v-btn(
										block,
										color="primary",
										:loading="status.otp.loading",
										@click="validateOTP",
										x-large)
										|Verificar
				v-card-actions
					v-spacer
					v-btn(text, color="primary", @click="showConfig = false")
						|Cerrar
					v-btn(color="#599cb3", dark, @click="--step", v-show="step > 1")
						v-icon(left)
							|mdi-chevron-left
						|Atrás
					v-btn(
						color="primary",
						@click="stepChange",
						:disabled="step == 2 && !status.qr.generated",
						v-show="step < 3")
						|Siguiente
						v-icon(right)
							|mdi-chevron-right
</template>

<script>

	import PlatformPhone from "@/components/dashboard/elements/custom-assets/PlatformPhone.vue"

	export default {
		data() {
			return {
				showConfig: false,
				step: 1,
				status: {
					qr: {
						loading: false,
						generated: false,
						result: ""
					},
					otp: {
						input: "",
						verified: false,
						loading: false
					}
				}
			}
		},
		mounted() {
		},
		methods: {
			generateQR: function() {
				this.status.qr.loading = true
				this.$security.post("register-tfa", {type: "generate"})
				.then( response => {
					this.status.qr.result = response.data.result
					this.status.qr.generated = true
				})
				.catch( err => {
					console.log( err )
					this.$swal("Algo salió mal.", "Por favor vuelve a intentarlo.", "error")
				})
				.finally(() => {
					this.status.qr.loading = false
				})
			},
			validateOTP: function() {
				this.status.otp.loading = true
				let body = {}
				body.type = "verify"
				body.otp = this.$sanitizer.sanitizeXSS(this.status.otp.input.replace(/\s/g, ""))
				
				this.$security.post("register-tfa", body)
				.then( response => {
					this.$swal("¡Listo!", "Tu cuenta ahora está protegida por un doble factor de autenticación", "success")
					this.showConfig = false
					this.$store.commit("setTFA", true)
				})
				.catch( err => {
					if( err.response.status == 409 || err.response.status == 500 ){
						this.$swal("Algo salió mal.", "Por favor vuelve a intentarlo.", "error")
						console.log( err )
					}else if( err.response.status == 401 )
						this.$swal("El código OTP ingresado es incorrecto.", "Por favor vuelve a intentarlo.", "error")
				})
				.finally(() => {
					this.status.otp.loading = false
				})
			},
			disableTFA: function() {
				this.$swal({
					title: "¿Estás seguro que deseas desactivarlo?",
					text: "Aparte de restarle seguridad a tu cuenta, no podrás hacer operaciones en la plataforma",
					type: "warning",
					confirmButtonText: "Sí, desactivar",
					cancelButtonText: "Regresar",
					showCancelButton: true,
					reverseButtons: true
				})
				.then( result => {
					if(result.value) {
						this.$swal({
							title: "",
							text: "Por favor ingresa el código que aparece en Google Authenticator:",
							input: 'password',
							showLoaderOnConfirm: true,
							preConfirm: otp => {
								return this.$security.get("disable-tfa", {headers: {Authorization: otp}})
								.then(response => {
									return response.data
								})
								.catch(err => {
									if( err.response.status == 401)
										this.$swal.showValidationMessage("Código OTP inválido")
									else{
										this.$swal.showValidationMessage("Algo salió mal, por favor vuelve a intentarlo")
										this.$sentry.captureException( err )
									}
								})
							},
							allowOutsideClick: () => !this.$swal.isLoading()
						})
						.then(() => {
							this.$store.commit("setTFA", false)
							this.$swal("¡Listo!", "El segundo factor ha sido desactivado en tu cuenta. Ya puedes borrar el registro de Investus en Google Authenticator", "success")

							this.reset()
						})
					}
				})
			},
			stepChange: function() {
				++this.step

				if( this.step == 3 )
					this.$nextTick(() => {
						this.$refs["otp-input"].focus()
					})
			},
			reset: function() {
				this.step = 1
				this.status = {
					qr: {
						loading: false,
						generated: false,
						result: ""
					},
					otp: {
						input: "",
						verified: false,
						loading: false
					}
				}
			}
		},

		computed: {
			imgHeight: function() {
				if(this.$vuetify.breakpoint.smAndDown)
					return "200"
				else
					return "300"
			}
		},
		components: {
			PlatformPhone,
		}
	}
</script>

<style lang="sass">
	.google-authenticator-factor

	.google-authenticator-card
		.otp-input
			font-family: Raleway
			font-size: 30px
			border: 1px solid rgba(0, 0, 0, 0.5)
			border-radius: 5px
			padding: 10px
			width: 100%
			text-align: center

	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)
		.ga-config-dialog
			.v-stepper
				.v-stepper__content
					padding-left: 10px
					padding-right: 10px

</style>