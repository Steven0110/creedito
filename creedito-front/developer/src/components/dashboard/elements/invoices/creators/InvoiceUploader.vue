<template lang="pug">
	v-dialog(content-class="invoice-uploader", max-width="500" , :value="show", persistent)
		v-card.invoice-type-card
			v-card-title.text-center
				|Subir factura
			v-card-text
				p
					|Por favor sube el archivo #[strong .xml] de la factura timbrada que desees publicar
				xml-uploader(@upload="uploadedInvoice", :doc="$catalog.invoice")

			v-card-actions
				v-spacer
				v-btn(text, color="#B05900", @click="$emit('close')")
					|Cancelar
</template>

<script>
	import XMLUploader from "@/components/tools/files/XMLUploader.vue"

	export default {
		props: ["show"],
		data() {
			return {
				status: {
					uploading: false
				}
			}
		},
		methods: {
			uploadedInvoice: function(id) {
				this.$swal({
					title: "¡Listo!",
					text: "La factura se ha subido exitosamente.",
					type: "success"
				})
				.then(result => {
					this.$router.push(`/dashboard/factura/publicacion/${id}`)
				})
			}
		},
		computed: {

		},
		components: {
			"xml-uploader": XMLUploader
		}
	}
</script>

<style lang="sass">
	.invoice-uploader
</style>
