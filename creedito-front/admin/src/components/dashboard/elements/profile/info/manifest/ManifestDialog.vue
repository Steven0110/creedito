<template lang="pug">
	v-dialog(content-class="manifest-dialog", :value="value", persistent, max-width="80%", max-height="70%")
		v-card
			v-card-title
				|Manifiesto de términos y condiciones
			v-card-text
				tyc
			v-card-actions
				v-spacer
				v-btn(color="#ba7127", text, @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="status.show.signature = true")
					|Firmar

		v-dialog(content-class="signature-dialog", v-model="status.show.signature", persistent, max-width="500")
			v-card
				v-card-title
					|Ingresa tu e.firma (FIEL)
				v-card-text
					v-btn.mb-4(color="primary", @click="$refs.cer.click()", block)
						|{{ buttonText('cer') }}
						v-icon(right)
							|mdi-upload
					v-btn.mb-4(color="primary", @click="$refs.key.click()", block)
						|{{ buttonText('key') }}
						v-icon(right)
							|mdi-upload
					v-text-field(
						type="password",
						v-model="input.password",
						dense,
						outlined,
						append-icon="mdi-lock",
						label="Contraseña de la clave privada")

					//hidden
					input(type="file", ref="cer", id="cer" style="display:none;", @change="loadCer", accept=".cer")
					input(type="file", ref="key", id="key" style="display:none;", @change="loadKey", accept=".key")

				v-card-actions
					v-spacer
					v-btn(color="#ba7127", text, @click="status.show.signature = false")
						|Cancelar
					v-btn(color="primary", @click="sign", :disabled="!isValidForm", :loading="status.signing")
						|Firmar


</template>

<script>
	import TYC 	from "@/components/dashboard/elements/profile/info/manifest/TYC.vue"

	export default {
		props: ["value"],
		data() {
			return {
				status: {
					show: {
						signature: false
					},
					signing: false
				},
				input: {
					password: "",
					cer: null,
					key: null
				}
			}
		},
		computed: {
			isValidForm: function() {
				return this.input.password && this.input.cer && this.input.key
			},
			cerText: function() {
				return this.input.cer ? this.input.cer.name : "Certificado (.cer)"
			},
			keyText: function() {
				return this.input.key ? this.input.key.name : "Clave privada (.key)"
			},
		},
		methods: {
			loadCer: function(e) {
				if( e.target && e.target.files && e.target.files[0] )
					this.input.cer = e.target.files[0]
				else
					this.input.cer = null
			},
			loadKey: function(e) {
				if( e.target && e.target.files && e.target.files[0] )
					this.input.key = e.target.files[0]
				else
					this.input.key = null
			},
			buttonText: function(type) {
				if( this.input[ type ] ){
					if( this.input[ type ].name.length > 25){
						return this.input[ type ].name.substr(0, 25) + "(...)." + type
					}else
						return this.input[ type ].name
				}else{
					if( type == "cer" )
						return "Certificado (.cer)"
					else
						return "Clave privada (.key)"
				}
			},
			sign: async function() {
				
				let b64Cer, b64Key, fileKey
				this.status.signing = true

				try{
					b64Cer = await this.toBase64( this.input.cer )
					b64Key = await this.toBase64( this.input.key )
				}catch(e){
					this.$swal("Error al leer la FIEL", "Por favor vuelve a intentarlo", "error")
					this.$sentry.captureException( e )

					return false
				}

				const body = {
					cer: b64Cer,
					key: b64Key,
					pass: this.input.password,
					doc: "tyc",
					username: this.$store.getters.user.username
				}

				this.$fileserver.post("sign", body)
				.then(result => {
					fileKey = result.data.key

					/*	Almacena todo en la DB 	*/
					let body = {
						key: fileKey,
						type: "tyc",
					}
					
					return this.$documents.post( "save-file", body, {headers: {Authorization: false}} )
				})
				.then(result => {

					this.status.show.signature = false
					this.$emit("close")

					this.$swal({
						title: "¡Listo!",
						text: "Has firmado correctamente los términos y condiciones",
						type: "success",
						confirmButtonText: "Descargar PDF",
						showLoaderOnConfirm: true,
						showCancelButton: false,
            			allowOutsideClick: false,
            			allowEscapeKey: false,
            			preConfirm: () => {
							return this.download( fileKey )
            			}
					})
				})
				.catch(e => {
					if(e.response && e.response.status ){
						if( e.response.status == 406 ){
							this.$swal("Error al leer la FIEL", e.response.data.message, "warning")
						}else{
							this.$swal("Error al leer la FIEL", "Por favor vuelve a intentarlo", "error")
							//this.$sentry.captureException( e )
						}
					}else{
						this.$swal("Error al leer la FIEL", "Por favor vuelve a intentarlo", "error")
						//this.$sentry.captureException( e )
					}
				})
				.finally(() => this.status.signing = false)
			},
			download: function(key) {
				//documentos/tyc/pdf-pPhSf.pdf
				let resource = `download?key=${key}&username=${this.$store.getters.user.username}`
				let config = {responseType: 'arraybuffer'}

				return this.$fileserver.get(resource, config)
				.then(result => {

					const url = window.URL.createObjectURL(new Blob([ result.data ]))
		            const link = document.createElement('a')
		            link.href = url
		            link.setAttribute('download', 'TerminosyCondiciones.pdf')
		            document.body.appendChild(link)
		            link.click()

				})
				.catch(err => {
					console.log( err )
				})
			},
			toBase64: function( file ) {
				let reader = new FileReader()
				return new Promise((resolve, reject) => {
	                reader.onloadend = e => e.target.result ? resolve( e.target.result.split(",")[1] ) : reject( e.target.error)
	                reader.readAsDataURL( file )
				})
			},
		},
		components: {
			"tyc": TYC
		}
	}
</script>

<style lang="sass">
</style>