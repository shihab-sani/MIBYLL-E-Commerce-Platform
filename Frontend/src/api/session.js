/**
 * Per-tab session storage wrapper.
 * Tokens live in sessionStorage so admin and customer tabs stay independent,
 * and closing a tab wipes its auth — smaller XSS window than localStorage.
 */
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const session = {
    getToken:     () => sessionStorage.getItem(TOKEN_KEY),
    getUser:      () => {
        const raw = sessionStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
    },
    set: (token, user) => {
        sessionStorage.setItem(TOKEN_KEY, token)
        sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    clear: () => {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(USER_KEY)
    },
}