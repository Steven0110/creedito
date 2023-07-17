<template lang="pug">
	v-dialog(content-class="description-editor", :value="show", max-width="800", persistent)
		v-card
			v-card-title
				|Editar descripción
			v-card-text
				vue-editor(v-model="description", :editorToolbar="options")
			v-card-actions
				v-spacer
				v-btn(text, color="#B05900", @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="save", :loading="status.saving")
					|Guardar
</template>

<script>
	import { VueEditor } from "vue2-editor";
	export default {
		props: ["value", "show"],
		data() {
			return {
				description: this.value,
				options:  [
					[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
					["bold", "italic", "underline", "strike"],
					["blockquote", "code-block"],
					[{ 'list': 'ordered'}, { 'list': 'bullet' }],
					[{ 'indent': '-1'}, { 'indent': '+1' }],
					[{ 'align': [] }],
				],
				status: {
					saving: false
				}
			}
		},
		methods: {
			save: function() {

				this.status.saving = true

				/*	Guarda en DB 	*/
				const id = this.$route.params.id
				const body = {
					key: "description",
					value: this.description
				}

				this.$projects.put(`project/${id}`, body)
				.then(result => {
					this.$emit("update", this.description)
				})
				.catch(err => {
					console.error( err )
				})
				.finally(() => this.status.saving = false)
			}
		},
		mounted(){
			//if( this.description == "")
			//	this.description = ""
		},
		components: {
			VueEditor
		}
	}
</script>

<style lang="sass">
	.description-editor
	
</style>
