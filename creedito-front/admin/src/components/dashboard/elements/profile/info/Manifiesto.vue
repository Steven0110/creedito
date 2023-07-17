<template lang="pug">
	.manifest
		v-row
			v-spacer
			v-btn(color="primary", @click="status.show.dialog = true", v-if="!agreed")
				|Leer y firmar manifiesto
			v-btn(color="success", v-else)
				|Manifiesto firmado
				v-icon(color="white")
					|mdi-check
			v-spacer

		manifest-dialog(v-model="status.show.dialog", @close="status.show.dialog = false")

</template>
	
<script>
	import ManifestDialog 	from "@/components/dashboard/elements/profile/info/manifest/ManifestDialog.vue"
	export default {
		data() {
			return {
				status: {
					show: {
						dialog: false
					}
				}
			}
		},
		computed: {
			agreed: function() {
				return false
			}
		},
		methods: {
		},
		components: {
			ManifestDialog
		}
	}
</script>

<style lang="sass">
	.manifest
		padding-top: 15px
		padding-bottom: 15px
	@media only screen and (min-width: 1904px)
		.manifest
	@media only screen and (max-width: 1903px)
		.manifest
	@media only screen and (max-width: 1264px)
		.manifest
	@media only screen and (max-width: 960px)
		.manifest
</style>