import Login 			from "@/pages/Login.vue"
import Register			from "@/pages/Register.vue"
import Forgot			from "@/pages/Forgot.vue"
import ResetAccount		from "@/pages/ResetAccount.vue"
import Unlock			from "@/pages/Unlock.vue"

/*	Status 	*/
import ValidatedAccount from "@/pages/status/ValidatedAccount.vue"
import ValidateError 	from "@/pages/status/ValidateError.vue"
import UnlockedAccount 	from "@/pages/status/UnlockedAccount.vue"
import UnlockError 		from "@/pages/status/UnlockError.vue"
import ResetNoQuestions from "@/pages/status/ResetNoQuestions.vue"
import InvalidReset 	from "@/pages/status/InvalidReset.vue"

/*	Dashboard Panel 	*/
import Dashboard		from "@/pages/Dashboard.vue"
/*	Dashboard subpanels 	*/
import MainPanel		from "@/pages/dashboard/MainPanel.vue"
import AuthPanel		from "@/pages/dashboard/AuthPanel.vue"
import Maintenance		from "@/pages/dashboard/Maintenance.vue"
import Documents		from "@/pages/dashboard/sections/Documents.vue"
import Invoices			from "@/pages/dashboard/sections/Invoices.vue"
import InvoiceViewer	from "@/pages/dashboard/sections/InvoiceViewer.vue"
import InvoicePublish 	from "@/pages/dashboard/sections/InvoicePublish.vue"
import InvoicePrePublish from "@/pages/dashboard/sections/InvoicePrePublish.vue"
import Profile			from "@/pages/dashboard/sections/Profile.vue"

export default [
	{
		path: '/',
		redirect: "login",
	},
	{
		path: '/login',
		component: Login,
		name: "Login"
	},
	{
		path: '/register',
		component: Register,
		name: "Registro"
	},
	{
		path: '/forgot',
		component: Forgot,
		name: "Olvidé mi contraseña"
	},
	{
		path: '/reset-account',
		component: ResetAccount,
		name: "Reestablecer"
	},
	{
		path: '/unlock',
		component: Unlock,
		name: "Desbloquear"
	},
	{
		path: '/validated-account',
		component: ValidatedAccount,
		name: "Cuenta validada"
	},
	{
		path: '/validate-error',
		component: ValidateError,
		name: "Error de enlace"
	},
	{
		path: '/unlocked-account',
		component: UnlockedAccount,
		name: "Cuando desbloqueada"
	},
	{
		path: '/unlock-error',
		component: UnlockError,
		name: "Error en desbloqueo"
	},
	{
		path: '/invalid-reset',
		component: InvalidReset,
		name: "Enlace inválido"
	},
	{
		path: '/reset-no-questions',
		component: ResetNoQuestions,
		name: "Error"
	},
	
	/*	Dashboard 	*/
	{
		path: '/dashboard',
		component: Dashboard,
		children: [
			{
				path: '/',
				components: {
					panel: Profile
				},
				name: "Dashboard"
			},
			{
				path: 'autenticacion',
				components: {
					panel: AuthPanel
				},
				name: "Autenticación"
			},
			{
				path: 'documentos',
				components: {
					panel: Documents
				},
				name: "Documentos"
			},
			{
				path: 'perfil',
				components: {
					panel: Profile
				},
				name: "Mi perfil"
			},
			{
				path: 'facturas',
				components: {
					panel: Invoices
				},
				name: "Facturas"
			},
			{
				path: 'factura/visualizar/:id',
				components: {
					panel: InvoiceViewer
				},
				name: "Información de factura"
			},
			{
				path: 'factura/publicacion/:id',
				components: {
					panel: InvoicePublish
				},
				name: "Factura"
			},
			{
				path: 'factura/publicar/:id',
				components: {
					panel: InvoicePrePublish
				},
				name: "Publicación"
			},
		]
	},
];