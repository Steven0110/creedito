<template lang="pug">
	.security-info
		v-row
			v-spacer
			v-btn(color="primary", @click="state.passwordDialog = true")
				|Cambiar contraseña
			v-spacer

		v-dialog(content-class="password-change-dialog", max-width="600", v-model="state.passwordDialog", persistent)
			v-card.password-change-card
				v-card-title
					|Cambio de contraseña
				v-card-text
					v-form(ref="changeForm")

						v-text-field(
							ref="oldPassword",
							append-icon="mdi-lock",
							v-model="passwordChange.oldPassword",
							label="Contraseña actual",
							outlined,
							background-color="transparent",
							color="#176580",
							type="password")

						v-text-field(
							ref="newPassword",
							append-icon="mdi-lock",
							v-model="passwordChange.newPassword",
							label="Nueva contraseña",
							:rules="form.validations.password",
							outlined,
							background-color="transparent",
							color="#176580",
							@input="validate",
							@focus="state.passwordFocus = true",
							@blur="state.passwordFocus = false",
							type="password")

						v-text-field(
							ref="oldPassword",
							append-icon="mdi-lock",
							v-model="passwordChange.newPasswordR",
							label="Repetir contraseña",
							:rules="form.validations.password",
							outlined,
							background-color="transparent",
							color="#176580",
							@input="validate",
							type="password")

						v-tooltip(top, v-model="state.passwordFocus")
							template(v-slot:activator="{ on, attrs }")
								.tooltip-anchor(dark, v-on="on")
							.password-tooltip-validator
								.lowercase-validation
									v-icon(color="green", left, v-if="passwordChecker.lowercase")
										|mdi-check-circle
									v-icon(color="red", left, v-else)
										|mdi-close-circle
									span
										|Contiene al menos una #[strong letra minúscula]
								.uppercase-validation
									v-icon(color="green", left, v-if="passwordChecker.uppercase")
										|mdi-check-circle
									v-icon(color="red", left, v-else)
										|mdi-close-circle
									span
										|Contiene al menos una #[strong letra mayúscula]
								.number-validation
									v-icon(color="green", left, v-if="passwordChecker.number")
										|mdi-check-circle
									v-icon(color="red", left, v-else)
										|mdi-close-circle
									span
										|Contiene al menos un #[strong número]
								.special-validation
									v-icon(color="green", left, v-if="passwordChecker.special")
										|mdi-check-circle
									v-icon(color="red", left, v-else)
										|mdi-close-circle
									span
										|Contiene al menos un #[strong carácter especial] (!@#$%^&amp;?_+-=)
								.length-validation
									v-icon(color="green", left, v-if="passwordChecker.length")
										|mdi-check-circle
									v-icon(color="red", left, v-else)
										|mdi-close-circle
									span
										|Tiene al menos #[strong 8 carácteres de longitud]
						v-alert(color="warning", transition="scale-transition", v-show="state.passwordError")
							|{{ state.passwordError }}
				v-card-actions
					v-spacer
					v-btn(text, color="primary", @click="state.passwordDialog = false")
						|Regresar
					v-btn(color="primary", @click="changePassword", :loading="status.changeLoading")
						|Actualizar
</template>

<script>
	export default {
		data() {
			return {
				state: {
					passwordFocus: false,
					passwordDialog: false,
					passwordError: ""
				},
				status: {
					changeLoading: false
				},
				passwordChange: {
					oldPassword: "",
					newPassword: "",
					newPasswordR: "",
				},				
				form: {
					validations: {
				      	password: [
				        	v => !!v || 'La contraseña es requerida',
				        	v => this.passwordChange.newPassword === this.passwordChange.newPasswordR || 'Las contraseñas no coinciden',
				        	v => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z\d*.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\])[A-Za-z\d*.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\]{8,}/g.test(this.passwordChange.newPassword) || "La contraseña no tiene el formato requerido"
				      	],
					}
				}
			}
		},
		computed: {
			passwordChecker: function() {
				let check = {
					length: false,
					lowercase: false,
					uppercase: false,
					number: false,
					special: false,
				}

				if( this.passwordChange.newPassword.match(/[A-Z]/g) )
					check.uppercase = true
				if( this.passwordChange.newPassword.match(/[a-z]/g) )
					check.lowercase = true
				if( this.passwordChange.newPassword.match(/[0-9]/g) )
					check.number = true
				if( this.passwordChange.newPassword.match(/[*\.!@#$%^&\(\)\{\}\[\]\:\;\,\.\?\/\~\_\+\-\=\|\\]/g) )
					check.special = true
				if( this.passwordChange.newPassword.length >= 8 )
					check.length = true

				return check
			}
		},
		methods: {
			changePassword: function() {

				this.state.passwordError = ""

				if( this.validate() ) {
					this.status.changeLoading = true

					let body = {}
					body.oldPassword = this.passwordChange.oldPassword
					body.newPassword = this.passwordChange.newPassword

					let url = "change-password"
					this.$security.post(url, body)
					.then( response => {
						if( response.data.message == "ok" ){
							this.$swal("¡Contraseña actualizada correctamente!", "La próxima vez que inicies sesión podrás utilizar tu nueva contraseña.", "success")
							.then( () => {
								this.state.passwordDialog = false
							})
						}else{
							this.$swal("Error", "Por favor vuelva a intentar la óperación solicitada", "warning")
							this.$sentry.captureException( new Error( response.data ) )
						}
					})
					.catch( error => {
						if( error.response.status == 406 )
							this.error = "La contraseña actual es incorrecta."
						else{
							this.$swal("Error", "Por favor vuelva a intentar la óperación solicitada", "warning")
							this.$sentry.captureException( error )
						}
					})
					.finally( () => this.status.changeLoading = false)

				}
			},
			validate: function(){
				return this.$refs.changeForm.validate()
			}
		},
		components: {
		}
	}
</script>

<style lang="sass">
	.security-info
		padding-top: 20px
		padding-bottom: 20px
	.password-change-dialog

	@media only screen and (min-width: 1904px)
		.security-info
	@media only screen and (max-width: 1903px)
		.security-info
	@media only screen and (max-width: 1264px)
		.security-info
	@media only screen and (max-width: 960px)
		.security-info
</style>