<template lang="pug">
	.invoice-publisher
		.invoice-title.d-none.d-md-block
			v-icon(left, color="black", large, @click="back")
				|mdi-chevron-left
			span
				|UUID: {{ invoice.uuid }}

		.content()
			invoice-card-loader(:show="status.loading")

			v-row(v-if="!status.loading && invoice.documents && invoice.documents > 0")
				
				v-col.pb-0(cols="12")
					invoice-publisher(:invoice="invoice")
				v-col.pt-10(cols="12")
					v-row
						v-spacer
						v-btn(color="primary", @click="review", x-large, disabled)
							|Enviar a revisión
							v-icon(color="white", right)
								|mdi-folder-search-outline
						v-spacer
			v-row(v-else)
				v-col(cols="12")
					invoice-info(:invoice="invoice", v-if="invoice.uuid")

		v-snackbar(v-model="status.show.snackbar")
			|Factura actualizada correctamente
			template(v-slot:action="{ attrs }")
				v-btn(color="#ba7127", text, v-bind="attrs", @click="status.show.snackbar = false")
					|Cerrar

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
	import Documents			from "@/components/dashboard/elements/invoices/sections/Documents.vue"
	import TitleEditor 			from "@/components/dashboard/elements/invoices/editors/TitleEditor.vue"
	import InvoicePublisher 	from "@/components/dashboard/elements/invoices/creators/InvoicePublisher.vue"
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
			addUpdate: function() {
				this.invoice.updates.unshift({
					"type": "development",
					"date": "2020-10-16T18:05:26.448Z",
					"title": "El proyecto inicia su desarrollo" + Math.random()
				})
			},
			update: function({key, value}) {
				this.invoice[ key ] = value
				this.status.show.snackbar = true
			},
			review: function() {
				
				this.$swal({
					title: "¿Estás seguro que deseas enviarla a revisión?",
					text: "Creedito revisará el proyecto y dictaminará si es publicado o no. Durante este proceso no podrás modificar nada de la factura.",
					type: "warning",
					confirmButtonText: "Sí, enviar.",
					cancelButtonText: "No, regresar.",
					showLoaderOnConfirm: true,
					showCancelButton: true,
					reverseButtons: true,
					preConfirm: () => {
						const resource = `invoice/${this.$route.params.id}/review`
						return this.$invoices.post( resource )
					}
				})
				.then(result => {
					if(!result.dismiss){
						this.$swal({
							title: `La factura ha sido enviada a revisión exitosamente.`,
							text: "Te notificaremos cuando el proceso haya sido terminado",
							type: "success",
							showConfirmButton: false,
							timer: 3000,
							onClose: () => {
								this.$router.push({path: "/dashboard/facturas"})
							}
						})
					}
				})
				.catch(err => {
					console.log( err )
					this.$swal("Algo salió mal", "Por favor vuelve a intentarlo", "error")
					this.$sentry.captureException( err )
				})
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
			Documents,
			Observations,
			TitleEditor,
			InvoicePublisher,
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