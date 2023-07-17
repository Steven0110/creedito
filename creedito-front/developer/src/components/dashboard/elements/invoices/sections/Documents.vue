<template lang="pug">
	.project-documents
		v-row(v-if="documents.length > 0")
			v-col(md="4", v-for="doc in documents", :key="doc.type")
				uploader(
					:doc="doc",
					@upload="uploadedDocument( doc )")
</template>

<script>
	import Uploader from "@/components/tools/files/Uploader.vue"

	export default {
		props: ["pendingDocuments"],
		computed: {
			documents: function() {
				let docs = this.pendingDocuments
				for( let i = 0 ; i < docs.length ; i++ ){
					let doc = docs[ i ]
					doc.status = null
					switch(doc.type){
						case "ine_anverso":
						case "ine_reverso":
							doc.uploadText = "Da click o arrastra una imagen"
							doc.accept = "image/*"
							doc.helper = {
								images: [
									"/assets/images/helper01.jpg",
									"/assets/images/helper02.jpg",
								],
								title: "Guía para captura de documentos"
							}
							break
					}
				}

				return docs
			}
		},
		methods: {
			uploadedDocument: function( doc ){
				this.$swal("¡Listo!", "El documento ha sido subido correctamente.", "success")
				doc.status = "processing"
			}
		},
		components: {
			Uploader
		}
	}
</script>

<style lang="sass">
	.project-documents
	
</style>