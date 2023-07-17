<template lang="pug">
	.security-questions
		v-card
			v-img(src="/assets/images/question.jpg", :height="imgHeight")
			v-card-title
				|Preguntas de seguridad
				v-tooltip(top, max-width="500")
					template(v-slot:activator="{ on, attrs }")
						v-icon(right, color="black", v-on="on")
							|mdi-help-circle
					div
						p
							|Las preguntas de seguridad sirven para restaurar tu cuenta o tu contraseña.
						p
							|Si deseas reestablecer tu contraseña, se te solicitará responder una de tus preguntas de seguridad, y posteriormente la pregunta será eliminada.
						p
							|Si tu cuenta resulta bloqueada por haber hecho 3 intentos fallidos de inicio de sesión podrás desbloquearla respondiendo una pregunta de seguridad, y posteriormente la pregunta será eliminada.
						p
							|Una vez que no tengas preguntas de seguridad restantes pdorás volver a configurarlas.
			v-card-subtitle
				|Configura tus preguntas de seguridad en caso de requerir recuperar tu contraseña.
			v-card-actions
				v-spacer
				v-btn(color="#176580", dark, v-if="$store.getters.user.securityQuestions == 0", @click="showConfig = true")
					|Configurar preguntas
				v-btn(color="green", dark, v-else)
					|Preguntas configuradas
					v-icon(right)
						|mdi-check

		v-dialog(v-model="showConfig", max-width="700", persistent)
			v-card.security-questions-card()
				v-card-title.mb-5
					|Configuración de preguntas de seguridad
				v-card-text
					v-form(ref="securityQuestionsForm")
						v-row.question(v-for="(q, index) in questions", :key="q.id", align="center", justify="center")
							v-col.pb-0.pt-0(md="6", cols="12")
								v-text-field(
									v-model="q.question",
									label="Pregunta secreta",
									:rules="form.validations.required",
									placeholder="v.g. Nombre de mi primer mascota",
									name="Question name")
							v-col.pb-0.pt-0(md="5", cols="10")
								v-text-field(
									v-model="q.answer",
									label="Respuesta de la pregunta",
									:rules="form.validations.required",
									name="Question answer")
							v-col.pb-0.pt-0(md="1", cols="2")
								v-icon(color="red", bottom, @click="removeQuestion( index )")
									|mdi-close
							v-col(cols="12")
								v-divider.d-block.d-md-none
					.d-flex
						v-spacer
						v-btn(text, color="blue", @click="addQuestion")
							|Agregar pregunta +
						v-spacer
					.d-flex
						v-spacer
						v-alert.text-center(color="orange", ref="questionsAlert", :value="false", dismissible)
							|Necesitas agregar al menos 2 preguntas de seguridad
						v-spacer
				v-card-actions
					v-spacer
					v-btn(text, color="primary", @click="showConfig = false")
						|Cerrar
					v-btn(color="primary", @click="saveQuestions")
						|Guardar
</template>

<script>

	export default {
		data() {
			return {
				showConfig: false,
				questions: [],
				form: {
					validations: {
						required: [
				        	v => !!v || 'Este campo es requerido',
				      	],
					}
				}
			}
		},
		mounted() {
		},
		methods: {
			addQuestion: function() {
				this.questions.push( {question: "", answer: "", id: this.randomString(10)} )
			},
			sanitizeQuestions: function() {
				for( let i = 0 ; i < this.questions.length ; i++ ){
					this.questions[ i ].question = this.$sanitizer.sanitizeXSS( this.questions[ i ].question )
					this.questions[ i ].answer = this.$sanitizer.sanitizeXSS( this.questions[ i ].answer )
				}
			},
			saveQuestions: function() {
				if( this.$refs.securityQuestionsForm.validate() ){

					if( this.questions.length < 2 )
						this.$refs.questionsAlert.toggle()
					else{
						this.$swal({
							title: "¿Seguro que estás serán tus preguntas de seguridad?",
							text: "No podrás volver a configurarlas hasta que ya no tengas preguntas disponibles",
							type: "warning",
							confirmButtonText: "Sí, guardar",
							cancelButtonText: "Regresar",
							showCancelButton: true,
							reverseButtons: true,
							showLoaderOnConfirm: true,
							preConfirm: () => {

								this.sanitizeQuestions() //	Anti-XSS

								return this.$security.post("set-security-questions", {questions: this.questions})
								.then( result => {
									
									this.$store.commit("setSecurityQuestions", this.questions.length)
									this.showConfig = false


									return this.$swal("¡Listo!", "Las preguntas de seguridad han sido configuradas correctamente", "success")
								})
								.catch( error => {
									//this.$sentry.captureException( error )
									this.$swal("Álgo salió mal", "Por favor vuelve a intentarlo", "error")
								})
							}
						})
					}
				}
			},
			removeQuestion: function( index ) {
				this.questions.splice( index, 1)
			},
			randomString: function(length) {
			    let result           = ''
			    let universe 		 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
			    let charactersLength = universe.length

			    for( let i = 0; i < length; i++ )
			       result += universe.charAt(Math.floor(Math.random() * charactersLength))

			    return result
			}
		},
		computed: {
			imgHeight: function() {
				if(this.$vuetify.breakpoint.smAndDown)
					return "200"
				else
					return "300"
			}
		},
		components: {
		}
	}
</script>

<style lang="sass">
	.security-questions
	.security-questions-card
		.question
		.v-card__text
			padding-bottom: 0 !important

	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>