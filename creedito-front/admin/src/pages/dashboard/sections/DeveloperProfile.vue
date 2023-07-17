<template lang="pug">
	.user-profile-subpanel
		.subpanel-title.d-none.d-md-block
			|Mi perfil
		.subpanel-description
			|En esta sección podrás consultar y modificar información general de tu cuenta
		.content
			v-row
				v-col(md="4", cols="12")
					profile-card
</template>

<script>
	import ProfileCard 	from "@/components/dashboard/elements/profile/ProfileCard.vue"

	export default {
		data() {
			return {
				tabs: 0
			}
		},
		components: {
			ProfileCard,
		}
	}
</script>

<style lang="sass">
	.user-profile-subpanel
		.subpanel-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600
		.subpanel-description
			font-family: Roboto
			font-size: 18px
			color: #444
		.profile-card
			.profile-name
				color: #3f9690
				margin-top: 10px
				font-family: Roboto
				text-transform: uppercase
				font-weight: 600
				font-size: 0.7rem
				letter-spacing: 1px
			.profile-value
				font-family: Roboto
				color: #666
				font-size: 1rem
</style>