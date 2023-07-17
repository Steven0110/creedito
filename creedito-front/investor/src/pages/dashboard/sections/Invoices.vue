<template lang="pug">
	.invoices-subpanel
		.subpanel-title.d-none.d-md-block
			|Facturas
		.subpanel-description
			|En esta sección podrás consultar las facturas publicadas para que puedas invertir en ellas.
		.content
			//filter-bar(v-model="filters", @search="filter", @filter="filter", @sort="filter")

			row-card-loader(:show="status.loading")

			.invoices-container()
				transition-group(name="fade-transition", tag="div", class="row")
					invoice(v-for="(invoice, index) in invoices", :invoice="invoice", :key="invoice._id")


</template>

<script>
	import Invoice 			from "@/components/dashboard/elements/invoices/Invoice.vue"
	import FilterBar 		from "@/components/dashboard/elements/invoices/FilterBar.vue"
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
		computed: {
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
			RowCardLoader,
			Invoice,
			FilterBar,
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