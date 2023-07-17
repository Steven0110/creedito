<template lang="pug">
	v-dialog(content-class="company-edit-dialog", :value="value", @input="toggle", max-width="700", persistent)
		v-card
			v-card-title
				|Editar empresa
			v-card-text
				v-form(ref="form")
					v-row
						v-col(col="12", md="4")
							v-text-field(
								v-model="input.name",
								:rules="form.validations.required",
								ref="name",
								label="Razón social")
						v-col(col="6", md="3")
							v-text-field(
								:value="value.rfc",
								:rules="form.validations.required",
								ref="rfc",
								label="RFC")
						v-col(col="6", md="3")
							v-select(
								:value="value.type",
								:items="giros",
								:rules="form.validations.required",
								ref="type",
								label="Giro")
						v-col(col="12", md="2")
							v-select(
								v-model="input.rate",
								:rules="form.validations.required",
								:items="rates",
								ref="rate",
								label="Tipo")
			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="close")
					|Cancelar
				v-btn(color="primary", :loading="status.loading", @click="update")
					|Actualizar
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
			update: function() {
				if(this.$refs.form.validate()){
					this.status.loading = true

					let body = {
						name: this.input.name,
						rfc: this.input.rfc.toUpperCase(),
						type: this.input.type,
						rate: this.input.rate,
					}

					this.$invoices.put(`companies/${this.value._id}`, body)
					.then(result => {
						body._id = this.value._id
						this.$emit("update", body)
						this.$emit("input", false)
					})
					.catch(err => this.$report( err, {swal: true} ))
					.finally(() => this.status.loading = false)
				}
			},
			toggle: function(value) {
				if( value )
					this.input = this.value
			},
			close: function() {
				this.$emit("input", false)
			}
		}
	}
</script>

<style lang="sass">
</style>