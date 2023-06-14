const spaceSound = new Audio('spaceMusic.mp3');
const victorySound = new Audio('victory.mp3');
const loseSound = new Audio('lose.mp3');
const shootingSound = new Audio('shooting.mp3');
const scoreEl = document.getElementById('scoreEl');
/* *** 1.SETTING UP THE CANVAS*** */
const canvas = document.getElementById('canvas1')
const c = canvas.getContext('2d')

//fixing the dimensions of canvas to fit covering the whole screen
canvas.width = 1024
canvas.height = 576

window.onload = spaceSound.play();


/* *** 2.CREATING THE PLAYER*** */
class Player {
    constructor() {


        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0
        this.opacity = 1
        const image = new Image()
        image.src = 'My project.png'

        image.onload = () => {
            const scale = 0.13
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale


            //positioning the image after loading
            this.position = {

                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20

            }
        }

    }
    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x//adding velocity to position//to make the player move

        }

    }

}
/* *** 4.CREATING THE projectile*** */

class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.radius = 4
        this.velocity = velocity
        spaceSound.play();
    }
    draw() {//for projectile to be drawn
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = '#DC5F00'
        c.fill()
        c.closePath()
    }
    update() {//for projectile to move
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
/* *** 9.CREATING INVADER PROJECTILE*** */

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10

    }
    draw() {//for projectile to be drawn
        c.fillStyle = '#FFB200'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {//for projectile to move
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }


}

/* *** 10.ENEMY EXPLOSION*** */

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.opacity = 1
        //11.2
        this.fades = fades
    }
    draw() {//for projectile to be drawn
        c.save()
        //10.5 fading particles
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }
    update() {//for projectile to move

        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        //10.5 fading particles
        if (this.fades)
            this.opacity -= 0.01
    }
}

/* *** 5.CREATING THE ENEMY*** */
class Invader {
    constructor({ position }) {//6.6 diff position for each invader


        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = 'alien.png'

        image.onload = () => {
            const scale = 0.25
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale


            //positioning the image after loading
            this.position = {

                x: position.x,
                y: position.y
            }
        }

    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update({ velocity }) {//passes velocity that grid shd move
        if (this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y

        }

    }

    //9.3 creating shoot function for invader
    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))

    }
}

/* *** 6.CREATING MULTIPLE ENEMIES*** */

//6.1 creating grid class
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }
        //creating array to store enemies
        this.invaders = []

        //6.5 creating multiple rows and cols of enemies in each grid
        const cols = Math.floor(Math.random() * 5 + 10)
        const rows = Math.floor(Math.random() * 3 + 2)

        this.width = cols * 30//width of grid
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(
                    new Invader(
                        {
                            position: {
                                x: i * 25,
                                y: j * 25
                            }
                        }
                    ))
            }
        }

    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        //6.8 to grid to bounce when touches edges of screen
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            //6.9 moving vertically after a hit to edge
            this.velocity.y = 30

        }
    }
}

const player = new Player();

//4.2 creating array to store projectiles
const projectiles = []


//5.2 creating invader object
const grids = [new Grid()]

//9.2 creating array to store invader projectiles
const invaderProjectiles = []

//10.2 creating array 
const particles = []

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }

}
/* *** 7. SPRAWNING GRIDS*** */

let frames = 1
let randomInterval = Math.floor((Math.random() * 500) + 200)//to create random interval between 500 and 1000 for sprawning grids
//9.9 game over 
let game = {
    over: false,
    active: true
}
let score = 0
/* *** 11.BACKGROUND STARS*** */
for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 0.3
        },
        radius: Math.random() * 1.5,
        color: 'white'
    }))
}

function createParticles({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: { x: object.position.x + object.width / 2, y: object.position.y + object.height / 2 },
            velocity: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 },
            radius: Math.random() * 3,
            color: color || '#2192FF',
            fades
        }))
    }
}
function animate() {
    if (!game.active) return

    requestAnimationFrame(animate)
    c.fillStyle = '#251B37'
    c.fillRect(0, 0, canvas.width, canvas.height)

    //5.3 calling invader.update to animate enemy
    //invader.update()

    player.update()
    //player.draw()

    //10.3 rendering particles
    particles.forEach((particle, i) => {

        //11.3 respawning stars after going out of screen
        if (particle.position.y - particle.radius > canvas.height) {
            particle.position.x = Math.random() * canvas.width,
                particle.position.y = -particle.radius

        }


        //10.5 removing particles after opacity is 0
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0)
        }
        else {
            particle.update()
        }
    })
    //9.4 calling update function of invader projectile
    invaderProjectiles.forEach((invaderProjectile, index) => {//to animate invader projectiles 

        //9.6 garbage collection for invader projectiles
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {//to remove invader projectiles when they hit the bottom of screen
            setTimeout(() => {//to remove invader projectiles after 1 second  
                invaderProjectiles.splice(index, 1)//to remove invader projectiles from array
            }, 0)
        }
        else
            invaderProjectile.update()
        if (invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width
            && invaderProjectile.position.y + invaderProjectile.height >= player.position.y) {
            console.log('youlose')

            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
            }, 0)
            setTimeout(() => {//to stop game after the player dies

                game.active = false
                spaceSound.pause();
                loseSound.play();
            }, 1500)
            //9.8 creating particles when player is hit
            createParticles({
                object: player,
                color: '#FF731D',
                fades: true
            })
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()
        //4.4 garbage collection
        if (projectile.position.y + projectile.radius <= 0) {
            //pojectile.position.y calculatyed from top to center of projectilr (circle)..+projectilr.radius calculates from top to bottom of circle..if less than zero then out of screen
            setTimeout(() => {
                projectiles.splice(index, 1)//remove that projectilr with respective index- one at once
            }, 0)//to prevent flashing of projectile
        }
        else projectile.update()
    })

    /* *** 8. SHOOT INVADERS*** */
    grids.forEach((grid, gridIndex) => {
        grid.update()

        //9.5 sprawning invader projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity })//6.7 each invader has diff velocity..to make invaders move

            //8.1.collision detection
            projectiles.forEach((projectile, index) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {


                    //8.2 if collision detected then remove projectile and invader
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(invader2 => invader2 === invader)//to find the invader that is hit
                        const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)//to find the projectile that is hit


                        if (invaderFound && projectileFound) {

                            score += 100
                            console.log(score)
                            scoreEl.innerHTML = score
                            //10.4 creating particles
                            createParticles({
                                object: invader,
                                fades: true
                            })
                            grid.invaders.splice(i, 1)
                            projectiles.splice(index, 1)

                            //8.3 updating grid width
                            if (grid.invaders.length > 0) {//if there are invaders left in the grid
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width//grid width is updated to distance between left od first invader to right of last invader
                                grid.position.x = firstInvader.position.x//grid position is updated to left of first invader
                            }
                            //8.4 removing grid if all invaders are dead
                            else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)//to prevent flashing of projectile
                }
            })

        })
    })

    //to prevent player moving out of screen to left
    if (keys.a.pressed && player.position.x > 0) {
        player.velocity.x = -5//moving left by 5 pixels when a is pressed

    }
    else if (keys.d.pressed && player.position.x + player.width < canvas.width) {
        player.velocity.x = 5//moving right by 5 pixels when d is pressed
    }
    else {
        player.velocity.x = 0
    }
    console.log(frames)
    //7.4 push new grid for different frame count intervals
    if (frames % randomInterval === 0) {
        frame = 0
        grids.push(new Grid())
        randomInterval = Math.floor((Math.random() * 500) + 500)
    }
    frames++
}

animate()

window.addEventListener('keydown', ({ key }) => {

    if (game.over) return//to prevent player from moving when game is over
    //console.log(key)
    switch (key) {
        case 'a':
            console.log('left')

            keys.a.pressed = true
            break;
        case 'd':
            console.log('right')
            //player.velocity.x=-5
            keys.d.pressed = true
            break
        case ' ':
            console.log('space')
            //4.3 creating multiple projectiles
            projectiles.push(new Projectile({
                position: {//from where projectiles shd start
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: { x: 0, y: -15 }
             
            }))
            break

    }
})
window.addEventListener('keyup', ({ key }) => {
    //console.log(key)
    switch (key) {
        case 'a':
            console.log('left')
            keys.a.pressed = false
            break;
        case 'd':
            console.log('right')
            keys.d.pressed = false
            break
        case ' ':
            console.log('space')
            //player.velocity.x=-5
            break

    }
})




