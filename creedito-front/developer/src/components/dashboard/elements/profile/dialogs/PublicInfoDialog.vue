<template lang="pug">
	v-dialog(content-class="public-info-dialog", persistent, max-width="600", :value="show")
		v-card
			v-card-title.mb-4
				|Actualizar información pública
			v-card-text
				v-form(ref="form", onSubmit="return false;")
					v-row
						v-col.pa-0(cols="12")
							v-text-field(
								v-model="c.taxName",
								color="primary",
								hide-details,
								outlined,
								dense,
								label="Razón social alternativa")
						v-col.pb-0(cols="12", md="6")
							v-menu(ref="menu", v-model="menu", :close-on-content-click="false", transition="scale-transition", offset-y, min-width="auto")
								template(v-slot:activator="{ on, attrs }")
									v-text-field(v-model="c.constitutionDate", label="Fecha de constitución", prepend-icon="mdi-calendar", readonly, v-bind="attrs", v-on="on", hide-details)
								v-date-picker(
									v-model="c.constitutionDate",
									min="1950-01-01",
									@change="setDate",
									locale="es",
									label="Fecha de constitución")
						v-col.pb-0(cols="12", md="6")
							v-text-field(
								v-model="c.taxAddress",
								color="primary",
								outlined,
								dense,
								hide-details,
								label="Dirección fiscal")
						v-col.pb-0(cols="12")
							v-text-field(
								v-model="c.websiteURL",
								color="primary",
								outlined,
								hide-details,
								dense,
								label="Sitio web (URL)")
						v-col.pb-0(cols="12", md="6")
							v-text-field(
								v-model="c.annualIncome",
								color="primary",
								type="number",
								step="1",
								outlined,
								hide-details,
								dense,
								label="Ingreso anual")
						v-col.pb-0(cols="12", md="6")
							v-text-field(
								v-model="c.equity",
								type="number",
								step="1",
								color="primary",
								outlined,
								hide-details,
								dense,
								label="Capital contable")

			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="save", :loading="status.saving")
					|Guardar
</template>

<script>
	export default {
		props: ["show", "company"],
		data() {
			return {
				status: {
					saving: false
				},
				c: {},
				menu: false
			}
		},
		methods: {
			save: function() {
				this.status.saving = true

				if(this.c.constitutionDate)
					this.c.constitutionDate = new Date( this.c.constitutionDate ).toISOString().substr(0, 10)

				this.c.equity = Number(this.c.equity || 0)
				this.c.annualIncome = Number(this.c.annualIncome || 0)

				this.$security.post("update-info", {company: this.c})
				.then( result => {
					this.$swal("¡Listo!", "Información actualizada correctamente", "success")
					this.$emit("close")
					this.$emit("update", this.c)
				})
				.catch( err => this.$report(err, {swal: true}))
				.finally( () => this.status.saving = false)
			},
			setDate: function( date ) {
				this.$refs.menu.save( date )
			}
		},
		mounted(){
			this.c = this.$clone(this.$store.getters.user.company)

			if( this.c.constitutionDate )
				this.c.constitutionDate = new Date( this.c.constitutionDate ).toISOString().substr(0, 10)
			else
				this.c.constitutionDate = new Date().toISOString().substr(0, 10)

		},
	}
</script>

<style lang="sass">
	.public-info-dialog
</style>