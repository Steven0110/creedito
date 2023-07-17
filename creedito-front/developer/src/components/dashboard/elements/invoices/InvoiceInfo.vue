<template lang="pug">
	v-row.invoice-info
		v-col(cols="12", md="4", xl="3")
			v-card.general-card
				v-card-title.justify-center
					|Datos generales
				v-card-text
					.info-key
						|Fecha de emisión:
					.info-value
						|{{ invoice.fechaEmision | moment("MMMM D, h:mm:ss a") }}
					.info-key
						|Forma de pago:
					.info-value
						|{{ invoice.formaPago }}
					.info-key
						|Método de pago:
					.info-value
						|{{ invoice.metodoPago }}
					.info-key
						|Moneda:
					.info-value
						|{{ invoice.moneda }}
					.info-key
						|Subtotal:
					.info-value
						|{{ invoice.subtotal | currency }}
					.info-key
						|Total:
					.info-value
						|{{ invoice.total | currency }}
		v-col(cols="12", md="4", xl="3")
			v-card.emisor-card
				v-card-title.justify-center
					|Emisor
				v-card-text
					.info-key
						|RFC:
					.info-value
						|{{ invoice.emisor.rfc }}
					.info-key
						|Razón social:
					.info-value
						|{{ invoice.emisor.nombre }}
					.info-key
						|Régimen:
					.info-value
						|{{ invoice.emisor.regimen }}
		v-col(cols="12", md="4", xl="3")
			v-card.receptor-card
				v-card-title.justify-center
					|Receptor
				v-card-text
					.info-key
						|RFC:
					.info-value
						|{{ invoice.receptor.rfc }}
					.info-key
						|Razón social:
					.info-value
						|{{ invoice.receptor.nombre }}
					.info-key
						|USO CFDI:
					.info-value
						|{{ invoice.receptor.usoCFDI }}
		v-col(cols="12", md="4", xl="3")
			v-card.receptor-card
				v-card-title.justify-center
					|Impuestos
				v-card-text
					.info-key
						|Trasladados:
					.info-value
						|{{ invoice.impuestos.trasladados.impuesto | currency }}
					.info-key
						|Retenciones:
					.info-value
						|$0
		v-col(cols="12")
			v-card.conceptos-card
				v-card-title.justify-center
					|Conceptos
				v-card-text
					v-row(v-for="concepto in invoice.conceptos", :key="concepto.descripcion")
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
		v-col(cols="12", offset-md="3", md="6", offset-lg="4", lg="4", v-if="invoice.status != 'revision'")
			v-card.time-card
				v-card-title.justify-center
					|Plazo de financiamiento
				v-card-text
					.time-value
						|{{ input.months }} meses
					v-slider(v-model="input.months", min="3", max="48", step="3", color="primary", hide-details)

		v-col(cols="12", v-show="invoice.status == 'waiting'")
			v-row
				v-spacer
				v-btn(color="primary", @click="warn")
					|Enviar a revisión
				v-spacer


		v-dialog(content-class="recipient-email-dialog", max-width="600", v-model="status.show.email", persistent)
			v-card
				v-card-title
					|Correo electrónico del receptor
				v-card-text
					p
						|Se enviará un correo electrónico al receptor de la factura con un enlace para que dé su consentimiento de que la factura será objeto de fondeo en Creedito.
					v-form(ref="form", onSubmit="return false;")
						v-text-field(
							label="Correo electrónico del receptor de la factura",
							name="Correo del receptor",
							:rules="form.validations.email",
							v-model="input.email")
				v-card-actions
					v-spacer
					v-btn(color="secondary", text, @click="status.show.email = false")
						|Cancelar
					v-btn(color="primary", @click="review", :loading="status.loading")
						|Confirmar

		v-col(cols="12", v-show="invoice.status == 'revision'")
			v-alert(type="info")
				|Actualmente la factura está siendo procesada y validada. Te notificaremos cuando este proceso haya terminado.

</template>

<script>
	export default {
		props: ["invoice"],
		data() {
			return {
				status: {
					show: {
						email: false
					},
					loading: false
				},
				input: {
					email: "",
					months: 3
				},
				form: {
					validations: {
						email: [
				        	v => !!v || 'El email es requerido',
				        	v => /.+@.+\..+/.test(v) || 'El email no es válido',
				      	],
					}
				}
			}
		},
		methods: {
			warn: function() {
				this.$swal({
					title: "¿Estás seguro?",
					text: "Una vez enviada la factura no podrás revisarla de nuevo hasta que Creedito dictamine el estatus de la factura.",
					type: "warning",
					showCancelButton: true,
					reverseButtons: true,
					cancelButtonText: "Regresar",
					confirmButtonText: "Enviar factura"
				})
				.then(result => {
					if( result.value )
						this.status.show.email = true
				})
			},
			review: function() {
				if( this.$refs.form.validate()){
					this.status.loading = true
					let body = {
						type: this.invoice.reviewed ? "other" : "first",
						email: this.input.email,
						months: this.input.months
					}
					this.$invoices.post(`review/${this.invoice._id}`, body)
					.then(result => {
						this.$swal({
							title: "¡Listo!",
							text: "La factura ha sido subida exitosamente y se encuentra siendo procesada. Te notificaremos cuando el proceso haya terminado",
							type: "success",
							confirmButtonText: "Ok"
						})
						.then(r => {
							this.$router.push({ path: "/dashboard/facturas" })
						})
					})
					.catch(err => {
						this.$report( err, {swal: true} )
					})
					.finally(() => {
						this.status.loading = false
						this.status.show.email = false
					})
				}
			}
		},
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(2).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			}
		}
	}
</script>

<style lang="sass">
	.invoice-info
		.emisor-card,.receptor-card,.conceptos-card,.general-card,.time-card
			.v-card__title
				text-transform: uppercase
			.time-value
				text-align: center
				font-size: 2em
				font-family: Roboto
				font-weight: bold

		.info-key
			color: #3f9690
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