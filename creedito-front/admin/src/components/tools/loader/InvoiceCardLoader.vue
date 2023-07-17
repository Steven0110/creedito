<template lang="pug">
	transition(name="fade-transition")
		.invoice-card-loader(v-if="show")
			v-skeleton-loader(type="card-avatar, article, actions")

</template>

<script>
	export default {
		props: ["show"]
	}
</script>

<style lang="sass">
</style>