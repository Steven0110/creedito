<template lang="pug">
	.uploader
		.drag-and-drop-container(:style="containerStyle")
			drag-and-drop(ref="drgdrp", id="drgdrp", :options="options", v-on:vdropzone-sending="", v-on:vdropzone-complete="")

			//Icono de subida
			.upload-image(v-if="!status.uploading && !doc.status")
				v-icon(color="black", size="50", @click="triggerUpload")
					|mdi-upload
			//Icono de éxito
			.upload-image(v-else-if="!status.uploading && doc.status == 'uploaded' ")
				v-icon(color="primary", size="50")
					|mdi-check
			//Icono de procesamiento
			.upload-image(v-else-if="!status.uploading && doc.status == 'processing' ")
				v-icon(color="primary", size="50")
					|mdi-autorenew

			.upload-text(v-show="!status.uploading", @click="triggerUpload")
				|{{ doc.name }}
			
			.helper(v-if="doc.helper")
				v-icon(right, color="black", large, @click="helper = true")
					|mdi-help-circle
				v-dialog(v-model="helper", max-width="90%")
					v-card.helper-card
						v-card-title
							|{{ doc.helper.title }}
						v-card-text
							.helper-images
								img(v-for="image in doc.helper.images", :key="image", :src="image")
							|{{ doc.helper.footer }}
						v-card-actions
							v-spacer
							v-btn(@click="helper = false", color="primary")
								|Cerrar
							v-spacer
			.description(v-else-if="doc.description")
				v-tooltip(bottom, max-width="300px")
					template(v-slot:activator="{ on, attrs }")
						v-icon(right, color="black", v-bind="attrs", v-on="on")
							|mdi-help-circle
					span
						|{{ doc.description }}

			.validation-result(v-if="doc.validation")
				v-icon(right, color="warning", large, @click="warning = true")
					|mdi-alert
				v-dialog(v-model="warning", max-width="300")
					v-card
						v-card-title.justify-center
							|Resultado de validación
						v-card-text.text-center
							|{{ doc.validation.message }}
						v-card-actions
							v-spacer
							v-btn(@click="warning = false", color="primary")
								|Cerrar
							v-spacer

			//Upload Bar
			v-progress-linear.upload-progress-bar(v-model="status.uploadprogress", determinate, color="primary", v-show="status.uploading || status.uploadprogress == 100")

			//Processing Loader
			v-progress-circular.processing-loader(indeterminate, color="primary", v-show="status.processing")
</template>

<script>
	import vue2Dropzone from "vue2-dropzone"

	export default {
		props: ["doc", "project"],
		data(){
			return {
				status: {
					uploading: false,
					uploadprogress: 0,
					processing: false
				},
				helper: false,
				warning: false
			}
		},
		methods: {
			triggerUpload: function(target) {
				this.$refs.drgdrp.$el.click()
			},
			showHelper: function( helper ){

			}
		},
		computed: {
			options: function() {
				let options = {
					url: this.FS + "upload",
					thumbnailWidth: 150,
					maxFilesize: 1024 * 30, //30 MB
					paramName: "file",
					timeout: 1000 * 180, //3 min
					chunking: true,
					createImageThumbnails: false,
					forceChunking: true,
					previewTemplate: `<div class="dz-preview dz-file-preview"></div>`,
					maxFiles: 1,
					acceptedFiles: this.doc.accept,
					hiddenInputContainer: "#drgdrp",
					uploadprogress: (file, progress, size) => {
						let total = file.size
						let current = size

						let percentage = Number( Math.floor( current * 100 / total ) )
						this.status.uploading = true
						
						if( percentage > 100 )
							percentage = 100
						this.status.uploadProgress = percentage
					},
					maxfilesexceeded: file => {
						this.$refs.drgdrp.removeFile( file )
						this.$swal("", "Sólo puedes subir un sólo archivo", "warning")
					},
					success: response => {
						let fileResponse = JSON.parse( response.xhr.responseText )
						let tmpPath = fileResponse.file.path
						let body = {
							tmpPath: tmpPath,
							username: this.$store.getters.user.username,
							type: this.doc.type
						}
						let resource = "process"

						this.$fileserver.post( resource, body )
						.then(result => {
							/*	Registra el archivo en los datos del usuario */
							let body = {
								key: result.data.key,
								type: this.doc.type
							}

							if( this.project ){
								/*	Guarda el documento en el proyecto 	*/
								this.status.processing = true

								resource = "project/add-document/" + this.project._id
								this.$projects.post( resource, body )
								.then(result => {
									this.$emit("upload", body)
								})
								.catch(err => {
									console.log( err )
								})
								.finally(() => this.status.processing = false)

							}else{
								/*	Guarda el documento en el usuario per se 	*/
								resource = "save-file"
								this.$documents.post( resource, body, {headers: {Authorization: false}} )
								this.$emit("upload")
							}
						})
						.catch(err => {
							console.error( err )
							this.$sentry.captureException( err )
							this.$swal("Hubo un error al procesar el archivo", "Por favor vuelve a intentarlo", "warning")
							this.$refs.drgdrp.removeAllFiles()
						})

						/*	Procesa el archivo 	*/
					},
					complete: response => {
						this.status.uploading = false
					}
				}
				
				if( !this.doc.status ){
					options.clickable = true
					options.dictDefaultMessage = this.doc.uploadText
				}else{
					options.clickable = false
					options.dictDefaultMessage = ""
				}

				return options
			},
			containerStyle: function() {
				let style = {}
				if( !this.doc.status )
					style.border = "2px dashed rgba(0, 0, 0, 0.25)"
				else
					style.border = "2px solid rgba(23, 101, 128, 0.3)"
				return style
			}
		},
		components: {
			"drag-and-drop": vue2Dropzone,
		}
	}
</script>

<style lang="sass">
	.uploader
		.drag-and-drop-container
			position: relative
			.upload-image
				position: absolute
				display: inline-block
				width: 50px
				height: 50px
				margin: auto
				top: -70px
				bottom: 0
				left: 0
				right: 0
			.upload-text
				position: absolute
				padding-left: 15px
				padding-right: 15px
				height: 30px
				margin: auto
				top: 12px
				bottom: 0
				left: 0
				right: 0
				text-align: center
				font-size: 18px
				line-height: 18px
				font-family: Raleway
				letter-spacing: 1px
				color: black
				font-weight: 600
				&:hover
					cursor: pointer
			.vue-dropzone
				transition: 0.2s linear all
				padding: 10px
				.dz-default.dz-message
					padding-top: 78px
					padding-bottom: 0
					margin-bottom: -50px
					line-height: 15px
			.upload-progress-bar
				position: absolute
				bottom: 0
				left: 0
				width: 100%
			.processing-loader
				position: absolute
				top: 10px
				left: 10px
			.helper
				position: absolute
				right: 10px
				top: 10px
			.description
				position: absolute
				right: 10px
				top: 10px
			.validation-result
				position: absolute
				right: 45px
				top: 10px
			&:hover
				.vue-dropzone
					box-shadow: 1px 1px 7px -4px black
					transition: 0.2s linear all
	.helper-card
		.helper-images
			text-align: center
			img
				display: inline-block
				width: 50%

	@media only screen and (min-width: 1904px)
		.uploader
			.drag-and-drop-container
				.upload-image
				.upload-text
					font-size: 22px
					line-height: 24px
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)
</style>