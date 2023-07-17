<template lang="pug">
	.image-radio-group
		.image-button(
			v-for="image in images",
			:key="image",
			:class="{selected: selected === image}",
			@click="selectImage( image )")

			img(:src="'/assets/images/secret/' + image")
			transition(name="slide-x-transition", mode="out-in")
				v-btn(color="primary", large, fab, absolute, v-if="selected === image")
					v-icon(color="white")
						|mdi-check-outline
</template>

<script>
	export default {
		props: ["images", "value"],
		data() {
			return {
				selected: ""
			}
		},
		mounted() {
		},
		methods: {
			selectImage: function( image ){
				this.selected = image
				this.$emit("input", image)
			}
		}
	}
</script>

<style lang="sass">
	.image-radio-group
		text-align: center
		.image-button
			display: inline-block
			position: relative
			width: 180px
			height: 180px
			padding: 10px
			border-radius: 7px
			transition: 0.2s linear all
			img
				position: absolute
				display: inline-block
				width: calc(100% - 20px)
				max-height: calc(100% - 20px)
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				transition: 0.2s linear all
			.v-btn
				top: -15px
				left: 50%
				transform: translateX(-50%)
				transition: 0.2s linear all
			&:hover
				cursor: pointer
			&.selected
				transition: 0.2s linear all
				img
					transform: scale(1.2)
					box-shadow: 1px 1px 7px 2px #3f9690
					transition: 0.2s linear all
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>