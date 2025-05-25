import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('Service Worker: Ready')
    },
    registered() {
      console.log('Service Worker: Registered')
    },
    cached() {
      console.log('Service Worker: Cached')
    },
    updatefound() {
      console.log('Service Worker: Update Found')
    },
    updated() {
      console.log('Service Worker: Updated')
    },
    offline() {
      console.log('Service Worker: Offline')
    },
    error(error) {
      console.error('Service Worker Error:', error)
    }
  })
}
