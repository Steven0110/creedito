<template lang="pug">
	.fiscal-info
		.info-container(v-if="info && info.claveElector")

			.fiscal-field(v-if="info.fullname && info.motherSurname && info.fatherSurname")
				.fiscal-name
					|Nombre completo
				.fiscal-value
					|{{ info.fullname }} {{ info.fatherSurname }} {{ info.motherSurname }}

			.fiscal-field(v-if="info.birth")
				.fiscal-name
					|Fecha de nacimiento
				.fiscal-value
					|{{ info.birth | fixDate | moment("Do [de] MMMM [de] YYYY")}}

			.fiscal-field(v-if="info.curp")
				.fiscal-name
					|CURP
				.fiscal-value
					|{{ info.curp }}

			.fiscal-field(v-if="info.address")
				.fiscal-name
					|Dirección
				.fiscal-value
					|{{ info.address.fullAddress }}
			.demox.mt-5
				|Resultado de UB Cubo: {{ $store.getters.user.searchResults }}

		.not-available(v-else)
			|Esta sección aún no está disponible por el momento
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		computed: {
			info: function() {
				return (this.$store.getters.user || {}).info || {}
			}
		},
		filters: {
			fixDate: function( value ) {
				const dd = value.substr(5, 2)
				const mm = value.substr(8, 2)
				const yyyy = value.substr(0, 4)

				return `${yyyy}-${mm}-${dd}`
			}
		},
		methods: {
		},
		components: {
		}
	}
</script>

<style lang="sass">
	.fiscal-info
		background-color: white
		padding: 15px
		.info-container
			.fiscal-field
				.fiscal-name
					color: #176580
					margin-top: 10px
					font-family: Raleway
					text-transform: uppercase
					font-weight: 600
					font-size: 0.7rem
					letter-spacing: 1px
				.fiscal-value
					font-family: Roboto
					color: #666
					font-size: 1rem
		.not-available
			text-align: center
			font-family: Raleway

	@media only screen and (min-width: 1904px)
		.fiscal-info
	@media only screen and (max-width: 1903px)
		.fiscal-info
	@media only screen and (max-width: 1264px)
		.fiscal-info
	@media only screen and (max-width: 960px)
		.fiscal-info
</style>