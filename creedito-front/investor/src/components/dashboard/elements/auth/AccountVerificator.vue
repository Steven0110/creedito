<template lang="pug">
	.account-verificator
		v-card
			v-img(src="/assets/images/email-verification-2.jpg", :height="imgHeight")
			v-card-title
				|Verificación de cuenta
			v-card-subtitle(v-if="!$store.getters.user.verified")
				|Verifica tu cuenta para que puedas disfrutar de todos los beneficios que Investus tiene para tí.
			v-card-subtitle(v-else)
				|Tu cuenta ya se encuentra verificada
			v-card-actions
				v-spacer
				v-btn(color="primary", dark, v-if="!$store.getters.user.verified", @click="resendVerification", :loading="status.sending")
					|Volver a enviar email
				v-btn(color="green", dark, v-else)
					|Verificada
					v-icon(right)
						|mdi-check
</template>

<script>
	export default {
		data() {
			return {
				status: {
					sending: false
				}
			}
		},
		mounted() {
		},
		methods: {
			resendVerification: function() {
				this.status.sending = true
				let resource = "resend-validation"
				this.$security.get( resource )
				.then( result => {
					console.log(result.data)
					this.$swal("¡Listo!", "Te hemos enviado un correo con un enlace para verificar tu cuenta", "success")
				})
				.catch( err => {
					console.error( err )
				})
				.finally( () => {
					this.status.sending = false
				})
			}
		},
		computed: {
			imgHeight: function() {
				if(this.$vuetify.breakpoint.smAndDown)
					return "200"
				else
					return "300"
			}
		}
	}
</script>

<style lang="sass">
	.account-verificator
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>