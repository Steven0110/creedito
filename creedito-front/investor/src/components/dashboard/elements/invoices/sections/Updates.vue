<template lang="pug">
	.updates-timeline
		v-row
			v-col(cols="12", md="4", offset-md="4")
				v-btn(color="primary", block, large, @click="showUpdateCreator")
					|Agregar actualización
					v-icon(right)
						|mdi-plus

		v-timeline(align-top)
			transition-group(name="fade-transition", tag="div")
				timeline-step(
					v-for="update in updates",
					:key="update.title",
					@showGallery="showGallery",
					:item="update")
					
		.image-viewer
			.images.clearfix.d-none(ref="gallery", v-viewer="{rotatable: false, scalable: false, movable: true}")
				img(v-for="image in gallery", :src="image", :key="image")
</template>

<script>
	import TimelineStep 	from "@/components/dashboard/elements/invoices/timeline/TimelineStep.vue"

	export default {
		props: ["updates"],
		data() {
			return {
				gallery: [
                ]
			}
		},
		methods: {
			showGallery: function(pictures) {
				this.gallery = pictures
				const gallery = this.$refs.gallery.$viewer
				gallery.show()

			},
			showUpdateCreator: function() {
				this.$emit("addUpdate")
			}
		},
		components: {
			TimelineStep
		}
	}
</script>

<style lang="sass">
	.updates-timeline
</style>