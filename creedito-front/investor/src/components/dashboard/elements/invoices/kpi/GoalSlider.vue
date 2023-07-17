<template lang="pug">
	.goal-slider
		v-progress-linear(:value="value", color="#B05900")
		.invested-total
			|${{ totalInvested | currency }} MXN
		.goal-remain
			|fondeado de ${{ goal | currency }} MXN
</template>

<script>
	export default {
		props: ["value", "totalInvested", "goal"],
		filters: {
			currency: function( value ) {
				return parseFloat(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
	}
</script>

<style lang="sass">
	.goal-slider
		.invested-total
			color: #B05900
			font-size: 1.8rem
			font-weight: 500
			padding-top: 15px
			line-height: 2rem
		.goal-remain
			color: #777
			font-size: 1rem
</style>