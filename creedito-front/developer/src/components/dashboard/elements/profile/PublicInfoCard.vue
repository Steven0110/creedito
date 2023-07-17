<template lang="pug">
	v-card.public-info-card
		v-card-title.pb-0
			|Información pública
		v-card-text
			.text.mb-2
				|Esta información será visible para los inversionistas
			v-row
				v-col(cols="12", md="4")
					v-img(:src="companyImage")
						v-btn(absolute, bottom, right, color="primary", small, @click="status.show.uploader = true")
							|Cambiar
							v-icon(right)
								|mdi-upload
				v-col(cols="12", md="8")
					field(name="Razón social alternativa", :value="company.taxName", tooltip="Aplicable solo en caso de publicar como personal moral")
					field(name="Fecha de constitución", :value="company.constitutionDate", tooltip="En caso de ser persona física representa la fecha de inscripción en el Registro Federal de Contribuyentes", type="date")
					field(name="Dirección fiscal", :value="company.taxAddress")
					field(name="Sitio Web", :value="company.websiteURL")
					field(name="Ingresos anuales", :value="company.annualIncome", type="currency", tooltip="Monto del último año")
					field(name="Capital contable", :value="company.equity", type="currency", tooltip="Capital contable con el que opera la empresa actualmente")

		v-card-actions
			v-spacer
			v-btn(color="primary", text, @click="status.show.updater = true")
				|Editar
				v-icon(right, color="primary")
					|mdi-pencil-outline

		image-uploader-dialog(:show="status.show.uploader", @close="status.show.uploader = false", v-if="status.show.uploader")
		public-info-dialog(:show="status.show.updater", @close="status.show.updater = false", :company="company", @update="update", v-if="status.show.updater")
</template>

<script>
	import Field 				from "@/components/info/Field.vue"
	import ImageUploaderDialog 	from "@/components/tools/files/ImageUploaderDialog.vue"
	import PublicInfoDialog 	from "@/components/dashboard/elements/profile/dialogs/PublicInfoDialog.vue"

	export default {
		data() {
			return {
				status: {
					show: {
						uploader: false,
						updater: false
					}
				}
			}
		},
		methods: {
			update: function( company ){
				this.$store.commit("setUserData", {"key": "company", "value": company})
			}
		},
		computed: {
			company: function() {
				return this.$store.getters.user.company || {}
			},
			companyImage: function() {
				if( this.company.image )
					return `${this.S3_BASE}/${this.company.image}`
				else
					return '/assets/images/company-placeholder.png'
			}
		},
		components: {
			Field,
			ImageUploaderDialog,
			PublicInfoDialog
		}
	}
</script>

<style lang="sass">
	.public-info-card
		.v-card__title
			text-transform: uppercase
			letter-spacing: 1px
			color: black
			font-size: 1rem
			font-weight: 600
</style>