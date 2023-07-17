<template lang="pug">
	v-row
		v-col(cols="12")
			.description(v-html="value")

		v-col(cols="12", md="2", offset-md="5")
			v-btn(color="#ba7127", dark, block, @click="showEditor = true")
				|Editar descripción
				v-icon(right)
					|mdi-pencil
		description-editor(
			:show="showEditor",
			v-model="description",
			@close="showEditor = false",
			@update="update")
</template>

<script>
	import DescriptionEditor 	from "@/components/dashboard/elements/invoices/editors/DescriptionEditor.vue"
	export default {
		props: ["value"],
		data() {
			return {
				showEditor: false,
				description: this.value
			}
		},
		methods: {
			update: function(value) {
				this.$emit("input", value)
				this.$emit("updated", value)
				this.showEditor = false
			}
		},
		components: {
			DescriptionEditor
		},
	}
</script>

<style lang="sass">
	.description
		font-family: Raleway
</style>