<template lang="pug">
	v-timeline-item(key="item.title", color="#2f89a8", :icon="icon", fill-dot)
		span.timeline-item-date(slot="opposite")
			|{{ item.date | moment("MMMM, YYYY")}}
		v-card(dark, color="primary")
			v-card-title
				|{{ item.title }}
				//v-icon(@click="", medium)
					|mdi-pencil
			v-card-text.white(v-if="item.description")
				span
					|{{ item.description }}

				.gallery-thumbnails(v-if="item.pictures")
					img(v-for="image in item.pictures", :key="image", :src="image")
					.gallery-overlay(@click="$emit('showGallery', item.pictures)")
						|Ver fotos
</template>

<script>
	export default {
		props: ["item"],
		data(){
			return {

			}
		},
		computed: {
			icon: function() {
				switch(this.item.type){
					case "development":
						return "mdi-tools"
						break
					case "achievement-50":
						return "mdi-circle-slice-4"
						break
					case "achievement-80":
						return "mdi-circle-slice-7"
						break
					case "goal":
						return "mdi-star"
						break
					case "start":
						return "mdi-circle"
						break
					default:
						return "mdi-tools"
				}
			}
		},
		methods: {}
	}
</script>

<style lang="sass">
	.v-timeline
		.v-timeline-item
			.v-timeline-item__opposite
				align-self: start !important
				.timeline-item-date
					display: block
					font-weight: 700
					font-size: 1rem
					color: #176580
					padding-top: 6px
					text-transform: capitalize
			.v-card
				.v-card__title
					font-size: 1rem
					.v-icon
						position: absolute !important
						right: 15px !important
				.v-card__text
					color: #555
					font-size: 1rem
					padding-top: 10px

					.gallery-thumbnails
						text-align: center
						padding-top: 15px
						position: relative
						overflow: hidden
						img
							display: inline-block
							height: 50px
							max-width: 70px
							margin-right: 5px

							&:hover
								cursor: pointer
						.gallery-overlay
							position: absolute
							top: 100%
							left: 0
							width: 100%
							height: 100%
							background-color: rgba(0, 0, 0, 0.6)
							color: white
							font-size: 1.5rem
							font-weight: 600
							text-align: center
							text-transform: uppercase
							padding-top: 25px
							transition: 0.2s linear all

						&:hover
							.gallery-overlay
								top: 0
								transition: 0.2s linear all
								cursor: pointer

</style>