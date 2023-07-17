<template lang="pug">
	transition(name="fade-transition")
		.field()
			.field-name
				|{{ name }}
				v-tooltip(v-if="tooltip", bottom, max-width="300")
					template(v-slot:activator="{ on, attrs }")
						v-icon.ml-1(color="primary", v-on="on", v-bind="attrs", size="18")
							|mdi-help-circle-outline
					span
						|{{ tooltip }}
			.field-value
				|{{ formattedValue }}
</template>

<script>
	export default {
		props: ["name", "value", "type", "tooltip"],
		computed: {
			formattedValue: function() {
				if( this.value ){
					switch( this.type ){
						case "percentage":
							return `${this.value}%`
						case "date":
							return this.$moment( this.value ).format("LL")
						case "currency":
							return "$" + parseFloat( this.value ).toFixed(2).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						default:
							return this.value
					}
				}else
					return "N/A"
			}
		}
	}
</script>

<style lang="sass">
	.field
		.field-name
			color: #3f9690
			font-family: Roboto
			text-transform: uppercase
			font-weight: 600
			font-size: 0.7rem
			letter-spacing: 1px
		.field-value
			font-family: Roboto
			color: #666
			font-size: 1rem
	
</style>