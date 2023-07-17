<template lang="pug">
	.invoice-publisher
		v-stepper(non-linear)
			v-stepper-header.elevation-0
				v-stepper-step(editable step="1", complete, complete-icon="mdi-check", edit-icon="mdi-check")
					|Viabilidad Legal o Jurídica
				v-divider
				v-stepper-step(editable step="2")
					|Evaluación Cuantitativa y Cualitativa del proyecto y solicitante
				v-divider
				v-stepper-step(editable step="3")
					|Verificación de Garantía Inmobiliaria y Valuación del colateral
			v-stepper-items
				v-stepper-content.elevation-0(step="1")
					.step-header
						.description
							|Sube los documentos solicitados por las Disposiciones de carácter general a las que se refiere el artículo 58 de la LRITF.
					.step-subcontent
						v-row.documents(v-if="viabilidadDocs.length > 0")
							v-col(md="3", v-for="doc in viabilidadDocs", :key="doc.type")
								uploader(
									:doc="doc",
									:project="project"
									@upload="uploadedDocument( doc )")
				v-stepper-content.elevation-0(step="2")
					.step-header
						.description
							|Sube los documentos solicitados por las Disposiciones de Carácter General Aplicables a las Instituciones de Tecnología Financiera.
					.step-subcontent
						v-row.documents(v-if="evaluacionDocs.length > 0")
							v-col(md="3", v-for="doc in evaluacionDocs", :key="doc.type")
								uploader(
									:doc="doc",
									:project="project",
									@upload="uploadedDocument( doc )")

</template>

<script>
	import Uploader from "@/components/tools/files/Uploader.vue"
	export default {
		props: ["project"],
		data() {
			return {

			}
		},
		methods: {
			uploadedDocument: function( doc ){
				doc.status = "uploaded"
				this.$swal("¡Listo!", "El documento ha sido subido correctamente", "success")
			}
		},
		computed: {
			pendingDocs: function() {
				if(this.invoice && this.invoice.documents ){
					return this.invoice.documents.filter(doc => !doc.status || (doc.processed && !doc.valid))
				}else
					return []

			},
			viabilidadDocs: function() {
				let documents = this.pendingDocs //array
				let filtered = documents.filter(doc => {
					return ["escritura_propiedad", "posesion_material", "escritura_propiedad_colateral", "certificado_libertad_gravamen", "extincion_expropiacion"].includes(doc.type)
				})

				return filtered
			},
			evaluacionDocs: function() {
				let documents = this.pendingDocs //array
				let filtered = documents.filter(doc => {
					return ["plan_negocios", "estudio_mercado", "estudio_viabilidad", "estado_resultados", "estado_resultados", "estado_flujos", "balance_general", "reporte_credito"].includes(doc.type)
				})
				
				return filtered
			},
		},
		components: {
			Uploader
		}
	}
</script>

<style lang="sass">
	.invoice-publisher
	
</style>
