<template lang="pug">
	.secret-image
		v-card
			v-img(src="/assets/images/secret-image.jpg", :height="imgHeight")
			v-card-title
				|Imagen secreta
			v-card-subtitle(v-if="!$store.getters.user.secretImage")
				|Configura una imagen secreta para que puedas iniciar sesión con mayor seguridad.
				v-tooltip(top, max-width="500")
					template(v-slot:activator="{ on, attrs }")
						v-icon(right, color="black", v-on="on")
							|mdi-help-circle
					div
						p
							|La imagen de seguridad que escojas se te mostrará al iniciar sesión para que tengas la seguridad de estar ingresando tus credenciales de acceso en Investus
			v-card-subtitle(v-else)
				|La imagen secreta ya fue configurada exitosamente.
			v-card-actions
				v-spacer
				v-btn(color="primary", dark, v-if="!$store.getters.user.secretImage", @click="showConfig = true", :loading="status.sending")
					|Configurar
				v-btn(color="green", dark, v-else)
					|Configurado
					v-icon(right)
						|mdi-check

		//- Modal de configuración
		v-dialog(v-model="showConfig", max-width="1200", persistent, scrollable)
			v-card.secret-image-card
				v-card-title
					|Configuración de imagen secreta
				v-card-text
					.instructions
						|Por favor seleccione una de las siguientes imágenes:
					.secret-images-container
						image-radio-group(v-model="secretImage", :images="images")
				v-card-actions
					v-spacer
					v-btn(text, color="primary", @click="showConfig = false")
						|Cerrar
					v-btn(color="primary", @click="saveSecretImage", :loading="status.saving")
						|Guardar
</template>

<script>
	import ImageRadioGroup	from "@/components/tools/forms/ImageRadioGroup.vue"

	export default {
		data() {
			return {
				showConfig: false,
				secretImage: "",
				status: {
					saving: false
				},
				images: [
					"079789h8hjhgjutu5767fhnbtd6e.jpg",
					"089089jkljo79ihjkh85687th4746tfde535tdg7t86.jpg",
					"2556363yrhfj6869uojk088jhg.jpg",
					"32023948dfigohkdfjghdf98465sdd.jpg",
					"345987dfkhfdgifg894756546.jpg",
					"3647567080jojlkkgjfhget4687.jpg",
					"78657yuhgj7989iklklo879098687thjg.jpg",
					"aasqwsdwedftr45567787989898hjghg.jpg",
					"asdojkdas89jp23rbgdoiñcnoi4389.jpg",
					"aslkjñasdlksgdoij32r98sdf23409.jpg",
					"bvvbmnfgkjfidjfdiu84u8374gfj.jpg",
					"cfgjhutu447f8bldksjsd56fg.jpg",
					"cvbdfgdfgert5646fggfhfgh.jpg",
					"cvbfdghfghmhjkyu89789789.jpg",
					"cvbfghguityu567856756745.jpg",
					"cvmdfkjrtiuryuiy8737634hgsdnbdf.jpg",
					"cvmndfjeruy347623674598567899.jpg",
					"ddfrrtmtnymnyumiumou.jpg",
					"dfgooy847322d7vvvjbjgssd.jpg",
					"djgjg8678467eyfhjgkjyi6u5yetf.jpg",
					"dlflgmbmhjui68576sgxnvmbkhkh.jpg",
					"dsfsf76fsd7667g67g76dfgfdgfd.jpg",
					"flgk5857362tsghdcfjgkhi7856743.jpg",
					"ggfhffg746764ghhghgghgh.jpg",
					"guitjkrankjasdnkajsd334656.jpg",
					"khklgfjfhjd747fhjgfj69yu9hkgj5.jpg",
					"kjfgjkdfhjeruy458723892306798.jpg",
					"lhhkjgjtiutu47473636eyhnmvmbk.jpg",
					"lkjsdfkjherituh3496856dfgdg.jpg",
					"mnbxcvbkjsdfkbjasduiqwe324656.jpg",
					"nmbnbhfhdgw6465786ihkhjd3.jpg",
					"nmkhgijijuyteywtr7345.jpg",
					"partiyiu87435hdnfkknvsksdfs.jpg",
					"sdfsdfdfgkjnrg789y4378bsdfsdfs.jpg",
					"sfdfdfghuyiu63433434.jpg",
					"trlkfdglkn3489938dfglgfnldf44.jpg",
					"vbmnfgkjrtiue4872365ahgcxccvb.jpg",
					"vmbnbjgjti789089766d.jpg",
					"xcdfdtghjhjjkui89890.jpg",
					"xcvmnsdfiuhwer87236487yhfdgfgdg.jpg",
				]
			}
		},
		methods: {
			saveSecretImage: function() {


				this.$swal({
					title: "¿Estás seguro?",
					text: "Una vez configurada la imagen secreta no se podrá modificar",
					type: "warning",
					showCancelButton: true,
					cancelButtonText: "Regresar",
					confirmButtonText: "Guardar",
					reverseButtons: true
				})
				.then(result => {
					if( result.value ){
						this.status.saving = true

						this.$store.commit("setSecretImage", true)
						
						/*	Da de alta la imagen secreta 	*/
						let body = {
							secretImage: this.secretImage
						}
						
						this.$security.post("set-secret-image", body)
						.then(result => {
							this.$swal("¡Listo!", "Tu imagen secreta ha sido configurada correctamente. La podrás visualizar la próxima vez que inicies sesión", "success")
						})
						.catch(err => {
							console.error( err )
							this.$sentry.captureException( err )
							this.$swal("No se pudo configurar tu imagen secreta", "Por favor vuelve a intentarlo", "warning")
						})
						.finally( () => {
							this.showConfig = false
							this.status.saving = false
						})

					}
				})
				
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
			ImageRadioGroup
		}
	}
</script>

<style lang="sass">
	.secret-image
	.secret-image-card
		.instructions
			font-size: 1.2em
			margin-bottom: 15px
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>