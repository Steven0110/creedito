<template lang="pug">
	.invoice-publisher
		.invoice-title.d-none.d-md-block
			v-icon(left, color="black", large, @click="back")
				|mdi-chevron-left
			span
				|UUID: {{ invoice.uuid }}

		.content
			invoice-card-loader(:show="status.loading")

			v-row(v-if="invoice.uuid")
				v-col(cols="12")
					invoice-info(:invoice="invoice")

</template>

<script>
	import InvoiceCardLoader 	from "@/components/tools/loader/InvoiceCardLoader.vue"
	import SingleMetric 		from "@/components/dashboard/elements/invoices/kpi/SingleMetric.vue"
	import GoalSlider 			from "@/components/dashboard/elements/invoices/kpi/GoalSlider.vue"
	import RiskLevel 			from "@/components/dashboard/elements/invoices/kpi/RiskLevel.vue"
	import SliderGallery		from "@/components/dashboard/elements/invoices/gallery/SliderGallery.vue"
	import Description			from "@/components/dashboard/elements/invoices/sections/Description.vue"
	import Updates				from "@/components/dashboard/elements/invoices/sections/Updates.vue"
	import Observations			from "@/components/dashboard/elements/invoices/sections/Observations.vue"
	import InvoiceInfo 			from "@/components/dashboard/elements/invoices/InvoiceInfo.vue"

	export default {
		data() {
			return {
				status: {
					loading: true,
					show: {
						titleEditor: false,
						snackbar: false,
						imageVideoEditor: true
					}
				},
				invoice: {},
				tab: null
			}
		},
		methods: {
			load: function() {
				this.status.loading = true
				let id = this.$route.params.id

				this.$invoices.get(`find/${id}`)
				.then(result => {
					this.$wait(500, () => this.invoice = result.data.invoice)
				})
				.catch(err => {
					console.error( err )
				})
				.finally(() => this.status.loading = false)
			},
			back: function() {
				this.$router.push({ path: "/dashboard/facturas"})
			}
		},
		computed: {
			videoId: function() {
				if( this.invoice.mainVideo ){
					const url = this.invoice.mainVideo
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
			Observations,
			InvoiceInfo
		}
	}
</script>

<style lang="sass">
	.invoice-publisher
		.invoice-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600

			span
				vertical-align: middle
				padding-right: 10px
		.content
			.image-video-container
				position: relative
				.invoice-main-video
					iframe
						width: 100%
				.invoice-main-image
					.white-background
						background: white
			.invoice-content
				margin-bottom: -15px
				background-color: white
				.v-tabs
					.v-tab
						.v-badge
							margin-left: 5px
				.v-tabs-items
					padding: 15px

	@media only screen and (min-width: 1905px)
		.invoice-publisher
	@media only screen and (max-width: 1904px)
		.invoice-publisher
	@media only screen and (max-width: 600px)
		.invoice-publisher
</style>