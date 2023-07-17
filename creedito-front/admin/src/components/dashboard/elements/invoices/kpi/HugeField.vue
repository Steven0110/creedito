<template lang="pug">
	transition(name="fade-transition")
		.huge-field(v-if="value")
			.huge-field-text
				|{{ text }}
			.huge-field-value
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
	.huge-field
		padding: 10px
		margin-top: 10px
		border: 1px solid #176580
		border-radius: 7px
		.huge-field-value
			font-family: Roboto
			color: #666
			font-size: 1.5rem
		.huge-field-text
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 1.2rem
			letter-spacing: 1px
			line-height: 1.5rem
</style>