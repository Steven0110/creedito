<template lang="pug">
	transition(name="fade-transition")
		.single-metric(v-if="value")
			.single-metric-value
				|{{ value }}
			.single-metric-text
				|{{ text }}
</template>

<script>
	export default {
		props: ["value", "text"]
	}
</script>

<style lang="sass">
	.single-metric
		padding-top: 10px
		.single-metric-value
			color: #B05900
			font-size: 1.8rem
			font-weight: 500
			padding-top: 10px
			line-height: 2rem
		.single-metric-text
			color: #777
			font-size: 1rem
</style>