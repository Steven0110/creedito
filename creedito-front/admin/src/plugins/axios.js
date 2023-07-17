import Vue from 'vue'
import axios from 'axios'

/*  Config Options   */
const authOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.AUTH_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const securityOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.SECURITY_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const documentsOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.DOCUMENTS_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const invoicesOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.INVOICES_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const developersOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.DEVELOPERS_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const investorsOptions = {
    timeout: 30000,
    baseURL: process.env.BASE_API + process.env.INVESTORS_API_PATH,
    withCredentials: true,
    params: {
        validateStatus: true
    }
}
const fileserverOptions = {
    timeout: 30000,
    baseURL: process.env.FILESERVER,
    withCredentials: false,
    params: {
        validateStatus: true
    }
}

/*  Interceptors && Handlers   */
const authInterceptor = config => {
    config.headers["x-api-key"] = process.env.AUTH_API_SERVICE + "-" + process.env.API_KEY
    return config
}
const securityInterceptor = config => {
    config.headers["x-api-key"] = process.env.SECURITY_API_SERVICE + "-" + process.env.API_KEY
    return config
}
const documentsInterceptor = config => {
    config.headers["x-api-key"] = process.env.DOCUMENTS_API_SERVICE + "-" + process.env.API_KEY
    return config
}
const invoicesInterceptor = config => {
    config.headers["x-api-key"] = process.env.INVOICES_API_SERVICE + "-" + process.env.API_KEY
    return config
}
const developersInterceptor = config => {
    config.headers["x-api-key"] = process.env.DEVELOPERS_API_SERVICE + "-" + process.env.API_KEY
    return config
}

const investorsInterceptor = config => {
    config.headers["x-api-key"] = process.env.INVESTORS_API_SERVICE + "-" + process.env.API_KEY
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

        Vue.prototype.$swal("Error inesperado", "Por favor vuelve a intentarlo, si el problema persiste, por favor envíanos un correo a soporte@alalza.mx", "error")
        return Promise.reject(error)
        
    }else
        return Promise.reject(error)
}
const fileserverErrorHandler = error => {
    if(error.response.status == 403){ //Unauthorized

        /*  Send notification to Sentry     */
        Vue.prototype.$sentry.captureException( new Error(error.response.data) )
        Vue.prototype.$swal("Acceso denegado", "No estás autorizado para realizar esta acción.", "error")
        return Promise.reject(false)
    }else
        return Promise.reject(error)
}

/*  APIs Creation   */
const auth          = axios.create( authOptions )
const security      = axios.create( securityOptions )
const documents     = axios.create( documentsOptions )
const invoices      = axios.create( invoicesOptions )
const developers    = axios.create( developersOptions )
const investors     = axios.create( investorsOptions )
const fileserver    = axios.create( fileserverOptions )

auth.interceptors.request.use(authInterceptor, errorInterceptor)
security.interceptors.request.use(securityInterceptor, errorInterceptor)
documents.interceptors.request.use(documentsInterceptor, errorInterceptor)
invoices.interceptors.request.use(invoicesInterceptor, errorInterceptor)
developers.interceptors.request.use(developersInterceptor, errorInterceptor)
investors.interceptors.request.use(investorsInterceptor, errorInterceptor)

auth.interceptors.response.use(responseBypass, errorHandler)
security.interceptors.response.use(responseBypass, errorHandler)
documents.interceptors.response.use(responseBypass, errorHandler)
invoices.interceptors.response.use(responseBypass, errorHandler)
developers.interceptors.response.use(responseBypass, errorHandler)
investors.interceptors.response.use(responseBypass, errorHandler)
fileserver.interceptors.response.use(responseBypass, fileserverErrorHandler)

Vue.prototype.$auth         = auth
Vue.prototype.$security     = security
Vue.prototype.$documents    = documents
Vue.prototype.$invoices     = invoices
Vue.prototype.$developers   = developers
Vue.prototype.$investors    = investors
Vue.prototype.$fileserver   = fileserver

export default {}