<template lang="pug">
	v-row.invoice-rule
		v-col.text-right.pt-0.pb-1(cols="8")
			|{{ name }}
		v-col.pl-0.pt-0.pb-1(cols="4")
			v-icon(color="green", v-if="ok")
				|mdi-check-circle
			v-icon(color="red", v-else)
				|mdi-close-circle
</template>

<script>
	export default {
		props: ["name", "ok"]
	}
</script>

<style lang="sass">
	.invoice-rule
</style>