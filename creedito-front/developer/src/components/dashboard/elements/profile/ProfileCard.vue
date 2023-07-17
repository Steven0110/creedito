<template lang="pug">
	.profile-card-container
		v-card.profile-card
			v-img.align-end(:src="$store.getters.user.profilePicture || '/assets/icons/avatar.svg'", max-height="400", min-height="300")
				v-card-title
					v-spacer
					v-btn(color="primary", small, @click="status.show.camera = true", v-show="!$store.getters.user.profilePicture")
						|Tomar foto
						v-icon(right)
							|mdi-camera
			v-card-text
				//Nombre
				.profile-name
					|Nombre
				.profile-value
					|{{ $store.getters.user.name }}

				//Email
				.profile-name
					|Correo electrónico
				.profile-value
					|{{ $store.getters.user.username }}

				//Email
				.profile-name
					|Tipo de persona:
				.profile-value
					|{{ $store.getters.user.type == 'moral' ? 'Moral' : 'Física' }}

				//RFC
				.profile-name
					|RFC:
				.profile-value
					|{{ $store.getters.user.rfc || 'Sin definir' }}
			v-card-actions
				v-spacer
				v-btn(color="primary", text, @click="showEditInfo")
					|Editar
					v-icon(color="primary", right)
						|mdi-pencil-outline



		v-dialog(content-class="update-info-dialog", v-model="state.infoDialog", max-width="600", eager, persistent)
			v-card
				v-card-title
					|Actualizar información
				v-card-text
					v-form(ref="informationForm")
						v-text-field(
							type="text"
							v-model="info.name",
							label="Nombre",
							append-icon="mdi-account",
							background-color="transparent",
							color="primary",
							dense,
							outlined)

						v-text-field(
							type="text"
							v-model="info.rfc",
							label="RFC (con homoclave)",
							append-icon="mdi-format-text",
							background-color="transparent",
							color="primary",
							dense,
							outlined)

						//.text-center
							|Tipo de persona
						.type-subtitle.d-block.d-md-none
							|Tipo de persona
						v-radio-group.mt-0(v-model="info.type", @change="showTypeAlert", :row="radioRow", :column="!radioRow")
							v-spacer
							v-radio(label="Persona Física", value="fisica")
							v-radio(label="Persona Moral", value="moral")
							v-spacer

					v-alert(color="warning", transition="scale-transition", v-show="alerts.warning", :icon="alertIcon")
						|{{ alerts.warning }}

				v-card-actions
					v-spacer
					v-btn(text, color="secondary", @click="state.infoDialog = false")
						|Regresar
					v-btn(color="primary", @click="updateInfo", :loading="status.loading")
						|Actualizar

		camera(v-if="status.show.camera", :show="status.show.camera", @close="status.show.camera = false")

		v-snackbar(v-model="state.infoSnack", color="primary", dark, bottom)
			template(v-slot:action="{ attrs }")
				v-btn(v-bind="attrs", text)
					v-icon(color="white")
						|mdi-check
			|{{ alerts.info }}
</template>

<script>
	import Camera 	from "@/components/dashboard/elements/profile/Camera.vue"

	export default {
		data() {
			return {
				state: {
					infoDialog: false,
					infoSnack: false
				},
				status: {
					loading: false,
					show: {
						camera: false
					}
				},
				alerts: {
					warning: "",
					info: ""
				},
				info: {
					name: "",
					type: "fisica",
					rfc: ""
				}
			}
		},
		computed: {
			alertIcon: function() {
				if( this.$vuetify.breakpoint.smAndDown ){
					return false
				}else
					return "mdi-alert"
			},
			radioRow: function() {
				if( this.$vuetify.breakpoint.xsOnly )
					return false
				else
					return true
			}
		},
		methods: {
			updateInfo: function() {
				this.alerts.warning = ""
				this.alerts.info = ""
				if( this.validateInfo() ){
					this.status.loading = true

					const resource = "update-info"
					let body = {
						name: this.info.name,
						type: this.info.type,
						rfc: this.info.rfc
					}
					
					this.$security.post( resource, body )
					.then( ({ data }) => {
						console.log( data )
						if( data.message == "ok" ){
							this.alerts.info = "Información modificada exitosamente"
							this.state.infoDialog = false
							this.state.infoSnack = true

							/*	Actualiza el usuario en UI */
							this.$store.commit("setUserData", {key: "name", value: body.name})
							this.$store.commit("setUserData", {key: "type", value: body.type})
							this.$store.commit("setUserData", {key: "rfc", value: body.rfc})
						}else{
							this.alerts.warning = ""
							this.$sentry.captureException( new Error(data) )
						}
					})
					.catch(err => {
						console.error( err )
						if( err.response.status == 406 ){
							this.alerts.info = "Información modificada exitosamente"
							this.state.infoSnack = true
						}else{
							this.$sentry.captureException( new Error(err) )
							this.$swal("Error", "Por favor vuelva a intentar la óperación solicitada", "warning")
						}
					})
					.finally(() => this.status.loading = false)

				}
			},
			showTypeAlert: function() {
				this.alerts.warning = "El modificar el tipo de persona de tu cuenta también modificará la información y documentos que serán requeridos para poder invertir. Tu operación actual se podría ver afectada al modificar el tipo de persona."
			},
			showEditInfo: function() {
				this.state.infoDialog = true
				this.setInfo()
			},
			setInfo: function() {
				this.info.name = this.$store.getters.user.name
				this.info.type = this.$store.getters.user.type || "fisica"
				this.info.rfc = this.$store.getters.user.rfc
			},
			validateInfo: function() {
				return this.$refs.informationForm.validate()
			}
		},
		components: {
			Camera
		}
	}
</script>

<style lang="sass">
	.profile-card-container
		.profile-card
			.profile-name
				color: #3f9690
				margin-top: 10px
				font-family: Raleway
				text-transform: uppercase
				font-weight: 600
				font-size: 0.7rem
				letter-spacing: 1px
			.profile-value
				font-family: Raleway
				color: #666
				font-size: 1rem
		.v-snack__content
			&>div
				width: 100%
	.update-info-dialog
		.type-subtitle
			text-align: center
			color: #3f9690
			font-weight: 600
	@media only screen and (min-width: 1904px)
		.profile-card
	@media only screen and (max-width: 1903px)
		.profile-card
	@media only screen and (max-width: 1264px)
		.profile-card
	@media only screen and (max-width: 960px)
		.profile-card
</style>