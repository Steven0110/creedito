<template lang="pug">
	.slider-gallery(v-if="images && images.length > 0")
		carousel-3d(:width="width", perspective="60", controlsVisible, :onMainSlideClick="slideClicked")
			slide(v-for="(image, index) in images", :index="index", :key="image")
				img(:src="image")

		.image-viewer
			.images.clearfix.d-none(ref="viewer", v-viewer="{rotatable: false, scalable: false, movable: true}")
				img(v-for="image in viewerImages", :src="image", :key="image")
</template>

<script>
	export default {
		props: ["images"],
		data() {
			return {
				viewerImages: []
			}
		},
		computed: {
			width: function() {
				if( this.$vuetify.breakpoint.xlOnly )
					return 600
				else if( this.$vuetify.breakpoint.lgOnly )
					return 500
				else if( this.$vuetify.breakpoint.mdOnly )
					return 360
				else if( this.$vuetify.breakpoint.smOnly )
					return 300
				else if( this.$vuetify.breakpoint.xsOnly )
					return 250
			}
		},
		methods: {
			slideClicked: function({ index }) {
				this.viewerImages = [...this.images]

				if( index != 0 ){
					let spliced = this.viewerImages.splice(0, index)
					this.viewerImages = this.viewerImages.concat( spliced )
				}

				const viewer = this.$refs.viewer.$viewer
				viewer.show()
			}
		},
	}
</script>

<style lang="sass">
	.slider-gallery
		height: 360px
		.carousel-3d-container
			height: 90% !important
			margin-top: 50px
			.carousel-3d-slider
				height: 100% !important
				.carousel-3d-slide
					height: 100% !important
					background-color: transparent !important
					border: none !important
					img
						position: absolute
						top: 0
						bottom: 0
						margin-top: auto
						margin-bottom: auto
				.carousel-3d-controls
					.next
						span
							color: white !important
</style>