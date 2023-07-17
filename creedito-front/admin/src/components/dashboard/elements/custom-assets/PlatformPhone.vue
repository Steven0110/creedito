<template lang="pug">
	.platform-phone
		v-img(src="/assets/icons/smartphone.webp")
		img.phone-icon(:src="platform")
</template>

<script>

	export default {
		props: ["platform"],
		mounted() {
		},
		methods: {
		},
	}
</script>

<style lang="sass">
	.platform-phone
		position: relative
		margin-bottom: 15px
		.phone-icon
			position: absolute
			margin: auto
			width: 30%
			top: 0
			bottom: 0
			left: 0
			right: 0
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>