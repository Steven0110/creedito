<template lang="pug">
	.invoice-prepublisher
		.invoice-prepublisher-title
			|Información de la publicación
		.content
			invoice-card-loader(:show="status.loading")

			v-row(v-if="!status.loading")
				
				v-col.pb-0(cols="12")
					v-row.invoice-info-container
						v-col(cols="12", md="6", lg="4")
							v-card
								v-img(max-height="200", :src="input.image")
									v-btn(absolute, bottom, right, color="primary", @click="status.show.uploader = true")
										|Cambiar imagen
										v-icon
											|mdi-upload
								v-card-title
									|Datos generales
								v-card-text
									v-select(
										v-model="input.invoicingType",
										name="Invoicing type",
										label="Tipo de factoraje",
										dense,
										:items="$catalogs.invoicingTypes",
										outlined)
						v-col(cols="12", md="6", lg="4")
							v-card
								v-card-title.pb-0
									|Amortización
								v-card-text(v-if="$store.getters.currentInvoice._id")
									v-row
										v-col.pb-0(cols="12", md="6")
											field(
												name="Tasa mensual",
												:value="monthlyRate",
												type="percentage")
										v-col.pb-0(cols="12", md="6")
											field(
												name="Días de financiamiento",
												:value="financingDays")
										v-col.pb-0(cols="12", md="6")
											field(
												name="Capital",
												:value="capital",
												type="currency")
										v-col.pb-0(cols="12", md="6")
											field(
												name="Fecha de pago estipulada",
												:value="paymentDate",
												type="date")
										v-col.pb-0(cols="12", md="6")
											field(
												name="Interés ordinario",
												:value="ordinaryInterest",
												type="currency")
										//v-col.pb-0(cols="12", md="6")
											field(
												name="Interés real",
												:value="realInterest",
												type="currency")
								v-card-actions
									v-spacer

				v-col.pt-10(cols="12")
					v-row
						v-spacer
						v-btn(color="primary", @click="publish", x-large)
							|Publicar
							v-icon(color="white", right)
								|mdi-publish
						v-spacer

		v-snackbar(v-model="status.show.snackbar")
			|Factura actualizada correctamente
			template(v-slot:action="{ attrs }")
				v-btn(color="#ba7127", text, v-bind="attrs", @click="status.show.snackbar = false")
					|Cerrar

		image-uploader(
			v-if="status.show.uploader",
			:show="status.show.uploader",
			@close="status.show.uploader = false",
			@upload="changeImage")

</template>

<script>
	import InvoiceCardLoader 	from "@/components/tools/loader/InvoiceCardLoader.vue"
	import ImageUploader 		from "@/components/tools/files/ImageUploader.vue"
	import Field 				from "@/components/info/Field.vue"

	export default {
		data() {
			return {
				status: {
					loading: true,
					show: {
						snackbar: false,
						uploader: false
					}
				},
				input: {
					invoicingType: "",
					creditTarget: "Capital",
					image: "/assets/images/factura.png"
				},
				form: {
					vaidations: {
						required: []
					}
				}
			}
		},
		methods: {
			load: function() {
				this.status.loading = true
				let id = this.$route.params.id

				this.$invoices.get(`find/${id}`)
				.then( ({data}) => this.$wait(500, () => this.$store.commit("setCurrentInvoice", data.invoice)) )
				.catch( err => this.$report(err, {swal: true}) )
				.finally(() => this.status.loading = false)
			},
			update: function({key, value}) {
				this.invoice[ key ] = value
				this.status.show.snackbar = true
			},
			publish: function() {
				
				this.$swal({
					title: "¿Estás seguro que deseas publicar esta factura?",
					text: "Una vez publicada podrá ser fondeada y no podrás modificar ningún dato.",
					type: "warning",
					confirmButtonText: "Sí, enviar.",
					cancelButtonText: "No, regresar.",
					showLoaderOnConfirm: true,
					showCancelButton: true,
					reverseButtons: true,
					preConfirm: () => {
						const body = this.input
						const resource = `publish/${this.$route.params.id}`
						return this.$invoices.post( resource, body )
					}
				})
				.then(result => {
					if(!result.dismiss){
						this.$swal({
							title: `La factura ha sido publicada exitosamente.`,
							text: "Ahora podrá ser fondeada por inversionistas.",
							type: "success",
							showConfirmButton: false,
							timer: 3000,
							onClose: () => {
								this.$router.push({path: "/dashboard/facturas"})
							}
						})
					}
				})
				.catch(err => this.$report( err, {swal: true }))
			},
			changeImage: function( key ) {
				this.status.show.uploader = false
				this.input.image = `${ this.S3_BASE }/${ key }`
			},
			back: function() {
				this.$router.push({ path: "/dashboard/facturas"})
			}
		},
		computed: {
			capital: function() {
				return 	(this.$store.getters.currentInvoice.goal.amount || this.$store.getters.currentInvoice.total) *
						(100 - (this.$store.getters.currentInvoice.discount || 0)) /
						100
			},
			/*capital: function() {
				return 	(this.$store.getters.currentInvoice.goal.amount || this.$store.getters.currentInvoice.total) *
						(this.$store.getters.currentInvoice.capacity || 100) /
						100
			},*/
			ordinaryInterest: function() {
				return this.capital * this.financingDays * (this.$store.getters.currentInvoice.discount / 100) / 360
			},
			realInterest: function() {
				return this.capital * this.financingDays * (this.$store.getters.currentInvoice.discount / 100) / 365
			},
			paymentDate: function() {
				return this.$moment(new Date()).add( this.financingDays, "days")
			},
			financingDays: function() {
				return this.$store.getters.currentInvoice.goal.months * 30
			},
			monthlyRate: function() {
				return this.$store.getters.currentInvoice.discount / 12
			}
		},
		activated(){
			this.load()
		},
		components: {
			InvoiceCardLoader,
			Field,
			ImageUploader
		}
	}
</script>

<style lang="sass">
	.invoice-prepublisher
		.invoice-prepublisher-title
			font-size: 2em
			font-weight: bold
			font-family: Roboto
			text-align: center
			text-transform: uppercase
		.content
			.invoice-info-container
				.v-card
					.v-card__title
						text-transform: uppercase

	@media only screen and (min-width: 1905px)
		.invoice-prepublisher
	@media only screen and (max-width: 1904px)
		.invoice-prepublisher
	@media only screen and (max-width: 600px)
		.invoice-prepublisher
</style>