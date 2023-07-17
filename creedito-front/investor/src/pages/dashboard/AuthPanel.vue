<template lang="pug">
	.auth-panel
		v-row
			v-col(cols="12", md="6")
				google-authenticator-factor
			v-col(cols="12", md="6")
				security-questions
			v-col(cols="12", md="6")
				account-verificator
			v-col(cols="12", md="6")
				secret-image
</template>

<script>

	import GoogleAuthenticatorFactor 	from "@/components/dashboard/elements/auth/GoogleAuthenticatorFactor.vue"
	import AccountVerificator 			from "@/components/dashboard/elements/auth/AccountVerificator.vue"
	import SecurityQuestions 			from "@/components/dashboard/elements/auth/SecurityQuestions.vue"
	import SecretImage 					from "@/components/dashboard/elements/auth/SecretImage.vue"

	export default {
		mounted() {
		},
		methods: {
		},
		components: {
			GoogleAuthenticatorFactor,
			AccountVerificator,
			SecurityQuestions,
			SecretImage
		}
	}
</script>

<style lang="sass">
	.auth-panel
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>