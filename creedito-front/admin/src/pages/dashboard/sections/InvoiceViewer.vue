<template lang="pug">
	.invoice-viewer
		.invoice-title.d-none.d-md-block
			v-icon(left, color="black", large, @click="back")
				|mdi-chevron-left
			span
				|UUID: {{ invoice.uuid }}

		.content
			v-row(v-if="status.loading")
				v-col(cols="12")
					invoice-card-loader(:show="status.loading")
			v-row(v-else)
				v-col(cols="12")
					invoice-info(:invoice="invoice", :readonly="false")

</template>

<script>
	import InvoiceCardLoader 	from "@/components/tools/loader/InvoiceCardLoader.vue"
	import InvoiceInfo 			from "@/components/dashboard/elements/invoices/InvoiceInfo.vue"

	export default {
		data() {
			return {
				status: {
					loading: true
				},
				invoice: {uuid: "..."},
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
				this.$router.go( -1 )
			}
		},
		computed: {
		},
		mounted(){
			//console.log("mounted")
			//this.load()
		},
		activated(){
			console.log("activated")
			this.load()
		},
		components: {
			InvoiceInfo,
			InvoiceCardLoader
		}
	}
</script>

<style lang="sass">
	.invoice-viewer
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
		.invoice-viewer
	@media only screen and (max-width: 1904px)
		.invoice-viewer
	@media only screen and (max-width: 600px)
		.invoice-viewer
</style>