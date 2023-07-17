<template lang="pug">
	.invoice-reviewer
		.invoice-title.d-none.d-md-block.mb-2
			v-icon(left, color="black", large, @click="back")
				|mdi-chevron-left
			span
				|UUID: {{ $store.getters.currentInvoice.uuid }}
			v-btn(
				color="primary",
				absolute,
				right,
				top,
				@click="status.show.developer = true",
				v-if="$store.getters.currentInvoice.developer._id")
				|Ver solicitante

		.content
			v-row(v-if="status.loading")
				v-col(cols="12")
					invoice-card-loader(:show="status.loading")
			v-row(v-else)
				v-col(cols="12")
					invoice-info(:readonly="false")

			developer-summary(,
				@close="status.show.developer = false",
				:show="status.show.developer",
				v-if="$store.getters.currentInvoice.developer._id")

</template>

<script>
	import InvoiceCardLoader 	from "@/components/tools/loader/InvoiceCardLoader.vue"
	import DeveloperSummary 	from "@/components/dashboard/elements/developers/DeveloperSummary.vue"
	import InvoiceInfo 			from "@/components/dashboard/elements/invoices/InvoiceInfo.vue"

	export default {
		data() {
			return {
				status: {
					loading: true,
					show: {
						developer: false
					}
				},
				tab: null
			}
		},
		methods: {
			load: function() {
				this.status.loading = true
				let id = this.$route.params.id

				this.$invoices.get(`find/${id}`)
				.then( ({data}) => this.$store.commit("setCurrentInvoice", data.invoice) )
				.catch(err => this.$report(err, {swal: true}))
				.finally(() => this.status.loading = false)
			},
			back: function() {
				this.$router.go( -1 )
			}
		},
		activated(){
			this.load()
		},
		components: {
			InvoiceInfo,
			InvoiceCardLoader,
			DeveloperSummary
		}
	}
</script>

<style lang="sass">
	.invoice-reviewer
		.invoice-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600

			span
				vertical-align: middle
		.content
			.invoice-main-video
				iframe
					width: 100%
			.invoice-content
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
		.invoice-reviewer
	@media only screen and (max-width: 1904px)
		.invoice-reviewer
	@media only screen and (max-width: 600px)
		.invoice-reviewer
</style>