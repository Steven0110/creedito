<template lang="pug">
	v-dialog(content-class="camera-component", persistent, :max-width="maxWidth", :value="show")
		v-card
			v-card-title
				|Captura de selfie
			v-card-text
				.instructions
					|Por favor asegúrese que su rostro se vea con claridad y presiona el icono de la cámara
				.camera-container
					video#camera.video-js.vjs-default-skin(playsinline)
			v-card-actions
				v-spacer
				v-btn(color="#ba7127", text, @click="close")
					|Cancelar
				v-btn(color="primary", @click="capture", v-show="status.shooting")
					|Tomar foto
				v-btn(color="primary", @click="reset", v-show="status.captured")
					|Tomar otra foto
				v-btn(color="primary", @click="confirm", v-show="status.captured", :loading="status.loading")
					|Confirmar
</template>

<script>
	import 'video.js/dist/video-js.min.css'
	import 'videojs-record/dist/css/videojs.record.css'
	import videojs 		from 'video.js'
	import Record 		from 'videojs-record/dist/videojs.record.js'


	export default {
		props: ["show"],
		data() {
			return {
				player: "",
				status: {
					captured: false,
					shooting: false,
					loading: false
				},
				data: null
			}
		},
		mounted(){
			console.log("mnt")

			let options = {
				controls: true,
				fluid: false,
				bigPlayButton: false,
				height: this.height,
				width: this.width,
				controlBar: {
					volumePanel: false,
					fullscreenToggle: false
				},
				plugins: {
					record: {
						image: true,
						debug: true,
						imageOutputType: "dataURL",
					}
				}
			}

			console.log( options.width )

			this.player = videojs('#camera', options, () =>{
				let msg = 'Using video.js ' + videojs.VERSION +
					' with videojs-record ' + videojs.getPluginVersion('record')
				videojs.log( msg )
			})

			this.player.on('deviceError', () => {
				console.error('device error:', this.player.deviceErrorCode)
				this.$swal("Cámara no encontrada", "Si el equipo ya cuenta con una cámara instalada, por favor asegúrese que sus controladores se encuentren actualizados y vuelva a intentarlo.", "error")
			})
			this.player.on('error', (element, error) => {
				console.error( error )
				this.$swal("Cámara no encontrada", "Si el equipo ya cuenta con una cámara instalada, por favor asegúrese que sus controladores se encuentren actualizados y vuelva a intentarlo.", "error")
			})

			this.player.on('deviceReady', () => {
				this.status.shooting = true
				console.log("ready")
			})

			this.player.on('startRecord', () => {
				console.log("start")
			})

			this.player.on('finishRecord', () => {
				console.log("finish")
				this.status.shooting = false
				this.status.captured = true

				this.data = this.player.recordedData.split(",")[1]

			})
		},
		methods: {
			capture: function() {
				this.player.record().start()
				setTimeout(() => {
					this.status.shooting = false
					this.status.captured = true
					this.player.record().stop()
				}, 500)
			},
			confirm: function() {
				this.status.loading = true

				let body = {
					data: this.data,
					extension: "png",
				}
				this.$fileserver.post( "upload-b64", body )
				.then(result => {
					body = {
						tmpPath: result.data.path,
						type: "image"
					}
					return this.$fileserver.post( "bypass-process", body )
				})
				.then(result => {
					let body = {
						profilePicture: result.data.key
					}

					return this.$security.post("update-info", body)
				})
				.then(result => {
					this.renovateSession()
					this.$emit("close")
					this.$swal("¡Listo!", "La fotografía ha sido subida exitosamente. En breve recibirás el resultado de su análisis.", "success")
				})
				.catch(err => {
					this.$sentry.captureException( err )
					console.error( err )
					this.$swal("Hubo un error al procesar la imagen", "Por favor vuelve a intentarlo", "warning")
					this.reset()
				})
				.finally(() => this.status.loading = false)
			},
			close: function() {
				this.$emit('close')
			},
			reset: function() {
				this.status.shooting = false
				this.status.captured = false

				this.player.record().reset()
				this.player.record().getDevice()
			}
		},
		computed: {
			maxWidth: function() {
				if(this.$vuetify.breakpoint.smAndDown)
					return "100%"
				else
					return "30%"
			},
			height: function() {
				if(this.$vuetify.breakpoint.lgAndUp)
					return 450 - 70
				else if(this.$vuetify.breakpoint.mdOnly)
					return 400 - 70
				else if(this.$vuetify.breakpoint.smOnly)
					return 350 - 70
				else
					return 300 - 70
			},
			width: function() {
				if(this.$vuetify.breakpoint.smAndDown) {
					return this.$vuetify.breakpoint.width - 48
				}else{
					return Number(parseFloat(this.$vuetify.breakpoint.width * 0.3 - 48).toFixed(0))
				}
			}
		},
		beforeDestroy(){
			console.log("umnt")
			//this.player.record().stop()
			this.player.record().destroy()
		},
	}
</script>

<style lang="sass">
	.camera-component
		.v-card
			.video-js
				width: 100%
				button.vjs-icon-video-perm
					&:before
						content: "\f107" !important

</style>