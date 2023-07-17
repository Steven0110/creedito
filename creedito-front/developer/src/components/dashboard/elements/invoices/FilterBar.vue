<template lang="pug">
	v-sheet.filter-bar
		v-toolbar
			v-text-field(
				hide-details,
				placeholder="Buscar proyecto",
				append-icon="mdi-magnify",
				v-model="filters.searchString",
				@input="search",
				single-line)
			v-spacer
			v-spacer

			span.filters-title
				|Filtros:

			//Meta de Inversion
			v-menu(offset-y, content-class="filter-menu", :close-on-content-click="false", :close-on-click="false")
				template(v-slot:activator="{ on, attrs }")
					v-btn(v-bind="attrs", v-on="on", fab, ref="goal", color="#B05900", dark, small, elevation="0")
						v-icon
							|mdi-currency-usd
				.filter-menu.amount-filter
					.filter-title
						|Meta de inversión:
					.filter-control
						v-range-slider(
							v-model="filters.goal",
							min="100000",
							max="10000000",
							step="100000",
							ticks,
							hide-details,
							thumb-label="always")
							template(v-slot:thumb-label="item")
								.custom-filter-thumb
									|${{ item.value | currency }}
					.filter-button
						v-row
							v-spacer
							v-btn(color="primary", @click="cancelFilter", text)
								|Cancelar
							v-btn(color="primary", dark, @click="filter")
								|Filtrar
							v-spacer
			//Ordenar
			v-menu(offset-y, content-class="filter-menu", :close-on-content-click="false", :close-on-click="false")
				template(v-slot:activator="{ on, attrs }")
					v-btn(v-bind="attrs", v-on="on", fab, ref="sort", color="#B05900", dark, small, elevation="0")
						v-icon
							|mdi-sort
				.filter-menu.amount-filter
					.filter-title
						|Ordenar:
					.filter-control
						v-form(ref="", v-on:submit.prevent="")
							v-radio-group(v-model="filters.sort")
								v-radio(label="Ninguno", value="none", color="#B05900")
								v-radio(label="Meta: de mayor a menor", value="amount_asc", color="#B05900")
								v-radio(label="Meta: de menor a mayor", value="amount_desc", color="#B05900")
								v-radio(label="Progreso: de menor a mayor", value="progress_asc", color="#B05900")
								v-radio(label="Progreso: de mayor a menor", value="progress_desc", color="#B05900")
					.filter-button
						v-row
							v-spacer
							v-btn(color="primary", @click="cancelSort", text)
								|Cancelar
							v-btn(color="primary", dark, @click="sort")
								|Ordenar
							v-spacer

			v-spacer

</template>

<script>
	export default {
		props: ["value"],
		data() {
			return {
				filters: this.value
			}
		},
		methods: {
			search: function() {
				let current = this.$clone(this.filters.searchString)
				setTimeout(() => { //Ejecuta la búsqueda tras 500ms de inactividad en el campo de texto
					if( current == this.filters.searchString){
						this.$emit("search", this.filters.searchString)	
					}
				}, 500)
			},
			filter: function() {
				this.$emit("filter")
				this.$refs.goal.$el.click()
			},
			sort: function() {
				this.$emit("sort")
				this.$refs.sort.$el.click()
			},
			cancelFilter: function() {
				this.$refs.goal.$el.click()
			},
			cancelSort: function() {
				this.$refs.sort.$el.click()
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
	.filter-bar
		margin-top: 15px
		.filters-title
			vertical-align: -webkit-baseline-middle
			padding-right: 25px
			padding-left: 25px
		.v-toolbar
			.v-toolbar__content
				&>.v-btn
					margin-right: 7px


	.filter-menu
		padding: 10px
		background-color: white
		min-width: 400px
		.filter-menu.amount-filter
			.filter-title
				text-align: center
				font-family: Raleway
				font-weight: 600
				text-transform: uppercase
			.filter-control
				.v-slider
					margin-top: 30px
					margin-left: 45px
					margin-right: 45px
					.v-slider__thumb-label
						transform: none !important
						min-width: 100px !important
						border-radius: 0 !important
						top: -43px !important
						left: -50px !important
						&>div
							transform: none !important
							.custom-filter-thumb
								font-family: Roboto
								font-weight: 600
								font-size: 1rem
				.v-input.v-input--radio-group
					margin-top: 5px
			.filter-button

</style>