<template lang="pug">
	v-dialog(content-class="company-create-dialog", :value="value", max-width="800")
		v-card
			v-card-title
				|Agregar nueva empresa
			v-card-text
				v-form(ref="form")
					v-row
						v-col(col="12", md="4")
							v-text-field(
								v-model="input.name",
								:rules="form.validations.required",
								label="Razón social")
						v-col(col="6", md="3")
							v-text-field(
								v-model="input.rfc",
								:rules="form.validations.required",
								label="RFC")
						v-col(col="6", md="3")
							v-select(
								v-model="input.type",
								:items="giros",
								:rules="form.validations.required",
								label="Giro")
						v-col(col="12", md="2")
							v-select(
								v-model="input.rate",
								:rules="form.validations.required",
								:items="rates",
								label="Tipo")
			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="close")
					|Cancelar
				v-btn(color="primary", :loading="status.loading", @click="add")
					|Agregar
</template>

<script>
	export default {
		props: ["value"],
		data() {
			return {
				status: {
					loading: false
				},
				input: {
					name: "",
					rfc: "",
					type: "",
					rate: "",
				},
				form: {
					validations: {
				      	required: [
				        	v => !!v || 'Debes llenar este campo'
				      	]
					}
				},
				rates: ["A", "AA", "AAA"],
				giros: [
					"Educación",
					"Tecnología",
					"Comercio"
				]
			}
		},
		methods: {
			add: function() {
				if(this.$refs.form.validate()){
					this.status.loading = true

					let body = {
						name: this.input.name,
						rfc: this.input.rfc.toUpperCase(),
						type: this.input.type,
						rate: this.input.rate,
					}

					this.$invoices.post("companies", body)
					.then(result => {
						this.reset()
						this.$emit("add", result.data.company)
						this.$emit("input", false)
					})
					.catch(err => {
						if( err.response && err.response.status ){
							if( err.response.status == 406 ){
								this.$swal("Empresa ya registrada", "El RFC ingresado ya se encuentra en una empresa registrada.", "warning")
							}else
								this.$report( err, {swal: true} )
						}else
							this.$report( err )
					})
					.finally(() => this.status.loading = false)
				}
			},
			close: function() {
				this.$emit("input", false)
			},
			reset: function() {
				this.input.name = ""
				this.input.rfc = ""
				this.input.type = ""
			}
		}
	}
</script>

<style lang="sass">
	.company-create-dialog
</style>