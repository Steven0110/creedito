<template lang="pug">
	transition(name="fade-transition")
		.medium-field(v-if="value")
			.medium-field-text
				|{{ text }}
			.medium-field-value
				|{{ value | currency }}
</template>

<script>
	export default {
		props: ["value", "text"],
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(2).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			}
		},
	}
</script>

<style lang="sass">
	.medium-field
		padding-top: 10px
		.medium-field-value
			font-family: Roboto
			color: #666
			font-size: 1.2rem
		.medium-field-text
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 0.9rem
			letter-spacing: 1px
			line-height: 1.2rem
</style>