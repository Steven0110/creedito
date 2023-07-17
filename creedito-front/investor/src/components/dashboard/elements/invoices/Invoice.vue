<template lang="pug">
	v-col(cols="12", md="6", lg="4", xl="3")
		v-card.invoice-card(min-height="320")
			v-img(src="/assets/images/factura.png", height="200", lazy-src="/assets/images/image-loader.jpg")
				v-progress-linear(:value="invoice.progress || 0", height="25", absolute, bottom, color="primary", v-show="invoice.status != 'new'")
					strong.white--text
						|{{invoice.progress || 0}}%
				template(v-slot:placeholder)
					v-row.fill-height.ma-0(align="center", justify="center")
						v-progress-circular(indeterminate, color="grey lighten-5")
				v-chip(color="primary")
					|{{ invoice.total | currency }}
			v-card-title
				|{{ invoice.emisor.nombre }}
				//.invoice-status
					.status-indicator(:style="statusColor")
					.status-text
						|{{ statusText }}
			v-card-text
				|Factura para {{ invoice.receptor.nombre }} disponible para su fondeo
			v-card-actions
				v-spacer
				v-tooltip(bottom)
					template(v-slot:activator="{ on, attrs }")
						v-icon(right, @click="$router.push({path: `/dashboard/factura/visualizar/${invoice._id}`})", v-bind="attrs", v-on="on", color="primary")
							|mdi-eye
					span
						|Ver factura

</template>

<script>

	export default {
		props: ["invoice"],
		methods: {
		},
		computed: {
			statusColor: function() {
				let style = {}
				switch(this.invoice.status){
					case "checking":
						style["background-color"] = "#f2a556"
						break
					case "rejected":
						style["background-color"] = "#e84337"
						break
					case "published":
						style["background-color"] = "#75cd51"
						break
					case "finished":
						style["background-color"] = "#3d63ee"
						break
					case "revision":
					default:
						style["background-color"] = "#b7c9c7"
						break
				}

				return style
			},
			statusText: function() {
				switch(this.invoice.status){
					case "revision":
						return "En revisión"
					case "rejected":
						return "Rechazado"
					case "published":
						return "Publicado"
					case "finished":
						return "Finalizado"
					case "waiting":
						return "Pendiente"
					default:
						return "Sin definir"
				}
			}
		},
		filters: {
			currency: function( value ) {
				return "$" + parseFloat(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			},
		},
		methods: {
			deleteDraft: function() {

				this.$swal({
					title: "¿Estás seguro que deseas eliminar este borrador?",
					text: "No podrás recuperar la información que hayas guardado",
					type: "warning",
					confirmButtonText: "Sí.",
					cancelButtonText: "No, cancelar.",
					showLoaderOnConfirm: true,
					showCancelButton: true,
					reverseButtons: true,
					preConfirm: () => {
						return this.$invoices.delete( `invoice/${this.invoice._id}` )
					}
				})
				.then(result => {
					if( result && result.value && result.value.data ){
						this.$swal("Borrador eliminado exitosamente", "", "success")
						this.$emit("delete")
					}else if(!result.dismiss)
						this.$swal("Error", "Hubo un error al eliminar el borrador, por favor vuelve a intentarlo.", "warning")
				}).
				catch(err => {
					console.error( err )
					this.$swal("Error", "Hubo un error al eliminar el borrador, por favor vuelve a intentarlo.", "warning")
					this.$sentry.captureException( new Error(err) )
				})
			}
		}
	}
</script>

<style lang="sass">
	.invoice-card
		.v-card__title
			position: relative
			padding-right: 120px
			.invoice-status
				position: absolute
				top: 15px
				right: 20px
				.status-indicator
					display: inline-block
					height: 13px
					width: 13px
					border-radius: 50%
					margin-right: 5px
				.status-text
					display: inline-block
					font-size: 1rem
					font-weight: 400
		.v-image
			.v-chip
				position: absolute
				right: 10px
				top: 10px

		.invoice-description
		.invoice-specs
			text-align: center
			.invoice-spec-title
				text-transform: uppercase
				font-family: Raleway
				font-weight: 800
				color: #777
			.invoice-spec-value
				color: #B05900
				font-weight: 600
				font-size: 1.25rem
</style>