<template lang="pug">
	.companies-subpanel
		.subpanel-title.d-none.d-md-block
			|Catálogo de Empresas
		.subpanel-description
			|En esta sección podrás consultar y administrar el catálogo de empresas de la platafoma
		.content
			v-data-table.companies-table(
				:headers="headers",
				:items="companies",
				loading-text="Cargando facturas...",
				no-result-text="Sin empresas",
				:footer-props="{'items-per-page-text': 'Mostrar:'}"
				no-data-text="Sin empresas",
				:loading="status.loading")

				template(v-slot:item._id="{ item }")
					.actions
						v-tooltip(bottom, max-width="300px")
							template(v-slot:activator="{ on, attrs }")
								v-icon.ml-2(color="primary darken-2", v-bind="attrs", v-on="on", @click="view( item )")
									|mdi-eye
							span
								|Ver detalle

			v-dialog(content-class="company-viewer", :value="!!viewingCompany", persistent, max-width="800")
				v-card(v-if="viewingCompany.name")
					v-card-title
						|{{ viewingCompany.name }}
					v-card-text
						v-row
							v-col(cols="12", md="6")
								.field
									|Clave
								.value
									|{{ viewingCompany.clave }}

								.field
									|Tipo
								.value
									|{{ viewingCompany.type }}

								.field
									|Emisión
								.value
									|{{ viewingCompany.emision }}

								.field
									|Subemisión
								.value
									|{{ viewingCompany.subemision }}

								.field
									|Publicación
								.value
									|{{ viewingCompany.fechaPublicacion }}
								.field
									|Tipo Análisis
								.value
									|{{ viewingCompany.tipoAnalisis }}

									
							v-col(cols="12", md="6")

								.field
									|ISIN
								.value
									|{{ viewingCompany.isin }}

								.field
									|Perspectiva
								.value
									|{{ viewingCompany.perspectiva }}

								.field
									|Areas
								.value
									|{{ viewingCompany.areas.join(", ") }}

								.field
									|Subarea
								.value
									|{{ viewingCompany.subarea }}

								.field
									|TV
								.value
									|{{ viewingCompany.tv }}
					v-card-actions
						v-spacer
						v-btn(color="secondary", text, @click="viewingCompany = false")
							|Cerrar

</template>

<script>

	export default {
		data() {
			return {
				companies: [],
				headers: [
					{ text: "Nombre", value: "name" },
					{ text: "Clave", value: "clave" },
					{ text: "Tipo", value: "tipoAnalisis" },
					{ text: "Publicación", value: "fechaPublicacion", sortable: false },
					{ text: "Rating", value: "type" },
					{ text: "Acciones", value: "_id", sortable: false },
				],
				status: {
					loading: false,
				},
				viewingCompany: false
			}
		},
		methods: {
			init: function() {

				if( !this.status.loading ){
					this.status.loading = true

					this.$invoices.get("companies")
					.then(result => this.companies = result.data.companies)
					.catch(err => {
						this.$swal("Error", "Hubo un error al consultar las empresas disponibles, por favor vuelva a intentarlo.", "warning")
						this.$report( err )
					})
					.finally(() => this.status.loading = false)
				}

			},
			deleteCompany: function(company) {
				this.$swal({
					title: `¿Seguro que deseas borrar ${company.name}?`,
					text: "Esta acción no se puede deshacer",
					type: "warning",
					confirmButtonText: "Sí, borrar",
					cancelButtonText: "Cancelar",
					showCancelButton: true,
					reverseButtons: true
				})
				.then(result => {
					if( result.value ){
						this.status.loading = true
						this.$invoices.delete(`companies/${company._id}`)
						.then(result => {
							this.companies.splice(this.companies.map(c => c._id).indexOf(company._id), 1)
							this.$swal("¡Listo!", `La empresa ${company.name} ha sido borrada exitosamente`, "success")
						})
						.catch(err => {
							if( err.response && err.response.status ){
								if( err.response.status == 404 ){
									this.$swal("No encontrada", "La empresa no existe.", "error")
								}else
									this.$report( err, {swal: true} )
							}else
								this.$report( err, {swal: true} )
						})
						.finally(() => this.status.loading = false)
					}
				})
			},
			view: function( company ){
				console.log( company )
				this.viewingCompany = company
			}
		},
		mounted: function() {
			this.init()
		},
		activated: function() {
			this.init()
		},
		
	}
</script>

<style lang="sass">
	.companies-subpanel
		.subpanel-title
			text-transform: uppercase
			font-family: Roboto
			letter-spacing: 1px
			color: black
			font-size: 25px
			font-weight: 600
		.subpanel-description
			font-family: Roboto
			font-size: 18px
			color: #444
			margin-bottom: 15px
	.company-viewer
		.field
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 0.7rem
			letter-spacing: 1px
		.value
			font-family: Roboto
			color: #666
			font-size: 1rem
</style>