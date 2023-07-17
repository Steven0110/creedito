import Vue from 'vue'
import axios from 'axios'

/*  Config Options   */
const options = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.GENERAL_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}

/*  Interceptors & Handlers   */
const interceptor = config => {
    config.headers["x-api-key"] = process.env.GENERAL_API_SERVICE + "-" + process.env.API_KEY
    return config
}

const errorInterceptor = error => Promise.reject( error )
const responseBypass = response => response
const errorHandler = error => {
    if(error.response.status == 403){

        /*  Send notification to Sentry     */
        Vue.prototype.$sentry.captureException( new Error(error.response.data) )

        Vue.prototype.$swal("Error al procesar solicitud", "API Key inválida o sesión inválida", "error")

        return Promise.reject(false)

    }else if(error.response.status == 400){

        /*  Send notification to Sentry     */
        Vue.prototype.$sentry.captureException( new Error(error.response.data) )

        Vue.prototype.$swal("Error al procesar solicitud", "Solicitud inválida", "error")
        return Promise.reject(error)
        
    }else if(error.response.status == 500){ // Error en servidor

        /*  Send notification to Sentry     */
        Vue.prototype.$sentry.captureException( new Error(error.response.data) )

        Vue.prototype.$swal("Error inesperado", "Por favor vuelve a intentarlo, si el problema persiste, por favor envíanos un correo a soporte@investus.mx", "error")
        return Promise.reject(error)
        
    }else
        return Promise.reject(error)
}
/*  APIs Creation   */
const general = axios.create( options )

general.interceptors.request.use(interceptor, errorInterceptor)

general.interceptors.response.use(responseBypass, errorHandler)

Vue.prototype.$general = general

export default {}