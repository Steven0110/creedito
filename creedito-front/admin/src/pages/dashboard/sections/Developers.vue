<template lang="pug">
	.developers-subpanel
		.subpanel-title.d-none.d-md-block
			|Solicitantes
		.subpanel-description
			|En esta sección podrás consultar y administrar a los solicitantes de la plataforma
		.content
			v-data-table.developers-table(
				:headers="headers",
				:items="developers",
				loading-text="Cargando información...",
				no-result-text="Sin solicitantes registrados",
				:footer-props="{'items-per-page-text': 'Mostrar:'}"
				no-data-text="Sin solicitantes registrados",
				:loading="status.loading")

				template(v-slot:item.type="{ item }")
					v-chip(color="primary", v-if="item.type == 'fisica'", dark)
						span
							|{{ item.type | persona }}
					v-chip(color="primary", v-else, dark)
						span
							|{{ item.type | persona }}

				template(v-slot:item.active="{ item }")
					v-icon.mr-3(color="green darken-1", v-if="item.active", large)
						|mdi-check-circle
					v-icon.mr-3(color="red darken-1", v-else, large)
						|mdi-close-circle

				template(v-slot:item.verified="{ item }")
					v-icon.mr-3(color="green darken-1", v-if="item.verified", large)
						|mdi-check-circle
					v-icon.mr-3(color="red darken-1", v-else, large)
						|mdi-close-circle

				template(v-slot:item.pendingDocuments="{ item }")
					v-chip(color="secondary", v-if="item.pendingDocuments > 0", dark)
						|{{ item.pendingDocuments }}
					v-chip(color="green darken-1", v-else)
						|{{ item.pendingDocuments }}

				template(v-slot:item._id="{ item }")
					.actions
						v-tooltip(bottom, max-width="300px")
							template(v-slot:activator="{ on, attrs }")
								v-icon(color="primary", v-bind="attrs", v-on="on", @click="")
									|mdi-account
							span
								|Revisar cuenta de usuario
						v-tooltip(bottom, max-width="300px")
							template(v-slot:activator="{ on, attrs }")
								v-icon.ml-2(color="red darken-2", v-bind="attrs", v-on="on", @click="blockUser(item)")
									|mdi-lock
							span
								|Bloquear cuenta de usuario

		//create(v-model="status.show.create", @add="addCompany")
		//edit(v-model="updateEdit", @update="updateUser")

		v-snackbar(v-model="state.infoSnack", color="primary", dark, bottom)
			template(v-slot:action="{ attrs }")
				v-btn(v-bind="attrs", text)
					v-icon(color="white")
						|mdi-check
			|Cambio realizado exitosamente
</template>

<script>
	//import Create 	from "@/components/dashboard/elements/developers/Create.vue"
	//import Edit 	from "@/components/dashboard/elements/developers/Edit.vue"

	export default {
		data() {
			return {
				developers: [],
				headers: [
					{ text: "Nombre", value: "name" },
					{ text: "Correo", value: "username" },
					{ text: "Persona", value: "type", align: "center", },
					{ text: "¿Activo?", value: "active", align: "center" },
					{ text: "¿Verificado?", value: "verified", align: "center" },
					{ text: "Documentos pendientes", value: "pendingDocuments", align: "center" },
					{ text: "Acciones", value: "_id", align: "center", sortable: false },
				],
				status: {
					loading: false,
					show: {
					}
				},
				state: {
					infoSnack: false
				},
			}
		},
		methods: {
			init: function() {

				if( !this.status.loading ){
					this.status.loading = true

					this.$developers.get("get")
					.then(result => this.developers = result.data.developers)
					.catch(err => {
						this.$swal("Error", "Hubo un error al consultar a los usuarios, por favor vuelva a intentarlo.", "warning")
						this.$report( err )
					})
					.finally(() => this.status.loading = false)
				}

			},
			updateUser: function(user) {
				let index = this.developers.map(c => c._id).indexOf(user._id)
				this.developers[ index ] = user
				this.state.infoSnack = true
			},
			blockUser: function(user) {
				this.$swal({
					title: `¿Seguro que deseas bloquear al usuario ${user.name}?`,
					text: "Puedes deshacer esta acción posteriormente.",
					type: "warning",
					confirmButtonText: "Sí, bloquear",
					cancelButtonText: "Cancelar",
					showCancelButton: true,
					reverseButtons: true
				})
				.then(result => {
					if( result.value ){
						this.status.loading = true
						this.$invoices.get(`block/${user._id}`)
						.then(result => {
							this.$swal("¡Listo!", `El usuario ${user.name} ha sido bloqueado exitosamente`, "success")
						})
						.catch(err => {
							if( err.response && err.response.status ){
								if( err.response.status == 404 ){
									this.$swal("No encontrado", "El usuario no existe.", "error")
								}else
									this.$report( err, {swal: true} )
							}else
								this.$report( err, {swal: true} )
						})
						.finally(() => this.status.loading = false)
					}
				})
			}
		},
		mounted: function() {
			this.init()
		},
		activated: function() {
			this.init()
		},
		filters: {
			persona: value => value == "fisica" ? "Física" : "Moral"
		},
		components: {
			//Create,
			//Edit
		}
	}
</script>

<style lang="sass">
	.developers-subpanel
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
</style>