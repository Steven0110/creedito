import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'


/*	Icons 	*/
//import Home       from '@/components/icons/Home.vue'

Vue.use(Vuetify)

const opts = {
  	icons: {
    	values: {
          //chome:      { component: Home },
    	},
    	iconfont: 'mdiSvg'
  	},
  	theme: {
  		themes: {
	  		light: {
          primary: "#3f9690",
          secondary: "#967F0F"
	  		}
  		}
  	}
}

export default new Vuetify(opts)