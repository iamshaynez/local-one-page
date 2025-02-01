let scene, camera, renderer;
let bodies = [];
let trails = [];
let showTrails = true;

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('threeBodyCanvas'),
        antialias: true
    });
    
    renderer.setSize(document.querySelector('.simulation-container').offsetWidth,
                     document.querySelector('.simulation-container').offsetHeight);
    renderer.setClearColor(0x000000);
    
    // Set camera position
    camera.position.z = 50;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Initialize bodies
    initBodies();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Initialize the three bodies with random positions and velocities
function initBodies() {
    // Clear existing bodies and trails
    bodies.forEach(body => scene.remove(body));
    trails.forEach(trail => scene.remove(trail));
    bodies = [];
    trails = [];
    
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    
    for (let i = 0; i < 3; i++) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: colors[i] });
        const body = new THREE.Mesh(geometry, material);
        
        // Random position within bounds
        body.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );
        
        // Add velocity property
        body.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        scene.add(body);
        bodies.push(body);
        
        // Create trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({ color: colors[i] });
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        scene.add(trail);
        trails.push({
            line: trail,
            positions: []
        });
    }
}

// Update physics
function updatePhysics() {
    const G = 0.5; // Gravitational constant
    
    // Calculate forces and update velocities
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bodyA = bodies[i];
            const bodyB = bodies[j];
            
            const dx = bodyB.position.x - bodyA.position.x;
            const dy = bodyB.position.y - bodyA.position.y;
            const dz = bodyB.position.z - bodyA.position.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const force = G / (distance * distance);
            
            // Apply forces to both bodies
            bodyA.velocity.x += force * dx / distance;
            bodyA.velocity.y += force * dy / distance;
            bodyA.velocity.z += force * dz / distance;
            
            bodyB.velocity.x -= force * dx / distance;
            bodyB.velocity.y -= force * dy / distance;
            bodyB.velocity.z -= force * dz / distance;
        }
    }
    
    // Update positions and trails
    bodies.forEach((body, index) => {
        body.position.add(body.velocity);
    
        // Boundary collision detection and reflection
        const bounds = 40; // Set boundary limits
        if (Math.abs(body.position.x) > bounds) {
            body.position.x = Math.sign(body.position.x) * bounds;
            body.velocity.x *= -0.8; // Reflect with some energy loss
        }
        if (Math.abs(body.position.y) > bounds) {
            body.position.y = Math.sign(body.position.y) * bounds;
            body.velocity.y *= -0.8;
        }
        if (Math.abs(body.position.z) > bounds) {
            body.position.z = Math.sign(body.position.z) * bounds;
            body.velocity.z *= -0.8;
        }

        if (showTrails) {
            const trail = trails[index];
            trail.positions.push(body.position.clone());
            
            // Limit trail length
            if (trail.positions.length > 100) {
                trail.positions.shift();
            }
            
            // Update trail geometry
            const positions = new Float32Array(trail.positions.length * 3);
            for (let i = 0; i < trail.positions.length; i++) {
                positions[i * 3] = trail.positions[i].x;
                positions[i * 3 + 1] = trail.positions[i].y;
                positions[i * 3 + 2] = trail.positions[i].z;
            }
            
            trail.line.geometry.setAttribute('position',
                new THREE.BufferAttribute(positions, 3));
            trail.line.geometry.attributes.position.needsUpdate = true;
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate camera slowly around the scene
    camera.position.x = Math.sin(Date.now() * 0.0005) * 50;
    camera.position.z = Math.cos(Date.now() * 0.0005) * 50;
    camera.lookAt(0, 0, 0);
    
    updatePhysics();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.querySelector('.simulation-container');
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
    
    // Add event listeners for control buttons
    document.getElementById('resetButton').addEventListener('click', initBodies);
    document.getElementById('randomizeButton').addEventListener('click', () => {
        bodies.forEach(body => {
            body.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            );
            body.velocity.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
        });
        
        // Clear trails
        trails.forEach(trail => {
            trail.positions = [];
            trail.line.geometry.setAttribute('position',
                new THREE.BufferAttribute(new Float32Array(0), 3));
        });
    });
    
    document.getElementById('toggleTrailsButton').addEventListener('click', () => {
        showTrails = !showTrails;
        trails.forEach(trail => {
            trail.line.visible = showTrails;
        });
    });
});