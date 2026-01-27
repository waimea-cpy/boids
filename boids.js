const rangeSlider = document.getElementById("range")
const coherSlider = document.getElementById("coher")
const separSlider = document.getElementById("separ")
const alignSlider = document.getElementById("align")
const highCheck   = document.getElementById("high")

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

const displayWidth  = window.innerWidth  * 0.98
const displayHeight = window.innerHeight * 0.9
const dpr = window.devicePixelRatio || 1
canvas.width  = displayWidth  * dpr
canvas.height = displayHeight * dpr
canvas.style.width  = displayWidth  + 'px'
canvas.style.height = displayHeight + 'px'
ctx.scale(dpr, dpr)

const width  = displayWidth
const height = displayHeight

class Boid {
    constructor(x, y, v, a) {
        this.x = x
        this.y = y
        this.v = v
        this.a = a
    }

    angleDiff(target) {
        let diff = target - this.a
        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI
        return diff
    }

    distanceTo(target) {
        const { dx, dy } = this.delta(target)
        return Math.sqrt((dx * dx) + (dy * dy))
    }

    delta(target) {
        let dx = this.x - target.x
        let dy = this.y - target.y

        if (dx > width / 2) dx -= width
        if (dx < -width / 2) dx += width
        if (dy > height / 2) dy -= height
        if (dy < -height / 2) dy += height

        return { dx, dy }
    }

    neighbours() {
        const local = []

        boids.forEach(boid => {
            if (boid === this) return

            if (boid.distanceTo(this) < range) {
                local.push(boid)
            }
        })

        return local
    }

    update() {
        const local = this.neighbours()

        if (local.length > 0) {
            let localAliX = 0
            let localAliY = 0
            let localAvgX = 0
            let localAvgY = 0
            let localSepX = 0
            let localSepY = 0

            local.forEach(boid => {
                const d = this.distanceTo(boid)
                const { dx, dy } = this.delta(boid)
                localSepX += dx / d
                localSepY += dy / d
                localAliX += Math.cos(boid.a)
                localAliY += Math.sin(boid.a)
                localAvgX += boid.x
                localAvgY += boid.y
            })
            localAliX /= local.length
            localAliY /= local.length
            localAvgX /= local.length
            localAvgY /= local.length
            localAvgX -= this.x
            localAvgY -= this.y
            const localSepA = Math.atan2(localSepY, localSepX)
            const localAliA = Math.atan2(localAliY, localAliX)
            const localCohA = Math.atan2(localAvgY, localAvgX)

            // Separation
            this.a += this.angleDiff(localSepA) * separation / 100
            // Alignment
            this.a += this.angleDiff(localAliA) * alignment / 100
            // Cohesion
            this.a += this.angleDiff(localCohA) * coherence / 100
        }

        this.x += this.v * Math.cos(this.a)
        this.y += this.v * Math.sin(this.a)

        this.x = (this.x + width) % width
        this.y = (this.y + height) % height
    }

    draw(color = "#ccc") {
        ctx.strokeStyle = color
        ctx.setLineDash([])

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.a)

        ctx.beginPath()
        ctx.moveTo(8, 0)
        ctx.lineTo(-8, -5)
        ctx.lineTo(-8, 5)
        ctx.closePath()
        ctx.stroke()

        ctx.restore()
    }

    highlight() {
        this.draw("#f008")

        ctx.strokeStyle = "#ff08"
        ctx.setLineDash([5, 5])

        ctx.beginPath()
        ctx.arc(this.x, this.y, range, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.x + width, this.y, range, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.x - width, this.y, range, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.x, this.y + height, range, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.x, this.y - height, range, 0, 2 * Math.PI)
        ctx.stroke()

        this.neighbours().forEach(boid => {
            boid.draw("#ff08")
        })

        ctx.setLineDash([])
    }
}

const boids = []

let range = 0
let coherence = 0
let separation = 0
let alignment = 0

let high = false

for (let i = 0; i < 250; i++) {
    boids[i] = new Boid(
        width * Math.random(),
        height * Math.random(),
        2 + Math.random() * 0.1,
        2 * Math.PI * Math.random()
    )
}

function animate() {
    range      = rangeSlider.value * 25
    coherence  = coherSlider.value
    separation = separSlider.value
    alignment  = alignSlider.value
    high       = highCheck.checked

    ctx.clearRect(0, 0, width, height)

    boids.forEach(boid => {
        boid.update()
        boid.draw()
    })

    if (high) boids[0].highlight()

    requestAnimationFrame(animate)
}

animate()
