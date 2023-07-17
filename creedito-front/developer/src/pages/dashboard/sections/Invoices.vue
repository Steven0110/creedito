<template lang="pug">
	.invoices-subpanel
		.subpanel-title.d-none.d-md-block
			|Mis facturas
		.subpanel-description
			|En esta sección podrás consultar las facturas que hayas subido.
		.content
			//filter-bar(v-model="filters", @search="filter", @filter="filter", @sort="filter")

			row-card-loader(:show="status.loading")

			.invoices-container()
				transition-group(name="fade-transition", tag="div", class="row")
					invoice(v-for="(invoice, index) in invoices", :invoice="invoice", :key="invoice._id", @delete="removeInvoice(index)")
					invoice-add-card(key="-1")


</template>

<script>
	import Invoice 			from "@/components/dashboard/elements/invoices/Invoice.vue"
	import FilterBar 		from "@/components/dashboard/elements/invoices/FilterBar.vue"
	import InvoiceAddCard 	from "@/components/dashboard/elements/invoices/creators/InvoiceAddCard.vue"
	import Uploader 		from "@/components/tools/files/Uploader.vue"
	import RowCardLoader 	from "@/components/tools/loader/RowCardLoader.vue"

	export default {
		data() {
			return {
				status: {
					loading: false
				},
				filters: {
					goal: [100000, 10000000],
					sort: "none"
				},
				page: 1,
				invoices: [],
			}
		},
		methods: {
			filter: function() {
				let filters = this.filters
				let page = this.page

				this.findInvoices()
			},
			findInvoices: function() {
				
				if( !this.status.loading ){
					this.invoices = []
					this.status.loading = true

					this.$invoices.get("find")
					.then(result => {
						let invoices = result.data.invoices

						// Agrega uno por uno las facturas para generar un efecto de 
						this.renovateSession()
						
						setTimeout(() => {
							for( let i = 0 ; i < invoices.length ; i++ )
								(i => {
									setTimeout(() => {
										 this.invoices.push( invoices[ i ] )
									}, 150 * i)
								})(i);
						}, 500)

					})
					.catch(err => {
						console.error( err )
						this.$swal("Error", "Hubo un error al consultar las facturas disponibles, por favor vuelva a intentarlo.", "warning")
						this.$sentry.captureException( new Error(err) )
					})
					.finally(() => this.status.loading = false)
				}
			},
			removeInvoice: function( index ) {
				this.invoices.splice(index, 1)
			}
		},
		mounted(){
			this.findInvoices()

			// Define la página actual
			this.page = this.$route.query.page || 1

		},
		activated(){
			this.findInvoices()

			// Define la página actual
			this.page = this.$route.query.page || 1

		},
		components: {
			Uploader,
			RowCardLoader,
			Invoice,
			FilterBar,
			InvoiceAddCard
		}
	}
</script>

<style lang="sass">
	.invoices-subpanel
		.subpanel-title
			text-transform: uppercase
			font-family: Raleway
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600
		.subpanel-description
			font-family: Raleway
			font-size: 18px
			color: #444
	@media only screen and (max-width: 600px)
		.invoices-subpanel
</style>