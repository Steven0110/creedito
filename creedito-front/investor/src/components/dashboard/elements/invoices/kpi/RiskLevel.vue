<template lang="pug">
	.risk-level
		vue-svg-gauge(
			:start-angle="-110",
			:end-angle="110",
			:value="riskValue.level",
			:separator-step="1",
			:min="0",
			:max="3",
			:innerRadius="80",
			:gauge-color="[{ offset: 0, color: '#45a34b'}, { offset: 50, color: '#fff763'}, { offset: 100, color: '#bf3636'}]",
			:scale-interval="0.1")
		.risk-caption
			.risk-caption-title
				|Riesgo:
			.risk-caption-value(:style="riskValue.css")
				|{{ riskValue.text }}
</template>

<script>
	import { VueSvgGauge } 		from 'vue-svg-gauge'
	export default {
		props: ["risk", "totalInvested", "goal"],
		computed: {
			riskValue: function() {
				switch( this.risk ){
					case "medium":
						return {level: 2, text: "Medio", css: {color: "#dcaa39"}}
						break
					case "high":
						return {level: 3, text: "Alto", css: {color: "#c44545"}}
						break
					case "low":
						return {level: 1, text: "Bajo", css: {color: "#287a2a"}}
						break
					default:
						return {level: 0, text: "Sin definir", css: {color: "#666"}}
						break
				}
			},
		},
		components: {
			VueSvgGauge,
		}
	}
</script>

<style lang="sass">
	.risk-level
		position: relative
		padding: 25px
		.risk-caption
			position: absolute
			display: block
			width: 100%
			text-align: center
			top: 50%
			left: 0
			transform: translateY(-50%)
			.risk-caption-title
				padding-top: 50px
				text-transform: uppercase
				font-weight: 400
				font-family: Raleway
				font-size: 1.7rem
				line-height: 1.7rem
				color: #555
			.risk-caption-value
				text-transform: uppercase
				font-weight: 600
				font-size: 1.6rem
	@media only screen and (min-width: 1905px)
		.risk-level
			.risk-caption
				.risk-caption-title
				.risk-caption-value
	@media only screen and (max-width: 1904px)
		.risk-level
			padding: 0
			padding-top: 50px
			.risk-caption
				.risk-caption-title
					font-size: 1.5rem
					line-height: 1.5rem
					padding-top: 80px
				.risk-caption-value
					font-size: 1.5rem
</style>