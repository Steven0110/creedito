<template lang="pug">
	.invoices-subpanel
		.subpanel-title.d-none.d-md-block
			|Facturas
		.subpanel-description
			|En esta sección podrás consultar y administrar las facturas que se hayan subido a la plataforma.
		.content
			//filter-bar(v-model="filters", @search="filter", @filter="filter", @sort="filter")

			v-tabs(v-model="tab", color="secondary", fixed-tabs)
				v-tab(key="waiting-tab")
					|Pendientes por revisar
				v-tab(key="pending-tab")
					|En espera de documentos
				v-tab(key="published-tab")
					|Publicadas
				v-tab(key="rejected-tab")
					|Rechazadas

			v-tabs-items(v-model="tab", touchless)
				// Pendientes por revisar
				v-tab-item(key="revision-tab")
					invoices-table(:invoices="revisionInvoices", :headers="headers", :loading="status.loading")

				// En espera de documentos
				v-tab-item(key="waiting-tab")
					invoices-table(:invoices="waitingInvoices", :headers="headers", :loading="status.loading")
				
				// Publicadas
				v-tab-item(key="published-tab")
					invoices-table(:invoices="publishedInvoices", :headers="headers", :loading="status.loading")
				
				// Rejected
				v-tab-item(key="rejected-tab")
					invoices-table(:invoices="rejectedInvoices", :headers="headers", :loading="status.loading")

			v-snackbar(v-model="state.snackbar", color="primary", dark, bottom)
				template(v-slot:action="{ attrs }")
					v-btn(v-bind="attrs", text)
						v-icon(color="white")
							|mdi-check
				|{{ message }}
					

</template>

<script>
	import RowCardLoader 	from "@/components/tools/loader/RowCardLoader.vue"
	import InvoicesTable 	from "@/components/dashboard/elements/invoices/InvoicesTable.vue"

	export default {
		data() {
			return {
				status: {
					loading: false
				},
				state: {
					snackbar: false
				},
				filters: {
					goal: [100000, 10000000],
					sort: "none"
				},
				message: "",
				page: 1,
				invoices: [],
				headers: [
					{ text: "Solicitante", value: "developer.name", align: "start" },
					{ text: "Emisor", value: "emisor.rfc"},
					{ text: "Receptor", value: "receptor.rfc"},
					{ text: "Fecha de subida", value: "createdAt"},
					{ text: "Estatus", value: "status", sortable: false},
					{ text: "Total", value: "total"},
					{ text: "Acciones", value: "_id", sortable: false},
				],
				tab: null
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
					.then(result => this.invoices = result.data.invoices)
					.catch(err => {
						this.$swal("Error", "Hubo un error al consultar las facturas disponibles, por favor vuelva a intentarlo.", "warning")
						this.$report( err )
					})
					.finally(() => this.status.loading = false)
				}
			},
		},
		computed: {
			waitingInvoices: function() {
				return this.invoices.filter(i => i.status == "waiting")
			},
			revisionInvoices: function() {
				return this.invoices.filter(i => i.status == "revision")
			},
			publishedInvoices: function() {
				return this.invoices.filter(i => i.status == "published")
			},
			rejectedInvoices: function() {
				return this.invoices.filter(i => i.status == "rejected")
			},
		},
		mounted(){
			this.findInvoices()

		},
		activated(){
			this.findInvoices()
			if(this.$route.query.message){
				this.message = this.$route.query.message
				this.state.snackbar = true
			}
		},
		components: {
			RowCardLoader,
			InvoicesTable
		}
	}
</script>

<style lang="sass">
	.invoices-subpanel
		.subpanel-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600
		.subpanel-description
			font-family: Roboto
			font-size: 18px
			color: #444
			margin-bottom: 15px
	@media only screen and (max-width: 600px)
		.invoices-subpanel
</style>