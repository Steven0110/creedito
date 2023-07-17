<template lang="pug">
	v-dialog(:value="value", content-class="approve-invoice-dialog", max-width="800", persistent)
		v-card
			v-card-title
				|Aprobar factura
			v-card-text
				p
					|Por favor verifique y modifique la información siguiente:
				v-row
					v-col(cols="12", md="6")
						.subtitle-1
							strong
								|Riesgos:
						.risks-container
							v-checkbox(
								v-model="input.risks",
								label="Riesgo 1",
								hide-details,
								value="Riesgo 1")
							v-checkbox(
								v-model="input.risks",
								label="Riesgo 2",
								hide-details,
								value="Riesgo 2")
							v-checkbox(
								v-model="input.risks",
								label="Riesgo 3",
								hide-details,
								value="Riesgo 3")
							v-checkbox(
								v-model="input.risks",
								label="Riesgo 4",
								hide-details,
								value="Riesgo 4")

					v-col(cols="12", md="6")
						v-form(ref="form")
							v-row
								v-col(cols="8", offset-md="2")
									risk-level(risk="medium")
								v-col.pb-0(cols="4", offset-md="4")
									v-text-field(
										append-icon="mdi-percent-outline",
										color="primary",
										type="number",
										step="1",
										hide-details,
										:rules="form.validations.required",
										label="Descuento",
										outlined,
										v-model="input.discount")
								v-col.pt-0(cols="12")
									medium-field.text-center(:value="$store.getters.currentInvoice.total", text="Total original:")
									huge-field.text-center(:value="discountTotal", text="Total publicado:")
			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="$emit('input', false)")
					|Cancelar
				v-btn(color="primary", @click="approve", :loading="status.loading")
					|Aprobar factura
</template>

<script>
	import RiskLevel 		from "@/components/dashboard/elements/invoices/kpi/RiskLevel.vue"
	import SingleMetric 	from "@/components/dashboard/elements/invoices/kpi/SingleMetric.vue"
	import SimpleField 		from "@/components/dashboard/elements/invoices/kpi/SimpleField.vue"
	import MediumField 		from "@/components/dashboard/elements/invoices/kpi/MediumField.vue"
	import HugeField 		from "@/components/dashboard/elements/invoices/kpi/HugeField.vue"

	export default {
		props: ["invoice", "value"],
		data() {
			return {
				notes: "",
				status: {
					loading: false
				},
				input: {
					discount: 0,
					risks: []
				},
				form: {
					validations: {
				      	required: [
				        	v => !!v || 'El campo es requerido',
				      	]
					}
				}
			}
		},
		computed: {
			discountTotal: function() {
				return Number(parseFloat(this.$store.getters.currentInvoice.total - (this.$store.getters.currentInvoice.total * this.input.discount / 100)).toFixed(2))
			}
		},
		methods: {
			approve: function() {
				this.$swal({
					title: "¿Deseas aprobar esta factura?",
					text: "Una vez aprobada será publicada y podrá ser fondeada por inversionistas. Esta acción no se puede revertir",
					type: "warning",
					cancelButtonText: "No, regresar",
					showCancelButton: true,
					reverseButtons: true,
					confirmButtonText: "Aprobar"
				})	
				.then(result => {
					if( result.value ){
						this.status.loading = true

						let body = {
							discount: 	Number(this.input.discount),
							risks: 		this.input.risks || [],
						}

						this.$invoices.post(`publish/${this.$store.getters.currentInvoice._id}`, body)
						.then( ({data}) => {
							this.$router.push({path: "/dashboard/facturas?message=Factura aprobada exitosamente"})
						})
						.catch( err => this.$report(err, {swal: true}) )
						.finally( () => this.status.loading = false )
					}
				})
			}
		},
		components: {
			RiskLevel,
			SingleMetric,
			SimpleField,
			MediumField,
			HugeField,
		}
	}
</script>

<style lang="sass">
	
</style>