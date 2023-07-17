<template lang="pug">
	.validated-account
		v-row
			v-col.pt-0.pb-0(cols="12", md="4", offset-md="4")
				v-row
					v-col.pt-0.pb-0(cols="12")
						.validated-account-panel
							img.validated-account-logo(src="/assets/images/logo.png")
							p.dashboard-title
								|Desbloqueo exitoso
							p.simple-message
								span
									|Tu cuenta ha sido desbloqueada exitosamente, ahora puedes iniciar sesión en Investus.
							p.login-message
								router-link(:to="{path: '/login'}")
									|Iniciar sesión
							
							.copyright
								p
									|Copyright Creedito &copy; 2021
								p
									span
										router-link(:to="{path: '/'}")
											|Términos de uso 
									span
										|/ 
									span
										router-link(:to="{path: '/'}")
											|Política de privacidad

			.contact.d-none.d-md-block
				.social-networks
					.social-icon
						a(href="https://www.facebook.com/#", target="_blank")
							v-img(src="assets/icons/ic_facebook.svg")
					.social-icon
						a(href="https://twitter.com/#", target="_blank")
							v-img(src="assets/icons/ic_twitter.svg")
					.social-icon
						a(href="https://www.instagram.com/#", target="_blank")
							v-img(src="assets/icons/ic_instagram.svg")
				//.contact-info
					.contact-item
						.contact-icon
							v-img(src="assets/icons/ic_communicate.svg")
						span
							|+55 1234 5678
					.contact-item
						.contact-icon
							v-img(src="assets/icons/ic_communicate.svg")
						span
							|contacto@creedito.mx

</template>

<style lang="sass">
	.validated-account
		background: url("/assets/images/login-wallpaper.webp")
		background-repeat: no-repeat
		background-size: cover
		background-position: center
		height: 100vh

		&>.row
			height: 100%
			&>div
				&>.row
					height: 100%
		.validated-account-panel
			background-color: rgba(255, 255, 255, 0.9)
			position: relative
			top: 50%
			transform: translateY(-50%)
			text-align: center
			padding: 35px
			.validated-account-logo
				display: inline-block
				max-height: 150px
			.dashboard-title
				text-align: center
				letter-spacing: 3px
				text-transform: uppercase
				font-size: 26px
				font-weight: 700
				font-family: Raleway
			.simple-message
				font-size: 18px
				font-family: Raleway
				font-weight: 600
				color: #555555
			.create-account
				text-align: center
				color: #aaa
				font-family: Raleway, sans-serif
				font-weight: 700
				a
					padding-left: 5px
					font-size: 12pt
					font-family: Raleway, sans-serif
					font-weight: 800
					color: #3f9690
					text-decoration: none
					transition: 0.1s linear all
					&:hover
						transition: 0.1s linear all
						color: #4f7fbf
						text-decoration: none
			.login-message
				text-align: center
				margin-bottom: 25px
				a
					position: relative
					display: inline-block
					color: #3f9690
					font-size: 20px
					font-family: Raleway, sans-serif
					font-weight: 800
					text-decoration: none
					letter-spacing: 1px
					transition: 0.1s linear all
					padding-left: 20px
					padding-right: 20px
					overflow: hidden
					&:before
						position: absolute
						content: ''
						left: -100%
						background-color: #3f9690
						height: 2px
						width: 100%
						bottom: 0
						transition: 0.2s linear all
					&:hover
						transition: 0.1s linear all
						color: #2963b4
						text-decoration: none
						&:before
							left: 0
							transition: 0.2s linear all
			.copyright
				position: absolute
				width: 100%
				bottom: 5px
				left: 0
				p
					text-align: center
					margin-bottom: 0px
					font-family: Raleway, sans-serif
					font-size: 8pt
					font-weight: 700
					span
						a
							color: black
							text-decoration: none
							transition: 0.2s linear all
							&:hover
								color: #2963b4
								text-decoration: none
								transition: 0.2s linear all

		.contact
			text-align: right
			padding-right: 40px
			position: absolute
			right: 0
			bottom: 15px
			.social-networks
				text-align: right
				.social-icon
					display: inline-block
					height: 15px
					width: 15px
					margin-left: 15px
					transition: 0.2s linear all
					&:hover
						border-bottom: 1px solid white
						transition: 0.2s linear all
			.contact-info
				margin-top: 5px
				.contact-item
					display: inline-block
					margin-left: 15px
					.contact-icon
						height: 14px
						width: 14px
						display: inline-block
						margin-right: 5px
					span
						display: inline-block
						color: white
						font-family: Raleway, sans-serif
						font-size: 10pt
						font-weight: 600
	@media only screen and (max-width: 768px)
		.validated-account
			height: 100%

			&>.row
				//min-height: 100vh
				&>div
					//height: 100%
					&>.row
						//height: 100%
			.validated-account-panel
				padding-left: 30px
				padding-right: 30px
				min-height: 100%
				.simple-message
					text-align: center
				.copyright
					position: relative
					margin-top: 30px
					p
						font-size: 16px
	@media only screen and (max-width: 640px)
		.validated-account
			.validated-account-panel
				.forgot-password
					text-align: center
					margin-bottom: 5px
</style>