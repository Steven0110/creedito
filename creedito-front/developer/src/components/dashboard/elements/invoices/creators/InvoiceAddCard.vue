<template lang="pug">
	v-col(cols="12", md="6", lg="4", xl="3")
		v-card.invoice-card(height="320", @click="status.show.invoiceUploader = true")
			v-card-text
				.middle-container
					p.mb-1
						v-icon(x-large, color="#999")
							|mdi-plus
					p.mb-0.middle-container-text
						|Agregar factura
		//invoice-type-chooser(:show="status.show.invoiceCreator", @close="status.show.invoiceCreator = false")
		invoice-uploader(:show="status.show.invoiceUploader", @close="status.show.invoiceUploader = false")
</template>

<script>
	//import InvoiceTypeChooser 	from "@/components/dashboard/elements/invoices/creators/InvoiceTypeChooser.vue"
	import InvoiceUploader 	from "@/components/dashboard/elements/invoices/creators/InvoiceUploader.vue"
	export default {
		data() {
			return {
				status: {
					show: {
						invoiceUploader: false
					}
				}
			}
		},
		methods: {
		},
		components: {
			//InvoiceTypeChooser
			InvoiceUploader
		}
	}
</script>

<style lang="sass">
	.invoice-card
		.v-card__text
			display: table
			height: 100%
			.middle-container
				display: table-cell
				vertical-align: middle
				text-align: center
				.middle-container-text
					font-family: Raleway
					text-transform: uppercase
					font-size: 1.2rem
					font-weight: 600
					color: #999

</style>
