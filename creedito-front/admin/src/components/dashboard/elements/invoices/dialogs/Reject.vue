<template lang="pug">
	v-dialog(:value="invoice", content-class="reject-invoice-dialog", max-width="600", persistent)
		v-card
			v-card-title
				|Rechazar factura
			v-card-text
				p
					|Por favor escribe el motivo por el que la factura será rechazada:
				v-textarea(
					label="Motivo",
					:rules="form.validations.required",
					v-model="notes"
				)
			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="reject", :loading="status.loading")
					|Rechazar factura
</template>

<script>
	export default {
		props: ["invoice"],
		data() {
			return {
				notes: "",
				status: {
					loading: false
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
		methods: {
			reject: function() {
				this.$swal({
					title: "¿Deseas rechazar esta factura?",
					text: "Esta acción no se puede deshacer",
					type: "warning",
					showCancelButton: true,
					cancelButtonText: "No, cancelar",
					confirmButtonText: "Rechazar",
					reverseButtons: true,
					showLoaderOnConfirm: true,
					preConfirm: () => {
						let body = { notes: this.notes }

						return this.$invoices.post(`reject/${this.invoice._id}`, body)
						.then( ({data}) => {
							this.$emit("rejected", this.invoice)
						})
					}
				})
			}
		}
	}
</script>

<style lang="sass">
	
</style>