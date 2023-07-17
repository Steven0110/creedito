<template lang="pug">
	v-app(id="admin-app")
		v-content
			transition(name="slide-x-transition", mode="out-in")
				router-view

</template>

<script>
</script>