<template lang="pug">
	v-dialog(content-class="image-uploader-dialog", persistent, max-width="500", :value="show")
		v-card
			v-card-title
				|Subir imagen
			v-card-text
				v-img.mb-6(:src="url", max-height="200", contain)
				v-row
					v-spacer
					input.d-none(ref="file", type="file", accept="image/*", @change="setFile")
					v-btn(color="primary", outlined, @click="$refs.file.click()", :loading="status.uploading")
						|{{ text }}
						v-icon
							|mdi-upload
					v-spacer
				v-alert(color="orange", v-model="alert.size")
					|El tamaño del archivo debe ser menor a 4MB
			v-card-actions
				v-spacer
				v-btn(color="secondary", text, @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="updateCompany", :disabled="isUploaded", :loading="status.updating")
					|Confirmar
</template>

<script>
	export default {
		props: ["show"],
		data() {
			return {
				alert: {
					size: false
				},
				status: {
					uploading: false,
					updating: false,
				},
				text: "Seleccionar archivo",
				url: "/assets/images/placeholder.png",
				key: ""
			}
		},
		computed: {
			isUploaded: function() {
				return !!this.url.match(/\/assets\/images\//g)
			}
		},
		methods: {
			setFile: async function(){
				const file = this.$refs.file.files[0]

				if( file ) {
					if( file.size < 4000000){
						this.status.uploading = true

						let body = {
							data: await this.toBase64( file ),
							type: this.getFiletype( file )
						}
						this.$documents.post("upload-image", body)
						.then( ({data}) => {
							this.url = `${this.S3_BASE}/${data.key}`
							this.key = data.key
							this.text = this.trimString( file.name, 30 )
						})
						.catch(err => this.$report( err, {swal: true}) )
						.finally(() => this.status.uploading = false)
					}else
						this.alert.size = true
				}
			},
			updateCompany: function() {

				this.status.updating = true

				let company = this.$store.getters.user.company
				company.image = this.key

				this.$security.post("update-info", {company: company})
				.then( result => {
					this.$swal("¡Listo!", "Imagen actualizada correctamente", "success")
					this.$emit("close")
					this.$store.commit("setUserData", {key: "company", value: company})
				})
				.catch( err => this.$report(err, {swal: true}))
				.finally( () => this.status.updating = false)
			},
			toBase64: function( file ) {
				let reader = new FileReader()
				return new Promise((resolve, reject) => {
					reader.onloadend = e => e.target.result ? resolve( e.target.result.split(",")[1] ) : e.target.error
					reader.readAsDataURL( file )
				})

			},
			trimString: function(string, max) {
				if(string.length > max)
					return `${string.substr(0, max)}...`
				else
					return string
			},
			getFiletype: function( file ){
				let aux = file.name.split(".")
				return aux[ aux.length - 1 ]
			}
		}
	}
</script>

<style lang="sass">
	.image-uploader-dialog
</style>