import { onBeforeUnmount } from 'vue'

export function useRfidKiosk() {
    let resetTimer = null
    let successAudio = null
    let errorAudio = null

    const getAudio = (type = 'success') => {
        if (type === 'success') {
            if (!successAudio) successAudio = new Audio('/success.mp3')
            return successAudio
        }

        if (!errorAudio) errorAudio = new Audio('/error.mp3')
        return errorAudio
    }

    const beep = (type = 'success') => {
        try {
            const audio = getAudio(type)
            audio.currentTime = 0
            audio.play().catch(() => {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext
                if (!AudioContextClass) return

                const context = new AudioContextClass()
                const oscillator = context.createOscillator()
                const gain = context.createGain()

                oscillator.type = 'sine'
                oscillator.frequency.value = type === 'success' ? 920 : 280
                gain.gain.value = 0.08

                oscillator.connect(gain)
                gain.connect(context.destination)
                oscillator.start()

                setTimeout(() => {
                    oscillator.stop()
                    context.close()
                }, type === 'success' ? 120 : 220)
            })
        } catch (error) {
            // Keep kiosk resilient; ignore audio failures.
        }
    }

    const scheduleReset = (callback, ms = 2500) => {
        if (resetTimer) {
            clearTimeout(resetTimer)
        }

        resetTimer = setTimeout(() => {
            callback()
            resetTimer = null
        }, ms)
    }

    onBeforeUnmount(() => {
        if (resetTimer) {
            clearTimeout(resetTimer)
            resetTimer = null
        }
    })

    return {
        beep,
        scheduleReset
    }
}

