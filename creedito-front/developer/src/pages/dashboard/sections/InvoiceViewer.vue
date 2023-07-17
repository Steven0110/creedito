<template lang="pug">
	.project-viewer
		.project-title.d-none.d-md-block
			v-icon(left, color="black", large, @click="back")
				|mdi-chevron-left
			span
				|{{ project.title }}

		.content
			invoice-card-loader(:show="status.loading")

			v-row(v-if="!status.loading")

				v-col(cols="12", md="7")
					.project-main-video(v-if="videoId")
						youtube(:video-id="videoId", :player-vars="{autoplay: 0}", height="400")
					.project-main-image(v-else)
						v-img(:src="project.mainImage", max-height="400", lazy-src="/assets/images/image-loader.jpg")
							template(v-slot:placeholder)
								v-row.fill-height.ma-0(align="center", justify="center")
									v-progress-circular(indeterminate, color="grey lighten-5")

				v-col.main-metrics(cols="12", md="5")
					v-row
						v-col.pb-0(cols="12")
							goal-slider(:value="project.progress", :totalInvested="project.totalInvested", :goal="project.goal")
						v-col(cols="12", md="6")
							single-metric(:value="15", text="Inversionistas")
							single-metric(:value="66", text="días restantes")
							single-metric(:value="project.roi + '%'", text="de retorno de inversión")
						v-col(cols="12", md="6")
							risk-level(:risk="project.risk")
						//v-col(cols="12")
							.project-actions
								v-btn(color="primary", block, large)
									|Quiero invertir
									
				v-col.project-carousel(cols="12")
					slider-gallery(:images="project.gallery")

				v-col.pb-0(cols="12")
					.project-content
						
						v-tabs(v-model="tab", color="#B05900")
							v-tab(key="description")
								|Descripción
							v-tab(key="updates")
								|Actualizaciones
							v-tab(key="simulator")
								|Simulador de inversión

						v-tabs-items(v-model="tab")
							v-tab-item(key="description")
								description
							v-tab-item(key="updates")
								updates(:updates="project.updates")
							v-tab-item(key="simulator")
								simulator(:invested="project.totalInvested", :goal="project.goal", :roi="project.roi")

</template>

<script>
	import InvoiceCardLoader 	from "@/components/tools/loader/InvoiceCardLoader.vue"
	import SingleMetric 		from "@/components/dashboard/elements/invoices/kpi/SingleMetric.vue"
	import GoalSlider 			from "@/components/dashboard/elements/invoices/kpi/GoalSlider.vue"
	import RiskLevel 			from "@/components/dashboard/elements/invoices/kpi/RiskLevel.vue"
	import SliderGallery		from "@/components/dashboard/elements/invoices/gallery/SliderGallery.vue"
	import Description			from "@/components/dashboard/elements/invoices/sections/Description.vue"
	import Updates				from "@/components/dashboard/elements/invoices/sections/Updates.vue"
	import Simulator			from "@/components/dashboard/elements/invoices/sections/Simulator.vue"

	export default {
		data() {
			return {
				status: {
					loading: true
				},
				project: {
					title: "Cargando información...",
					progress: 0,
					totalInvested: 0,
					updates: []
				},
				tab: null
			}
		},
		methods: {
			load: function() {
				this.status.loading = true
				let id = this.$route.params.id

				this.$projects.get(`find/${id}`)
				.then(result => {
					this.$wait(500, () => this.project = result.data.project)
				})
				.catch(err => {
					console.error( err )
				})
				.finally(() => this.status.loading = false)
			},
			back: function() {
				this.$router.go( -1 )
			}
		},
		computed: {
			videoId: function() {
				if( this.project.mainVideo ){
					const url = this.project.mainVideo
					const qs = url.split("?")[1]
					if( qs ){
						const params = new URLSearchParams( qs )
						const v = params.get("v")
						return v
					}else
						return false
				}else
					return false
			}
		},
		mounted(){
			console.log("mounted")
			//this.load()
		},
		activated(){
			console.log("activated")
			this.load()
		},
		components: {
			InvoiceCardLoader,
			SingleMetric,
			GoalSlider,
			RiskLevel,
			SliderGallery,
			Description,
			Updates,
			Simulator
		}
	}
</script>

<style lang="sass">
	.project-viewer
		.project-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600

			span
				vertical-align: middle
		.content
			.project-main-video
				iframe
					width: 100%
			.project-content
				margin-left: -15px
				margin-right: -15px
				margin-bottom: -15px
				padding: 25px
				padding-top: 10px
				background-color: white
				.v-tabs-items
					padding-top: 25px
					padding-bottom: 25px

	@media only screen and (min-width: 1905px)
		.project-viewer
	@media only screen and (max-width: 1904px)
		.project-viewer
	@media only screen and (max-width: 600px)
		.project-viewer
</style>