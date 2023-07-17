<template lang="pug">
	v-row.simulator
		v-col(cols="12", md="4", offset-md="4")
			v-card.simulator-card
				v-card-title
					v-spacer
					v-icon(color="#B05900", size="50")
						|mdi-cash-usd
					v-spacer
				v-card-text
					.simulator-title
						|¿Cuánto deseas invertir?
					.simulator-slider
						.selected-amount
							span
								|${{ amount | currency }} MXN
						v-slider(
							v-model="amount",
							:min="min",
							:max="max",
							color="#B05900",
							track-color="#fcd6ae",
							step="1000",
							hide-details)

					.simulator-earnings.mb-6
						.simulator-earnings-title
							|Ganancia estimada:
						.simulator-earnings-amount
							span
								|${{ earnings | currency }} MXN
					small.text-center
						|Estos datos son informativos y no representan un acuerdo entre partes.
				v-card-actions.mt-3
					v-btn(color="primary", block, large)
						|Quiero invertir

</template>

<script>
	export default {
		props: ["invested", "goal", "roi"],
		data(){
			return {
				amount: 1000
			}
		},
		computed: {
			min: function() {
				return 1000
			},
			max: function() {
				return this.remaining
			},
			remaining: function() {
				return Number(this.goal.amount || 1) - Number( this.invested )
			},
			earnings: function() {
				return this.amount * (this.roi / 100)
			}
		},
		filters: {
			currency: function( value ) {
				return parseFloat(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
	}
</script>

<style lang="sass">
	.simulator
		.simulator-card
			padding: 25px
			text-align: center
			.simulator-title
				text-align: center
				color: #999
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