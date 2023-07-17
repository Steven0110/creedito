<template lang="pug">
	.investus-menu
		//Menú Desktop
		.desktop.d-none.d-md-block
			v-navigation-drawer(absolute, permanent, floating, color="primary", dark)

				v-list
					v-list-item(two-line)
						v-list-item-avatar
							img(:src="userPicture")
						v-list-item-content
							v-list-item-title
								|{{$store.getters.user.name}}
							v-list-item-subtitle
								|Solicitante
					
					v-divider

					v-list-item(link, exact, :to="{path: '/dashboard'}")
						v-list-item-icon
							v-icon
								|mdi-home
						v-list-item-content
							v-list-item-title
								|Inicio
								
					v-list-item(link, exact, :to="{path: '/dashboard/facturas'}")
						v-list-item-icon
							v-icon
								|mdi-domain
						v-list-item-content
							v-list-item-title
								|Mis facturas
								
					v-list-item(link, exact, :to="{path: '/dashboard/documentos'}")
						v-list-item-icon
							v-icon
								|mdi-file-document
							v-badge(
								color="yellow",
								dot,
								v-if="$store.getters.user.pendingDocuments && $store.getters.user.pendingDocuments.length > 0")
						v-list-item-content
							v-list-item-title
								|Documentos


					v-list-group.custom-list-group(prepend-icon="mdi-settings")
						template(v-slot:activator)
							v-list-item-content
								|Ajustes
						v-list-item.list-child(link, exact, :to="{path: '/dashboard/perfil'}")
							v-list-item-content
								v-list-item-title
									|Perfil
						v-list-item.list-child(link, exact, :to="{path: '/dashboard/autenticacion'}")
							v-list-item-content
								v-list-item-title
									|Autenticación
					v-list-item(link, exact, @click="logout")
						v-list-item-icon
							v-icon
								|mdi-logout
						v-list-item-content
							v-list-item-title
								|Cerrar sesión

				template(v-slot:append)
					.last-session(v-if="$store.getters.user.lastSession")
						|Última sesión: {{ $moment($store.getters.user.lastSession).format("MMMM D, h:mm:ss a") }}

		//Menú Mobile
		.mobile.d-block.d-md-none
			v-navigation-drawer(absolute, temporary, v-model="drawer", color="primary", dark)
				v-list(dense)
					v-list-item(two-line)
						v-list-item-avatar
							img(:src="userPicture")
						v-list-item-content
							v-list-item-title
								|{{$store.getters.user.name}}
							v-list-item-subtitle
								|Inversionista

					v-list-item(link, exact, :to="{path: '/dashboard/'}")
						v-list-item-icon
							v-icon
								|mdi-home
						v-list-item-content
							v-list-item-title
								|Inicio

					v-list-item(link, exact, :to="{path: '/dashboard/facturas'}")
						v-list-item-icon
							v-icon
								|mdi-domain
						v-list-item-content
							v-list-item-title
								|Mis facturas

					v-list-item(link, exact, :to="{path: '/dashboard/documentos'}")
						v-list-item-icon
							v-icon
								|mdi-file-document
							v-badge(
								color="yellow",
								dot,
								v-if="$store.getters.user.pendingDocuments && $store.getters.user.pendingDocuments.length > 0")
						v-list-item-content
							v-list-item-title
								|Documentos


					v-list-item(link, exact, @click="logout")
						v-list-item-icon
							v-icon
								|mdi-logout
						v-list-item-content
							v-list-item-title
								|Cerrar sesión


				template(v-slot:append)
					.last-session(v-if="$store.getters.user.lastSession")
						|Última sesión: {{ $moment($store.getters.user.lastSession).format("MMMM D, h:mm:ss a") }}
</template>

<script>
	export default{
		data() {
			return {
				drawer: false,
				navigation: null
			}
		},
		computed: {
			userPicture: function() {
				return this.$store.getters.user.picture || "/assets/icons/avatar_male.svg"
			}
		},
		methods: {
			toggle: function() {
				this.drawer =! this.drawer
			},
			logout: function() {
				
				this.$swal({
					title: "¿Estás seguro que deseas cerrar tu sesión?",
					type: "warning",
					confirmButtonText: "Sí, cerrar sesión.",
					cancelButtonText: "No, regresar.",
					showLoaderOnConfirm: true,
					showCancelButton: true,
					reverseButtons: true,
					preConfirm: () => {
						let resource = "logout"
						return this.$auth.get( resource )
					}
				})
				.then(result => {
					if(!result.dismiss){
						this.$store.commit("setSessionActive", false)
						this.$swal({
							title: `Sesión cerrada exitosamente.`,
							text: "",
							type: "success",
							showConfirmButton: false,
							timer: 3000,
							onClose: () => {
								this.$router.push({path: "/"})
							}
						})
					}
				})
				.catch(err => {
					console.log( err )
				})
			}
		}
	}
</script>

<style lang="sass">
	.investus-menu	
		.menu-logo
			text-align: center
			padding-top: 15px
			img
				max-width: 50%
				display: inline-block

		.custom-list-group
			.list-child
				padding-left: 25px

		.custom-list-group
			&.v-list-group--active
				color: white !important
				caret-color: white !important
				background-color: rgba(255, 255, 255, 0.15)
		.last-session
			color: white
			text-align: center
			font-size: 11px
			padding-bottom: 5px
</style>