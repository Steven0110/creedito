import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import { store } from '@/store/store'

/*	Axios 	*/
import api from '@/plugins/axios'

Vue.use( VueRouter )
const router = new VueRouter({
	mode: 'history',
	routes,
})

router.beforeEach((to, from, next) => {
	
	/*	Refresca la sesión si está dentro del admin 	*/
	if( to.path.includes("dashboard") && from.path != "/login" ){

		/*	Sólo renueva cuando está en el admin y no viene del login */
		//store.commit("setRenovationStatus", true)
		//api.get("renovate-session")
		//.then(result => store.commit("setUser", result.data.user ))
		//.finally(() => store.commit("setRenovationStatus", false ))
	}

	next()
})

export default router;