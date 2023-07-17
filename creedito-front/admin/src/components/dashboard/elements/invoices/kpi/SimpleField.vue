<template lang="pug">
	transition(name="fade-transition")
		.simple-field(v-if="value")
			.simple-field-text
				|{{ text }}
			.simple-field-value
				|{{ value }}
</template>

<script>
	export default {
		props: ["value", "text"]
	}
</script>

<style lang="sass">
	.simple-field
		padding-top: 10px
		.simple-field-value
			font-family: Roboto
			color: #666
			font-size: 1rem
		.simple-field-text
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 0.7rem
			letter-spacing: 1px
			line-height: 0.7rem
</style>