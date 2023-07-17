<template lang="pug">
	.xmluploader
		.drag-and-drop-container(:style="containerStyle")
			drag-and-drop(ref="drgdrp", id="drgdrp", :options="options", v-on:vdropzone-sending="", v-on:vdropzone-complete="")

			//Icono de subida
			.upload-image
				img(@click="triggerUpload", src="/assets/icons/xml.svg")
			.description()
				v-tooltip(bottom, max-width="300px")
					template(v-slot:activator="{ on, attrs }")
						v-icon(right, color="black", v-bind="attrs", v-on="on")
							|mdi-help-circle
					span
						|{{ doc.description }}

			//Upload Bar
			v-progress-linear.upload-progress-bar(v-model="status.uploadProgress", determinate, color="primary", v-show="status.uploading || status.uploadProgress == 100")

			//Processing Loader
			v-progress-circular.processing-loader(indeterminate, color="primary", v-show="status.uploading")
</template>

<script>
	import vue2Dropzone from "vue2-dropzone"

	export default {
		props: ["doc"],
		data(){
			return {
				status: {
					uploading: false,
					uploadProgress: 0,
					processing: false
				}
			}
		},
		methods: {
			triggerUpload: function(target) {
				this.$refs.drgdrp.$el.click()
			},
			toBase64: function( file ) {
				let reader = new FileReader()
				return new Promise((resolve, reject) => {
	                reader.onloadend = e => e.target.result ? resolve( e.target.result.split(",")[1] ) : e.target.error
	                reader.readAsDataURL( file )
				})

			},
		},
		computed: {
			options: function() {
				let options = {
					url: this.FS + "test",
					thumbnailWidth: 150,
					maxFilesize: 1024 * 4, //4 MB
					paramName: "file",
					timeout: 1000 * 180, //3 min
					chunking: false,
					createImageThumbnails: false,
					previewTemplate: `<div class="dz-preview dz-file-preview"></div>`,
					maxFiles: 1,
					acceptedFiles: this.doc.accept,
					hiddenInputContainer: "#drgdrp",
					uploadProgress: (file, progress, size) => {
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
					},
					complete: response => {
					},
					sending: async (file, xhr, formData) => {

						let base64 = await this.toBase64( file )
						let body = {
							data: base64
						}

						this.status.uploading = true
						this.$invoices.post("upload-invoice", body)
						.then( result => {
							if( result.data._id ){
								this.$emit("upload", result.data._id)
							}else{
								this.$swal("Error al procesar factura", "Por favor vuelva a intentarlo, si el problema persiste favor de comunicarse a soporte@creedito.mx", "error")
								this.$report(new Error(result.data))
							}
						})
						.catch( err => {
							if( err.response && err.response.status ){
								if( err.response.status == 406 ){
									this.$swal("Acceso denegado", "Tu cuenta necesita ser aprobada antes de poder publicar facturas. Para ello requieres tener tu cuenta verificada, activar el segundo factor de autenticación, subir los documentos solicitados, firmar los términos y condiciones, y haber subido una foto de perfil válida.", "warning")
								}else if( err.response.status == 410 ){
									this.$swal("Factura duplicada", `Ya existe una factura subida con el mismo UUID`, "error")
								}else
									this.$report( err )
							}else
								this.$report( err )
						})
						.finally( () => {
							this.status.uploading = false
							this.$refs.drgdrp.removeAllFiles()
						})
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
	.xmluploader
		.drag-and-drop-container
			position: relative
			.upload-image
				position: absolute
				display: inline-block
				width: 90px
				height: 90px
				margin: auto
				top: -30px
				bottom: 0
				left: 0
				right: 0
				img
					max-height: 100%
					width: 100%
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
		.xmluploader
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