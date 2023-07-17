<template lang="pug">
	transition(name="fade-transition")
		.row-card-loader(v-if="show")
			v-row
				v-col(md="3", cols="12")
					v-skeleton-loader(type="card")
				v-col(md="3", cols="12")
					v-skeleton-loader(type="card")
				v-col(md="3", cols="12")
					v-skeleton-loader(type="card")
				v-col(md="3", cols="12")
					v-skeleton-loader(type="card")

</template>

<script>
	export default {
		props: ["show"]
	}
</script>

<style lang="sass">
</style>