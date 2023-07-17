<template lang="pug">
	v-dialog(content-class="developer-summary", persistent, max-width="400", :value="show")
		v-card
			v-img(
				v-if="$store.getters.currentDeveloper.profilePicture",
				:src="$store.getters.currentDeveloper.profilePicture",
				max-height="300")
			v-card-title
				|{{ $store.getters.currentDeveloper.name || 'Cargando información ...' }}
			v-card-text
				invoice-card-loader(v-if="!$store.getters.currentDeveloper._id")
				.developer-summary-container(v-else)

					.summary-field
						|Email:
					.summary-value
						|{{ $store.getters.currentDeveloper.username }}

					.summary-field
						|Última sesión:

					.summary-value
						|{{ $store.getters.currentDeveloper.lastSession | moment('MMMM D, h:mm:ss a') }}

					.summary-field
						|Búsqueda en listas negras:

					blacklist(:result="$store.getters.currentDeveloper.searchResults")
						
			v-card-actions
				v-spacer
				v-btn(text, color="secondary", @click="$emit('close')")
					|Cerrar
</template>

<script>
	import InvoiceCardLoader from "@/components/tools/loader/InvoiceCardLoader.vue"
	import Blacklist from "@/components/dashboard/elements/users/Blacklist.vue"

	export default {
		props: ["show"],
		methods: {
		},
		mounted() {
			if( this.$store.getters.currentInvoice.developer._id ){
				/*	Consulta y settea el solicitante */
				this.$developers.get(`find/${this.$store.getters.currentInvoice.developer._id}`)
				.then(result => this.$store.commit("setCurrentDeveloper", result.data.developer))
				.catch(err => this.$report(err, {swal: true}) )
			}
		},
		activated() {
			console.log("activated ds")
		},
		components: {
			Blacklist,
			InvoiceCardLoader,
		}
	}
</script>

<style lang="sass">
	.developer-summary
			
		&::-webkit-scrollbar-track
			-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
			background-color: rgba(255, 255, 255, 0.2)
		&::-webkit-scrollbar
			width: 10px
			background-color: rgba(255, 255, 255, 0.2)
		&::-webkit-scrollbar-thumb
			background-color: #176580
			
		.summary-field
			color: #176580
			margin-top: 10px
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 0.7rem
			letter-spacing: 1px
		.summary-value
			font-family: Roboto
			color: #666
			font-size: 1rem
</style>