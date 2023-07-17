<template lang="pug">
	transition(name="fade")
		v-row.invoice-info(v-if="$store.getters.currentInvoice.total")
			v-col(cols="12", md="4", xl="3", v-if="!readonly")
				v-card.rules-card
					v-card-title.justify-center
						|Reglas de negocio
					v-card-text
						rule(name="¿Vigencia de 72 horas?", :ok="isValid")
						rule(name="¿Coincide RFC emisor con RFC de usuario?", :ok="matchesEmisor")
						rule(name="¿Tiene historial previo de facturas?", :ok="$store.getters.currentInvoice.relatedInvoices && $store.getters.currentInvoice.relatedInvoices.length > 0")
						rule(name="¿El remitente es una AAA?", :ok="isAAA")

			v-col(cols="12", md="4", xl="3")
				v-card.general-card
					v-card-title.justify-center
						|Datos generales
					v-card-text
						.info-key
							|Fecha de emisión:
						.info-value
							|{{ $store.getters.currentInvoice.fechaEmision | moment("MMMM D, h:mm:ss a") }}
						.info-key
							|Forma de pago:
						.info-value
							|{{ $store.getters.currentInvoice.formaPago }}
						.info-key
							|Método de pago:
						.info-value
							|{{ $store.getters.currentInvoice.metodoPago }}
						.info-key
							|Moneda:
						.info-value
							|{{ $store.getters.currentInvoice.moneda }}
						.info-key
							|Subtotal:
						.info-value
							|{{ $store.getters.currentInvoice.subtotal | currency }}
						.info-key
							|Total:
						.info-value
							|{{ $store.getters.currentInvoice.total | currency }}

			v-col(cols="12", md="4", xl="3")
				v-card.general-card
					v-card-title.justify-center
						|Validaciones con el SAT
					v-card-text
						.info-key
							|Respuesta SAT:
						.info-value
							|{{ $store.getters.currentInvoice.validations.respuestaSAT }}
						.info-key
							|Validez en SAT:
						.info-value
							|{{ $store.getters.currentInvoice.validations.validezSAT }}
						.info-key
							|Respuesta Timbox:
						.info-value
							|{{ $store.getters.currentInvoice.validations.respuestaTimbox }}
						.info-key
							|Adicionales:
						.info-value
							|{{ $store.getters.currentInvoice.validations.lco }}
			v-col(cols="12", md="4", xl="3")
				v-card.emisor-card
					v-card-title.justify-center
						|Emisor
					v-card-text
						.info-key
							|RFC:
						.info-value
							|{{ $store.getters.currentInvoice.emisor.rfc }}
						.info-key
							|Razón social:
						.info-value
							|{{ $store.getters.currentInvoice.emisor.nombre }}
						.info-key
							|Régimen:
						.info-value
							|{{ $store.getters.currentInvoice.emisor.regimen }}
			v-col(cols="12", md="4", xl="3")
				v-card.receptor-card
					v-card-title.justify-center
						|Receptor
					v-card-text
						.info-key
							|RFC:
						.info-value
							|{{ $store.getters.currentInvoice.receptor.rfc }}
						.info-key
							|Razón social:
						.info-value
							|{{ $store.getters.currentInvoice.receptor.nombre }}
						.info-key
							|USO CFDI:
						.info-value
							|{{ $store.getters.currentInvoice.receptor.usoCFDI }}
			v-col(cols="12", md="4", xl="3")
				v-card.receptor-card
					v-card-title.justify-center
						|Impuestos
					v-card-text
						.info-key
							|Trasladados:
						.info-value
							|{{ $store.getters.currentInvoice.impuestos.trasladados.impuesto | currency }}
						.info-key
							|Retenciones:
						.info-value
							|$0
			v-col(cols="12")
				v-card.conceptos-card
					v-card-title.justify-center
						|Conceptos
					v-card-text
						v-row(v-for="concepto in $store.getters.currentInvoice.conceptos", :key="concepto.descripcion")
							v-col(cols="12", md="2")
								.info-key
									|Cantidad
								.info-value
									|{{ concepto.cantidad }}
							v-col(cols="12", md="2")
								.info-key
									|Unidad
								.info-value
									|{{ concepto.unidad }}
							v-col(cols="12", md="4")
								.info-key
									|Descripción
								.info-value
									|{{ concepto.descripcion }}
							v-col(cols="12", md="2")
								.info-key
									|P.U.
								.info-value
									|{{ concepto.valorUnitario | currency }}
							v-col(cols="12", md="2")
								.info-key
									|Importe
								.info-value
									|{{ concepto.importe | currency }}
			v-col(cols="12", offset-md="3", md="6", offset-lg="2", lg="4")
				v-card.time-card
					v-card-title.justify-center
						|Plazo de financiamiento
					v-card-text
						.time-value
							|{{ $store.getters.currentInvoice.goal.months }} meses
						v-slider(:value="$store.getters.currentInvoice.goal.months", min="3", max="48", step="3", color="primary", hide-details, readonly)


			v-col(cols="12", v-if="$store.getters.currentInvoice.relatedInvoices && $store.getters.currentInvoice.relatedInvoices.length > 0")
				simple-invoices-table(:invoices="$store.getters.currentInvoice.relatedInvoices")

			v-col(cols="12", v-if="!readonly && $store.getters.currentInvoice.status == 'revision'")
				v-row
					v-spacer
					v-btn(color="primary", @click="state.approveInvoice = true", :loading="status.loadingApproval")
						|Aprobar factura
						v-icon(right)
							|mdi-check
					//v-btn.ml-2(color="orange darken-2", dark)
						|Solicitar documentos
						v-icon(right)
							|mdi-file
					//v-btn.ml-2(color="red darken-4", dark, @click="state.rejectInvoice = invoice")
						|Rechazar factura
						v-icon(right)
							|mdi-close
					v-spacer

			reject(:invoice="state.rejectInvoice", @close="state.rejectInvoice = false", @rejected="rejected")
			approve(v-model="state.approveInvoice")

			v-snackbar(v-model="state.snackbar", color="#176580", dark, bottom)
				template(v-slot:action="{ attrs }")
					v-btn(v-bind="attrs", text)
						v-icon(color="white")
							|mdi-check
				|Cambio realizado exitosamente
</template>

<script>
	import Rule 				from "@/components/dashboard/elements/invoices/kpi/Rule.vue"
	import Reject 				from "@/components/dashboard/elements/invoices/dialogs/Reject.vue"
	import Approve 				from "@/components/dashboard/elements/invoices/dialogs/Approve.vue"
	import SimpleInvoicesTable 	from "@/components/dashboard/elements/invoices/SimpleInvoicesTable.vue"

	export default {
		props: [ "invoice", "readonly"],
		data() {
			return {
				state: {
					rejectInvoice: false,
					approveInvoice: false,
					snackbar: false
				},
				status: {
					loadingApproval: false
				},
				input: {
					risks: []
				}
			}
		},
		methods: {
			rejected: function(invoice) {
				this.state.snackbar = true
				this.state.rejectInvoice = false
				this.push({path: "/dashboard/facturas"})
			},
		},
		computed: {
			isValid: function() {
				if( this.$store.getters.currentInvoice.fechaEmision ){
					let diff = new Date() - new Date(this.$store.getters.currentInvoice.fechaEmision)
					let diffHours = diff / 36e5

					return diffHours > 72
				}else
					return false
			},
			matchesEmisor: function() {
				return this.$store.getters.currentInvoice.developer.info && this.$store.getters.currentInvoice.developer.info.rfc && this.$store.getters.currentInvoice.developer.info.rfc == this.$store.getters.currentInvoice.emisor.rfc

			},
			isAAA: function() {
				let companies = this.$store.getters.companies
				for(let company of companies)
					if(company.rfc === this.$store.getters.currentInvoice.receptor.rfc && company.rate == "AAA")
						return true

				return false
			}
		},
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(2).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			}
		},
		components: {
			Rule,
			Reject,
			Approve,
			SimpleInvoicesTable,
		}
	}
</script>

<style lang="sass">
	.invoice-info
		.emisor-card,.receptor-card,.conceptos-card,.general-card,.rules-card
			.v-card__title
				text-transform: uppercase

		.info-key
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 700
			font-size: 0.9rem
			letter-spacing: 1px
		.info-value
			font-family: Roboto
			color: #666
			font-size: 1rem
	
</style>