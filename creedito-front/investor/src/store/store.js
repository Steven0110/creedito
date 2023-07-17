import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		user: 			{},
		lastAction: 	null,
		isSessionActive:false,
		renovating: 	false,
	},
	mutations: {
		/*	User*/
		setUser(state, user){
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
		}
	},
	getters: {
		user: 					state => state.user,
		lastAction: 			state => state.lastAction,
		isSessionActive: 		state => state.isSessionActive,
		renovating: 			state => state.renovating,
	}

})