<template lang="pug">
	v-dialog(content-class="title-editor", :value="show", max-width="500", persistent)
		v-card
			v-card-title
				|Editar titulo
			v-card-text
				v-text-field(v-model="title")
			v-card-actions
				v-spacer
				v-btn(text, color="#B05900", @click="$emit('close')")
					|Cancelar
				v-btn(color="primary", @click="save", :loading="status.saving")
					|Guardar
</template>

<script>
	export default {
		props: ["value", "show"],
		data() {
			return {
				title: this.value,
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
					key: "title",
					value: this.title
				}

				this.$projects.put(`project/${id}`, body)
				.then(result => {
					this.$emit("update", body)
					this.$emit("close")
				})
				.catch(err => {
					console.error( err )
				})
				.finally(() => this.status.saving = false)
			}
		},
		mounted(){
			if( this.title == "Sin título" || this.title == "Cargando información...")
				this.title = ""
		}
	}
</script>

<style lang="sass">
	.title-editor
	
</style>
