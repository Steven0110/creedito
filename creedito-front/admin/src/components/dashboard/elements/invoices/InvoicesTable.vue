<template lang="pug">
	v-data-table.invoices-table(
		:headers="headers",
		:items="invoices",
		loading-text="Cargando facturas...",
		no-result-text="Sin facturas",
		no-data-text="Sin facturas",
		:loading="loading")

		template(v-slot:item.createdAt="{ item }")
			|{{ item.createdAt | moment("MMMM D, h:mm:ss a")}}
		template(v-slot:item.status="{ item }")
			v-chip(:color="statusColor(item.status)", :dark="dark(item.status)")
				|{{ item.status | statusText }}
		template(v-slot:item.createdAt="{ item }")
			|{{ item.createdAt | moment("MMMM D, h:mm:ss a")}}
		template(v-slot:item.total="{ item }")
			|{{ item.total | currency }}
		template(v-slot:item._id="{ item }")
			.actions
				v-tooltip(bottom, max-width="300px", v-if="item.status == 'published'")
					template(v-slot:activator="{ on, attrs }")
						v-icon.mr-3(color="primary", v-bind="attrs", v-on="on", @click="")
							|mdi-currency-usd
					span
						|Estado financiero
				v-tooltip(bottom, max-width="300px", v-if="item.status == 'waiting' || item.status == 'published'")
					template(v-slot:activator="{ on, attrs }")
						v-icon.mr-3(color="primary", v-bind="attrs", v-on="on", @click="view(item._id)")
							|mdi-eye
					span
						|Ver factura
				v-tooltip(bottom, max-width="300px", v-if="item.status == 'revision'")
					template(v-slot:activator="{ on, attrs }")
						v-icon.mr-3(color="primary", v-bind="attrs", v-on="on", @click="review(item._id)")
							|mdi-file
					span
						|Revisar
				v-tooltip(bottom, max-width="300px")
					template(v-slot:activator="{ on, attrs }")
						v-icon.mr-3(color="primary", v-bind="attrs", v-on="on", @click="download(item.key, item.developer.username, item.uuid)")
							|mdi-download
					span
						|Descargar
</template>

<script>
	export default {
		props: ["invoices", "headers", "loading"],
		filters: {			
			statusText: function(value) {
				switch(value){
					case "waiting":
						return "Pendiente"
					case "rejected":
						return "Rechazada"
					case "published":
						return "Publicada"
					case "publishing":
						return "Publicación"
					case "finished":
						return "Finalizada"
					case "revision":
						return "Pendiente"
					default:
						return "Sin definir"
				}
			},
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
		methods: {
			download: function(key, username, uuid) {
				let resource = `download?key=${key}&username=${username}`
				let config = {responseType: 'arraybuffer'}

				return this.$fileserver.get(resource, config)
				.then(result => {

					const url = window.URL.createObjectURL(new Blob([ result.data ]))
		            const link = document.createElement('a')
		            link.href = url
		            link.setAttribute('download',`Factura-${uuid}.xml`)
		            document.body.appendChild(link)
		            link.click()

				})
				.catch(err => {
					this.$report( err )
				})
			},
			view: function(id) {
				this.$router.push(`/dashboard/factura/visualizar/${id}`)
			},
			review: function(id) {
				this.$router.push(`/dashboard/factura/revisar/${id}`)
			},
			statusColor: function(status) {
				switch(status){
					case "waiting":
						return "#cc8135"
					case "rejected":
						return "#e84337"
					case "published":
						return "#75cd51"
					case "publishing":
						return "#cc8135"
					case "finished":
						return "#3d63ee"
					case "revision":
						return "#cc8135"
					default:
						return "#b7c9c7"
				}
			},
			dark: function(status) {
				switch(status){
					case "waiting":
					case "finished":
					case "revision":
					case "rejected":
					case "published":
					case "publishing":
						return true
					default:
						return false
				}
			}
		}
	}
</script>

<style lang="sass">
	.invoices-table
</style>