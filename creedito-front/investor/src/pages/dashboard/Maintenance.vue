<template lang="pug">
	.maintenance
		.content
			.image-container
				img(src="/assets/images/logo.jpg")
			.maintenance-text
				|Sección en proceso de desarrollo
</template>

<style lang="sass">
	.maintenance
		position: relative
		min-height: calc(100vh - 30px)
		.content
			position: absolute
			width: 100%
			top: 50%
			transform: translateY(-50%)
			.image-container
				text-align: center
				img
					display: inline-block
					width: 300px
					max-width: 90%
			.maintenance-text
				font-family: Raleway
				font-size:1.8em
				text-align: center
				letter-spacing: 1px
				font-weight: 700
				text-transform: uppercase
				padding-top: 20px
	@media only screen and (min-width: 1904px)
	@media only screen and (max-width: 1903px)
	@media only screen and (max-width: 1264px)
	@media only screen and (max-width: 960px)
	@media only screen and (max-width: 600px)

</style>