<template lang="pug">
	v-row.simulator
		v-col(cols="12", offset-lg="4", lg="4", md="8", offset-md="2")
			v-card.simulator-card(color="primary")
				v-card-text
					v-row
						v-col(cols="12")
							.simulator-title
								|Simulador de inversión
							v-slider(
								v-model="amount",
								:min="step",
								:max="remaining",
								color="white",
								track-color="#60b5af",
								:step="step",
								hide-details)
								template(v-slot:prepend)
									v-icon(color="white")
										|mdi-minus
								template(v-slot:append)
									v-icon(color="white")
										|mdi-plus
						v-col.pa-1(cols="6")
							.value-container
								.name
									|Monto de inversión:
								.value
									|{{ amount | currency }}
						v-col.pa-1(cols="6")
							.value-container
								.name
									|Ganancia estimada:
								.value
									|{{ earnings | currency }}
				v-card-actions
					v-spacer
					v-btn(color="#2b6662", dark)
						|Quiero invertir
					//.simulator-title
						|¿Cuánto deseas invertir?
					//.simulator-slider
						.selected-amount
							span
								|${{ amount | currency }} MXN
						v-slider(
							v-model="amount",
							:min="step",
							:max="remaining",
							color="#B05900",
							track-color="#fcd6ae",
							:step="step",
							hide-details)

					//.simulator-earnings.mb-6
						.simulator-earnings-title
							|Ganancia estimada:
						.simulator-earnings-amount
							span
								|${{ earnings | currency }} MXN
					//small.text-center
						|Estos datos son informativos y no representan un acuerdo entre partes.
				//v-card-actions.mt-3
					v-btn(color="primary", block, large)
						|Quiero invertir

</template>

<script>
	export default {
		props: ["invested", "goal", "roi"],
		data(){
			return {
				amount: this.step
			}
		},
		computed: {
			remaining: function() {
				return Number(this.goal || 1) - Number( this.invested )
			},
			earnings: function() {
				return this.amount * (this.roi / 100)
			},
			step: function() {
				return Math.ceil(this.remaining / 1000)
			}
		},
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
	}
</script>

<style lang="sass">
	.simulator
		.simulator-card
			padding: 25px
			padding-bottom: 10px
			text-align: center
			.simulator-title
				text-align: left
				color: white
				font-weight: 500
				font-size: 1.35rem
				margin-bottom: 30px
			.simulator-slider
				margin-bottom: 25px
				.selected-amount
					text-align: center
					color: #B05900
					font-size: 1.5rem
					font-weight: 600
					padding-top: 7px
					padding-bottom: 7px
					span
						border-radius: 5px
						//border: 2px solid #B05900
						padding-left: 35px
						padding-right: 35px
						padding-top: 7px
						padding-bottom: 7px
			.value-container
				border-radius: 7px
				background-color: #2b6662
				text-align: center
				padding: 15px
				color: white
				.name
					font-family: Roboto
					font-size: 1.1em
					text-transform: uppercase
				.value
					margin-top: 15px
					font-family: Roboto
					font-size: 1.7em
					font-weight: bold
			.simulator-earnings
				.simulator-earnings-title
					text-align: center
					color: #999
					font-weight: 500
					font-size: 1.35rem
					margin-bottom: 20px
				.simulator-earnings-amount
					text-align: center
					color: #176580
					font-size: 2rem
					font-weight: 600
					padding-top: 7px
					padding-bottom: 7px
					span
						border-radius: 5px
						border: 2px solid #176580
						padding-left: 35px
						padding-right: 35px
						padding-top: 7px
						padding-bottom: 7px
</style>