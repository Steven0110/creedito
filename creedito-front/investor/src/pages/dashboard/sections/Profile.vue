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
						v-tab(key="fiscal")
							|Fiscal
						v-tab(key="seguridad")
							|Seguridad
						v-tab(key="manifiesto", v-if="!$store.getters.user.agreed")
							|Manifiesto

						v-tab-item(key="fiscal")
							fiscal

						v-tab-item(key="seguridad")
							seguridad

						v-tab-item(key="manifiesto")
							manifiesto
</template>

<script>
	import ProfileCard 	from "@/components/dashboard/elements/profile/ProfileCard.vue"
	import Fiscal 		from "@/components/dashboard/elements/profile/info/Fiscal.vue"
	import Seguridad 	from "@/components/dashboard/elements/profile/info/Seguridad.vue"
	import Manifiesto 	from "@/components/dashboard/elements/profile/info/Manifiesto.vue"


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
			Fiscal,
			Seguridad,
			Manifiesto
		}
	}
</script>

<style lang="sass">
	.profile-subpanel
		.subpanel-title
			text-transform: uppercase
			font-family: Raleway
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600
		.subpanel-description
			font-family: Raleway
			font-size: 18px
			color: #444
		.profile-card
			.profile-name
				color: #176580
				margin-top: 10px
				font-family: Raleway
				text-transform: uppercase
				font-weight: 600
				font-size: 0.7rem
				letter-spacing: 1px
			.profile-value
				font-family: Raleway
				color: #666
				font-size: 1rem
</style>