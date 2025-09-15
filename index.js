const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const lifesEl = document.querySelector('#lifesEl')
const mapEl = document.querySelector('#mapEl')

const playerspeed = 2
const ghostspeed = 2
let playerLife = 3
let currentmap = 0
let currentPowerUps = 0

canvas.height = innerHeight
canvas.width = innerWidth

class Boundary {
    static width = 40
    static height = 40
    constructor({ position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }
    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player{
    // static speed = 2
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.nextVelocity = {x:0,y:0}
        this.radius = 15
        this.radians = 1
        this.openRate = 0.22
        this.rotate = 0 // '0 = 0° right 'PI = 180° 'left'
        this.speed = playerspeed
    }

    draw(){
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotate)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 -this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.radians < 0 || this.radians > 1){
            this.openRate = -this.openRate
        }

        this.radians += this.openRate
    }
}

class Ghost{
    // static speed = 2
    constructor({position, velocity, color = 'white'}){
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.colisions = []
        this.pathways = []
        this.speed = ghostspeed
        this.scared = false  
        this.cost = 0      
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet{
    constructor({position}){
        this.position = position
        this.radius = 3
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class PowerUp{
    constructor({position}){
        this.position = position
        this.radius = 10
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'orange'
        c.fill()
        c.closePath()
    }
}

class RespawnPoint{
    constructor({position, color}){ 
        this.position = position
        this.color = color
    }
}
const keys = {
    w:{
        pressed: false
    },
    s:{
        pressed: false
    },
    a:{
        pressed: false
    },
    d:{
        pressed: false
    }
}

let lastKey = ''
let score = 0

const map1 = [
    ['lu', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'ru'],  
    ['|', 'Pac', '.', '.', '.', '.', '.', '.', '.', '.', '|'],  
    ['|', '.', 'b', '.', '[', '-', ']', '.', 'b', '.', '|'],  
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],  
    ['|', '.', '^', '.', 'b', 'p', 'b', '.', '^', '.', '|'],   
    ['|', '.', '|', '.', 'p', '.', 'p', '.', '|', '.', '|'],
    ['|', '.', '_', '.', 'b', 'p', 'b', '.', '_', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.','|'],
    ['|', '.', 'b', '.', '[', '-', ']', '.', 'b', '.', '|'], 
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'Gr', '|'],  
    ['ld', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'rd']
]

const map2 = [
    ['lu', '-', '-', '-', '7', '-', '7', '-', '-', '-', 'ru'],  
    ['|', 'Pac', '.', '.', '_', '.', '_', '.', '.', 'Gc', '|'],  
    ['|', '.', '^', '.', '.', 'p', '.', '.', '^', '.', '|'],  
    ['|', '.', '|', ']', '.', 'b', '.', '[', '8', '.', '|'],  
    ['|', '.', '_', '.', '.', '.', '.', '.', '_', '.', '|'],   
    ['|', '.', 'p', '.', '[', '-', ']', '.', 'p', '.', '|'],
    ['|', '.', '^', '.', '.', '.', '.', '.', '^', '.', '|'],
    ['|', '.', '|', ']', '.', 'b', '.', '[', '8', '.','|'],
    ['|', '.', '_', '.', '.', '.', '.', '.', '_', '.', '|'], 
    ['|', 'Gp', '.', '.', '^', '.', '^', '.', '.', 'Gr', '|'],  
    ['ld', '-', '-', '-', '5', '-', '5', '-', '-', '-', 'rd']
]

const map3 = [
    ['lu', '-', '-', '-', '7', '-', '7', '-', '-', '-', 'ru'],  
    ['|', 'Gg', '.', '.', '_', '.', '_', '.', '.', 'Gc', '|'],  
    ['|', '.', 'b', '.', '.', 'p', '.', '.', 'b', '.', '|'],  
    ['|', '.', '.', '.', 'b', '.', 'b', '.', '.', '.', '|'],  
    ['|', '.', 'b', '.', '.', '.', '.', '.', 'b', '.', '|'],   
    ['|', '.', '.', 'p', 'b', 'Pac', 'b', '.', 'p', '.', '|'],
    ['|', '.', 'b', '.', '.', '.', '.', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', 'b', '.', 'b', '.', '.', '.','|'],
    ['|', '.', 'b', '.', '.', 'p', '.', '.', 'b', '.', '|'], 
    ['|', 'Gp', '.', '.', '^', '.', '^', '.', '.', 'Gr', '|'],  
    ['ld', '-', '-', '-', '5', '-', '5', '-', '-', '-', 'rd']
]
const pellets = []
const boundaries = []
const powerUps= []
const respawnPoints = []
const ghosts = []
const maps = [map1, map2, map3]
const respawnPointPlayer = []
const player = new Player({
    position: {
        x:Boundary.width + Boundary.width/2,
        y:Boundary.height + Boundary.height/2
    },
    velocity: {
        x:0,
        y:0
    }
})



function circleCollidesWithRectangle({circle, rectangle}) {
    const padding = Boundary.width / 2 - circle.radius - 0.5
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding) && (circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding) && (circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding) && (circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

function changeImage(src) {
    const image = new Image()
    image.src = src
    return image
}

// Método para busca gulosa
function greedySearchLD({player, ghost}) {
    let heuristic = 0
    let bestheuristic = Infinity
    let caminho = ''
    let nextPosisition = {position: {x:0, y:0}}

    for(let i= 0; i < ghost.pathways.length; i ++){
        switch(ghost.pathways[i]){
            case 'down':player
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y + ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})
                if(heuristic <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'down'
                }
                break
            
            case 'up':
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y - ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})           
                if(heuristic < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'up'
                }
                break

            case 'right':
                nextPosisition.position = {x: ghost.position.x + ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})         
                if(heuristic < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'right'
                }
                break

            case 'left':
                nextPosisition.position = {x: ghost.position.x - ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})          
                if(heuristic <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'left'
                }
                break
        }    
    }
    return caminho;
}

function greedySearchRU({player, ghost}) {
    let heuristic = 0
    let bestheuristic = Infinity
    let caminho = ''
    let nextPosisition = {position: {x:0, y:0}}

    for(let i= 0; i < ghost.pathways.length; i ++){
        switch(ghost.pathways[i]){
            case 'down':player
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y + ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})
                if(heuristic < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'down'
                }
                break
            
            case 'up':
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y - ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})           
                if(heuristic <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'up'
                }
                break

            case 'right':
                nextPosisition.position = {x: ghost.position.x + ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})         
                if(heuristic <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'right'
                }
                break

            case 'left':
                nextPosisition.position = {x: ghost.position.x - ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition})          
                if(heuristic < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'left'
                }
                break
        }    
    }
    return caminho;
}
// Método para A*
function aStarSearch({player, ghost, cost}) {

    let heuristic = 0
    let bestheuristic = Infinity
    let caminho = ''
    let nextPosisition = {position: {x:0, y:0}}
    cost = 0

    for(let i= 0; i < ghost.pathways.length; i ++){
        switch(ghost.pathways[i]){
            case 'down':
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y + ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition}) ;
                if(heuristic+cost <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'down'
                }
                break
            
            case 'up':
                nextPosisition.position = {x: ghost.position.x, y: ghost.position.y - ghost.speed}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition}) ;
                if(heuristic+cost < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'up'
                }
                break

            case 'right':
                nextPosisition.position = {x: ghost.position.x + ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition}) ;
                if(heuristic+cost < bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'right'
                }
                break

            case 'left':
                nextPosisition.position = {x: ghost.position.x - ghost.speed, y: ghost.position.y}
                ghost.scared ? heuristic = -calculateHeuristic({player, ghost: nextPosisition}) : heuristic =  calculateHeuristic({player, ghost: nextPosisition}) ;
                if(heuristic+cost <= bestheuristic){
                    bestheuristic = heuristic
                    caminho = 'left'
                }
                break
        }    
    }

    return caminho;
    //const h = calculateHeuristic({player, ghost});
    //return cost + h;
}

// Método para calcular heurística (distância de Manhattan)
function calculateHeuristic({player, ghost}) {
    return Math.abs(player.position.x - ghost.position.x) + Math.abs(player.position.y - ghost.position.y);
}

function changeMap({maps, currentmap}){
    mapDestructor()
    mapConstructor({maps: maps, currentmap: currentmap})
    console.log("mudou Para fase", currentmap + 1)
    mapEl.innerHTML = currentmap + 1
    animate()
}
function mapConstructor({maps, currentmap}){
    map = maps[currentmap]
    map.forEach((row, j) => {
        row.forEach((symbol, i) => {
            switch (symbol) {
                case '-':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeHorizontal.png')
                        })
                    )
                    break
                case '|':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeVertical.png')
                        })
                    )
                    break
                case 'b':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/block.png')
                        })
                    )
                    break
                case 'lu':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeCornerLeftUp.png')
                        })
                    )
                    break
                case 'ld':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeCornerLeftDown.png')
                        })
                    )
                    break
                case 'ru':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeCornerRightUp.png')
                        })
                    )
                    break
                case 'rd':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * i,
                                y: Boundary.height * j
                            },
                            image: changeImage('./img/pipeCornerRightDown.png')
                        })
                    )
                    break
                
                case '[':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/capLeft.png')
                    })
                    )
                    break
                case ']':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/capRight.png')
                    })
                    )
                    break
                case '_':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/capBottom.png')
                    })
                    )
                    break
                case '^':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/capTop.png')
                    })
                    )
                    break
                case '+':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/pipeCross.png')
                    })
                    )
                    break
                case '5':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        color: 'blue',
                        image: changeImage('./img/pipeConnectorTop.png')
                    })
                    )
                    break
                case '6':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        color: 'blue',
                        image: changeImage('./img/pipeConnectorRight.png')
                    })
                    )
                    break
                case '7':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        color: 'blue',
                        image: changeImage('./img/pipeConnectorBottom.png')
                    })
                    )
                    break
                case '8':
                    boundaries.push(
                    new Boundary({
                        position: {
                        x: i * Boundary.width,
                        y: j * Boundary.height
                        },
                        image: changeImage('./img/pipeConnectorLeft.png')
                    })
                    )
                    break
                case '.':
                    pellets.push(
                    new Pellet({
                        position: {
                        x: i * Boundary.width + Boundary.width / 2,
                        y: j * Boundary.height + Boundary.height/2
                        }
                    })
                    )
                    break    
                case 'p':
                    powerUps.push(
                    new PowerUp({
                        position: {
                        x: i * Boundary.width + Boundary.width / 2,
                        y: j * Boundary.height + Boundary.height/2
                        }
                    })
                    )
                    currentPowerUps++
                    break
                case 'Gr':
                    ghosts.push(
                    new Ghost({position: {
                        x: i * Boundary.width + Boundary.width / 2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                        velocity: {
                        x:0,
                        y:0
                    },
                    color: 'red'
                    }))
                    // Lugar onde o fanstama desta cor respawna
                    respawnPoints.push(
                    new RespawnPoint({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                    color: 'red'
                    }))
                    break
                case 'Gg':
                    ghosts.push(
                    new Ghost({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                        velocity: {
                        x:0,
                        y:0
                    },
                    color: 'green'
                    }))
                    // Lugar onde o fanstama desta cor respawna
                    respawnPoints.push(
                        new RespawnPoint({position: {
                            x: i * Boundary.width + Boundary.width/2,
                            y: j * Boundary.height + Boundary.height/2
                        },
                        color: 'green'
                        }))
                    break
                case 'Gp':
                    ghosts.push(
                    new Ghost({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                    velocity: {
                        x:0,
                        y:0
                    },
                    color: 'pink'
                    }))
                    // Lugar onde o fanstama respawna
                    respawnPoints.push(
                        new RespawnPoint({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                        color: 'pink'
                    }))
                    break
                case 'Gc':
                    ghosts.push(
                    new Ghost({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                    velocity: {
                        x:0,
                        y:0
                    },
                    color: 'cyan'
                    }))
                    // Lugar onde o fanstama desta cor respawna
                    respawnPoints.push(
                        new RespawnPoint({position: {
                            x: i * Boundary.width + Boundary.width/2,
                            y: j * Boundary.height + Boundary.height/2
                        },
                        color: 'cyan'
                    }))
                    break
                case 'Pac':
                    // Lugar onde o Player respawna
                    respawnPointPlayer.push(
                    new RespawnPoint({position: {
                        x: i * Boundary.width + Boundary.width/2,
                        y: j * Boundary.height + Boundary.height/2
                    },
                        color: 'yellow'
                    }))
                    ResetPlayer()
                    break
            }}
        )
    })
}

function mapDestructor(){
    pellets.splice(0, pellets.length)
    boundaries.splice(0, boundaries.length)
    powerUps.splice(0, powerUps.length)
    respawnPoints.splice(0, respawnPoints.length)
    respawnPointPlayer.splice(0, respawnPointPlayer.length)
    ghosts.splice(0, ghosts.length)
    currentPowerUps = 0
}
// Função para respawnar um ghost
function resetGhost({ghost}){
    respawnPoints.forEach(respawn => {
        if(respawn.color === ghost.color){    
            ghosts.push((new Ghost({
            position: {
                x: respawn.position.x,
                y: respawn.position.y
        },
            velocity: {
                x:0,
                y:0
        },
            color: ghost.color
        })))                          
        }
    })
}
// Reseta o Player
function ResetPlayer(){
    respawn = respawnPointPlayer[0]
    player.position = {x: respawn.position.x, y:respawn.position.y}
    player.velocity.x = 0
    player.velocity.y = 0
    player.nextVelocity = {x:0, y:0}
    player.rotate = 0                            
}

let animationId
function animate() {
    // setTimeout(() => {
        animationId = requestAnimationFrame(animate)
    // }, 200)
    
    c.clearRect(0, 0, canvas.width, canvas.height)
    // Colisão de Movimentação do player com input
    let currentcolision = true
    if (keys.w.pressed && lastKey === 'w') {
        player.nextVelocity.x = 0
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:0, y:-player.speed}}, rectangle: boundary})){
                player.velocity.y = 0
                player.nextVelocity.y = -player.speed
                currentcolision = true
                break
            }else{
                currentcolision = false
            }
        }
        if(!currentcolision){
            player.velocity.x = 0
            player.velocity.y= -player.speed
            player.nextVelocity.y = 0
        }
    }else if (keys.s.pressed && lastKey === 's'){
        player.nextVelocity.x = 0
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:0, y:player.speed}}, rectangle: boundary})){
                player.velocity.y = 0
                player.nextVelocity.y = player.speed
                currentcolision = true
                break
            }else{
                currentcolision = false
            }
        }
        if(!currentcolision){
            player.velocity.x = 0
            player.velocity.y= player.speed
            player.nextVelocity.y = 0
        }
    }else if (keys.a.pressed && lastKey === 'a'){
        player.nextVelocity.y = 0
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:-player.speed, y:0}}, rectangle: boundary})){
                player.velocity.x = 0
                player.nextVelocity.x = -player.speed
                currentcolision = true
                break
            }else{
                currentcolision = false
            }
            
        }
        if(!currentcolision){
                player.velocity.x= -player.speed
                player.velocity.y = 0
                player.nextVelocity.x = 0
            }
    }else if (keys.d.pressed && lastKey === 'd'){
        player.nextVelocity.y = 0
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:player.speed, y:0}}, rectangle: boundary})){
                player.velocity.x = 0
                player.nextVelocity.x = player.speed 
                currentcolision = true
                break
            }else{
                
                currentcolision = false
            }
        }
        if(!currentcolision){
            player.velocity.x = player.speed
            player.velocity.y = 0
            player.nextVelocity.x = 0
        }
    }

    // Colisão de Movimentação do player sem input
    let nextcolision = true

    if (player.nextVelocity.y < 0) {

        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:0, y:-player.speed}}, rectangle: boundary})){
                nextcolision = true
                break
            }else{
                nextcolision = false
            }
        }
        if(!nextcolision){
            // console.log("sem colisão KEKW")
            player.velocity.x = 0
            player.velocity.y = -player.speed
            player.nextVelocity.y = 0
        }
    }else if(player.nextVelocity.y > 0){
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:0, y:player.speed}}, rectangle: boundary})){
                nextcolision = true
                break
            }else{
                nextcolision = false

            }
        }
        if(!nextcolision){
            player.velocity.x = 0
            player.velocity.y = player.speed
            player.nextVelocity.y = 0
        }
    }else if(player.nextVelocity.x < 0){
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:-player.speed, y:0}}, rectangle: boundary})){
                nextcolision = true
                break
            }else{
                nextcolision = false
            }
        }
        if(!nextcolision){
            player.velocity.x = -player.speed
            player.velocity.y = 0
            player.nextVelocity.x = 0
        }
    }else if(player.nextVelocity.x > 0){
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(circleCollidesWithRectangle({circle: {...player, velocity: {x:player.speed, y:0}}, rectangle: boundary})){
                nextcolision = true
                break
            }else{
                nextcolision = false
            }
        }
        if(!nextcolision){
            player.velocity.x = player.speed
            player.velocity.y = 0
            player.nextVelocity.x = 0
        }
    }

    // ghost colision with player 
    for (let i = ghosts.length - 1; 0 <= i; i--){
        const ghost = ghosts[i]

        if (Math.hypot( ghost.position.x - player.position.x, ghost.position.y - player.position.y ) <  ghost.radius + player.radius){  
            if(ghost.scared){
                setTimeout(() => {
                    let dead = true
                    ghosts.forEach(ghostVerify => {                         // Verificar se o ghost esta realmente morto
                        if(ghostVerify.color === ghost.color) dead = false   //ghostDeadVerification
                    })     
                    //ghostRevive
                    if(dead){                            // Se morto crie outro                   
                        resetGhost({ghost: ghost})       // Reseta a posição do ghost
                    }                        
                },7500)        
                ghosts.splice(i, 1)                     
                score += 20
                scoreEl.innerHTML = score
            }
            else{
                if(playerLife <= 0){
                    cancelAnimationFrame(animationId)
                    console.log('Perdeu!')
                }
                else{
                    console.log('Morreu!')
                    playerLife--
                    lifesEl.innerHTML = playerLife
                    

                    cancelAnimationFrame(animationId)             // Para de animar
                    setTimeout(() => {
                    ResetPlayer()                                 // Reseta o Player
                    for (let i = ghosts.length - 1; 0 <= i; i--){ // Percorre decrescentemente o indice do array
                        const ghost2 = ghosts[i]                  // Atribui cada ghost
                        resetGhost({ghost: ghost2})               // Reseta o ghost
                        ghosts.splice(i, 1)                       // Remove o ghost da ultima posição  
                    }
                    animate()                                     // Volta a animar
                    }, 2000)
                } 
                break
            }
        }
    }
    
    // powerUps draw and colision
    for (let i = powerUps.length - 1; 0 <= i; i--){
        const powerUp = powerUps[i]
        powerUp.draw()
        // powerUps colision with player
        if (Math.hypot( powerUp.position.x - player.position.x, powerUp.position.y - player.position.y ) <  powerUp.radius + player.radius )
        {
            powerUps.splice(i, 1)
            currentPowerUps--
            const prevPowerups = powerUps.length
            //powerUps effects
            ghosts.forEach(ghost => {
                ghost.scared = true
                // console.log(ghost.scared)
                setTimeout(() =>{
                    if(prevPowerups === currentPowerUps) ghost.scared = false 
                }, 5000)
        })}
    }
    // pellets draw and colision
    for (let i = pellets.length - 1; 0 <= i; i--){
        const pellet = pellets[i]
        pellet.draw()
        // pellets colision with player
        if (Math.hypot( pellet.position.x - player.position.x, pellet.position.y - player.position.y ) <  pellet.radius + player.radius )
        {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    }
    
    boundaries.forEach((boundary) => {
        boundary.draw()

    if(circleCollidesWithRectangle({circle: player, rectangle: boundary})){
        player.velocity.y = 0
        player.velocity.x = 0
    }

    })
    player.update()

    ghosts.forEach( (ghost) => {
        ghost.update()
        ghost.scared ? ghost.speed = ghostspeed * 0.65 : ghost.speed = ghostspeed   // ghostspeed variavel global para delimitar velocidade dos fantasmas
        // Colisão para o fantasma não andar para trás
        if (ghost.velocity.x > 0) ghost.colisions.push('left')
        else if (ghost.velocity.x < 0) ghost.colisions.push('right')
        else if (ghost.velocity.y > 0) ghost.colisions.push('up')
        else if (ghost.velocity.y < 0) ghost.colisions.push('down')

        boundaries.forEach(boundary => {
            if( !ghost.colisions.includes('right') && circleCollidesWithRectangle({circle: {...ghost, velocity: {x:ghost.speed, y:0}}, rectangle: boundary})){
                ghost.colisions.push('right')
            }
            if( !ghost.colisions.includes('left') && circleCollidesWithRectangle({circle: {...ghost, velocity: {x:-ghost.speed, y:0}}, rectangle: boundary})){
                ghost.colisions.push('left')
            }
            if( !ghost.colisions.includes('down') && circleCollidesWithRectangle({circle: {...ghost, velocity: {x:0, y:ghost.speed}}, rectangle: boundary})){
                ghost.colisions.push('down')
            }
            if( !ghost.colisions.includes('up') && circleCollidesWithRectangle({circle: {...ghost, velocity: {x:0, y:-ghost.speed}}, rectangle: boundary})){
                ghost.colisions.push('up')
            }
        })

        // Adiciona os caminhos sem colisão
        if(!ghost.colisions.includes('up')) 
        {
            ghost.pathways.push('up')
        }
        if(!ghost.colisions.includes('down')) 
        {
            ghost.pathways.push('down')
        }
        if(!ghost.colisions.includes('left')) 
        {
            ghost.pathways.push('left')}
        if(!ghost.colisions.includes('right')) 
        {
            ghost.pathways.push('right')
        }
        // Se o fantasma não tem caminho disponível ele anda para trás
        if (ghost.velocity.x > 0 && ghost.pathways.length === 0) ghost.pathways.push('left')
        else if (ghost.velocity.x < 0 && ghost.pathways.length === 0) ghost.pathways.push('right')
        else if (ghost.velocity.y > 0 && ghost.pathways.length === 0) ghost.pathways.push('up')
        else if (ghost.velocity.y < 0 && ghost.pathways.length === 0) ghost.pathways.push('down')
        
        let direction = '' 
        // Seleção de direção aleatória
        const directionRandom = ghost.pathways[Math.floor(Math.random() * ghost.pathways.length)]

        // Seleção de direção Gulosa
        const directionGreedy = greedySearchLD({player: player, ghost: ghost})

        // Seleção de direção A*
        const directionAstar = aStarSearch({player: player, ghost: ghost, cost: ghost.cost+1})
        
        // console.log({direction})
        if (ghost.color === 'red') {
            direction = directionGreedy
            // console.log('ghost pathways:', ghost.pathways)
            // console.log('colisions', ghost.colisions)
            // console.log('direction', direction)
        }else if (ghost.color === 'pink') {
            ghost.cost = ghost.cost + 1
            direction = directionAstar
        }else {
            // Se estiver com medo ele foge, caso contrário seleciona randomicamente
            ghost.scared ? direction = directionGreedy : direction = directionRandom
        }
        

        ghost.pathways = []
        ghost.colisions = []
        switch(direction){
            case 'down':
                ghost.velocity.y = ghost.speed
                ghost.velocity.x = 0
                // ghost.colisions.includes('up')
                break
            
            case 'up':
                ghost.velocity.y = -ghost.speed
                ghost.velocity.x = 0
                // ghost.colisions.includes('down')
                break

            case 'right':
                ghost.velocity.y = 0
                ghost.velocity.x = ghost.speed
                // ghost.colisions.includes('left')
                break
            case 'left':
                ghost.velocity.y = 0
                ghost.velocity.x = -ghost.speed
                // ghost.colisions.includes('right')
                break
        }
        
        }
    )
    if(player.velocity.x > 0){
        player.rotate = Math.PI * 0
    }else if(player.velocity.x < 0){
        player.rotate = Math.PI * 1
    }else if(player.velocity.y > 0){
        player.rotate = Math.PI * 0.5
    }else if(player.velocity.y < 0){
        player.rotate = Math.PI * 1.5
    }
    // Win condition
    if(pellets.length === 0){
        cancelAnimationFrame(animationId)

        setTimeout(() => {
            currentmap++
            currentmap < maps.length ? changeMap({maps: maps, currentmap: currentmap}) : console.log('Ganhou!')
        }, 2000)
    }
}

addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})

mapConstructor({maps: maps, currentmap: currentmap})
animate()