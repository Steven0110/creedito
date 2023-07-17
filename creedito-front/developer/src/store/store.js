import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		user: 			{},
		lastAction: 	null,
		isSessionActive:false,
		renovating: 	false,
		checkingSession:false,
		currentInvoice: {
			uuid: "...",
			developer: {}
		},
	},
	mutations: {
		/*	User*/
		setUser(state, user){
			if(state.user.profilePicture)
				user.profilePicture = state.user.profilePicture

			state.user = user
		},
		setUserData(state, {key, value}){
			state.user[ key ] = value
		},
		setSecurityQuestions(state, quantity){
			state.user.securityQuestions = quantity
		},
		setTFA(state, status){
			state.user.tfa = status
		},
		setSessionActive(state, status){
			state.isSessionActive = status
		},
		setSecretImage(state, status){
			state.user.secretImage = true
		},
		setRenovationStatus(state, status){
			state.renovating = status
		},
		setCheckingSession(state, status){
			state.checkingSession = status
		},
		/*	Invoices 	*/
		setCurrentInvoice(state, invoice){
			state.currentInvoice = invoice
		},
	},
	getters: {
		user: 					state => state.user,
		lastAction: 			state => state.lastAction,
		isSessionActive: 		state => state.isSessionActive,
		renovating: 			state => state.renovating,
		checkingSession: 		state => state.checkingSession,
		currentInvoice: 		state => state.currentInvoice,
	}

})