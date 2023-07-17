<template lang="pug">
	.profile-subpanel
		.subpanel-title.d-none.d-md-block
			|Mi perfil
		.subpanel-description
			|En esta sección podrás consultar y modificar información general de tu cuenta
		.content
			v-row
				v-col(md="4", cols="12")
					profile-card

				v-col(md="8", cols="12")
					v-tabs(fixed-tabs, v-model="tabs")
						v-tab(key="seguridad")
							|Seguridad

						v-tab-item(key="seguridad")
</template>

<script>
	import ProfileCard 	from "@/components/dashboard/elements/profile/ProfileCard.vue"
	import Seguridad 	from "@/components/dashboard/elements/profile/info/Seguridad.vue"


	export default {
		data() {
			return {
				tabs: 0
			}
		},
		computed: {
		},
		methods: {
		},
		components: {
			ProfileCard,
			Seguridad,
		}
	}
</script>

<style lang="sass">
	.profile-subpanel
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
				color: #176580
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