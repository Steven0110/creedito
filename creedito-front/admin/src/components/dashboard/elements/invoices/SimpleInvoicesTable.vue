<template lang="pug">
	transition(name="fade")
		v-card
			v-card-title.justify-center
				|FACTURAS RELACIONADAS
			v-card-text
				v-data-table.simple-invoices-table(
					:headers="headers",
					:items="invoices",
					:items-per-page="15",
					loading-text="Cargando facturas...",
					no-result-text="Sin facturas",
					no-data-text="Sin facturas")

					template(v-slot:item.FechaEmision="{ item }")
						|{{ item.FechaEmision | moment("MMMM D, h:mm:ss a")}}
					template(v-slot:item.FechaTimbrado="{ item }")
						|{{ item.FechaTimbrado | moment("MMMM D, h:mm:ss a")}}
					template(v-slot:item.Tipo="{ item }")
						v-chip(:color="typeColor(item.Tipo)", dark)
							|{{item.Tipo}}
					template(v-slot:item.Estatus="{ item }")
						v-chip(:color="statusColor(item.Estatus)", dark)
							|{{item.Estatus}}
					template(v-slot:item.Total="{ item }")
						|{{ item.Total | currency }}
</template>

<script>
	export default {
		props: ["invoices"],
		data() {
			return {
				headers: [
					{ text: "UUID", value: "UUID", align: "start" },
					{ text: "Fecha de emisión", value: "FechaEmision"},
					{ text: "Fecha de timbrado", value: "FechaTimbrado"},
					{ text: "Tipo", value: "Tipo"},
					{ text: "Estatus", value: "Estatus", sortable: false},
					{ text: "Total", value: "Total", align: "right"},
				],
			}
		},
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
		methods: {
			statusColor: function(status) {
				switch(status){
					case "Vigente":
						return "#379111"
					default:
						return "#b52e24"
				}
			},
			typeColor: function(type) {
				switch(type){
					case "Pago":
						return "#379111"
					default:
						return "#1e7fb0"
				}
			},
		}
	}
</script>

<style lang="sass">
	.simple-invoices-table
</style>