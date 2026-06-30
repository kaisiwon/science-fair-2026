document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM & Engine Setup ---
    const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

    const canvasContainer = document.getElementById('canvas-container');
    const vectorForm = document.getElementById('vector-form');
    const equationInput = document.getElementById('equation-input');
    const scoreDisplay = document.getElementById('score-display');

    let score = 0;
    // State for the aiming line
    let aimSlope = 0;
    let aimIntercept = 0;
    let showAimingLine = false;

    // Create engine
    const engine = Engine.create({ gravity: { y: 0 } }); // No gravity for a top-down view
    const world = engine.world;

    // Create renderer
    const render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: canvasContainer.clientWidth,
            height: 400,
            wireframes: false,
            background: '#1a1a2e'
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Enemy Definitions ---
    const ENEMY_TYPES = [
        { label: 'target-medium', radius: 20, points: 100, color: '#f0f0f0', moving: false },
        { label: 'target-small', radius: 12, points: 250, color: '#a2ff91', moving: false },
        { label: 'target-large', radius: 35, points: 50, color: '#ffb3ba', moving: false },
        { label: 'target-patrol', radius: 15, points: 300, color: '#ffde91', moving: true, speed: 2 }
    ];

    // --- Game Objects ---
    const turret = Bodies.rectangle(render.options.width / 2, render.options.height - 30, 40, 20, {
        isStatic: true,
        render: { fillStyle: '#e94560' }
    });

    const wallOptions = {
        isStatic: true,
        render: { fillStyle: '#0f3460' } // A dark blue that matches the theme
    };
    const walls = [
        // Top wall (to contain projectiles)
        Bodies.rectangle(render.options.width / 2, 0, render.options.width, 10, wallOptions),
        // Left wall
        Bodies.rectangle(0, render.options.height / 2, 10, render.options.height, wallOptions),
        // Right wall
        Bodies.rectangle(render.options.width, render.options.height / 2, 10, render.options.height, wallOptions)
    ];

    const obstacle = Bodies.rectangle(render.options.width / 2, render.options.height / 2, 120, 25, {
        isStatic: true,
        angle: Math.PI / 8, // Give it a slight angle for more interesting bounces
        render: { fillStyle: '#0f3460' }
    });

    let target; // Will be initialized by spawnNewTarget

    World.add(world, [turret, obstacle, ...walls]);
    spawnNewTarget(); // Initial spawn

    // --- Game Logic ---
    function fireProjectile(slope, intercept) {
        const projectile = Bodies.circle(turret.position.x, turret.position.y, 5, {
            render: { fillStyle: '#00d1ff' },
            label: 'projectile'
        });

        // Calculate velocity from slope. The vector is (1, m).
        // We normalize it to get a consistent speed.
        const velocityVector = Matter.Vector.normalise({ x: 1, y: slope });
        const speed = 5;

        // The intercept 'b' affects the starting y-position if we were firing from x=0.
        // For simplicity here, we fire from the turret and use the slope for direction.
        // A more advanced implementation could use the intercept to calculate an angle.

        World.add(world, projectile);
        Body.setVelocity(projectile, { x: velocityVector.x * speed, y: velocityVector.y * speed });
    }

    /**
     * Draws the trajectory preview line based on the current input.
     */
    function drawAimingLine() {
        if (!showAimingLine) return;

        const ctx = render.context;
        const turretPos = turret.position;

        // The equation is y = mx + b in world coordinates.
        // We need to convert it to screen coordinates.
        // World origin is at the turret. Screen Y is inverted.
        // y_screen = turret.y - y_world = turret.y - (m*x_world + b)
        // x_screen = turret.x + x_world -> x_world = x_screen - turret.x
        // y_screen = turret.y - (m*(x_screen - turret.x) + b)
        // y_screen = -m*x_screen + m*turret.x + turret.y - b

        const mScreen = -aimSlope; // Slope is inverted for screen coordinates
        const bScreen = aimSlope * turretPos.x + turretPos.y - aimIntercept;

        const x1 = 0;
        const y1 = bScreen;
        const x2 = render.options.width;
        const y2 = mScreen * x2 + bScreen;

        ctx.save();
        ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)'; // Use accent color with transparency
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]); // Dashed line for a preview effect
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws a Cartesian plane grid and axes on the canvas.
     * The origin (0,0) is set at the turret's position.
     */
    function drawGrid(event) {
        const ctx = render.context;
        const canvas = render.canvas;
        const turretPos = turret.position;
        const gridSpacing = 50; // pixels

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw vertical grid lines and X-axis labels
        for (let x = turretPos.x; x < canvas.width; x += gridSpacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            ctx.fillText((x - turretPos.x).toFixed(0), x, turretPos.y + 15);
        }
        for (let x = turretPos.x - gridSpacing; x > 0; x -= gridSpacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            ctx.fillText((x - turretPos.x).toFixed(0), x, turretPos.y + 15);
        }

        // Draw horizontal grid lines (Y-axis is inverted on canvas)
        for (let y = turretPos.y; y > 0; y -= gridSpacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            if (turretPos.y - y !== 0) ctx.fillText((turretPos.y - y).toFixed(0), turretPos.x - 20, y);
        }

        // Draw main axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        // X-axis
        ctx.beginPath(); ctx.moveTo(0, turretPos.y); ctx.lineTo(canvas.width, turretPos.y); ctx.stroke();
        // Y-axis
        ctx.beginPath(); ctx.moveTo(turretPos.x, 0); ctx.lineTo(turretPos.x, canvas.height); ctx.stroke();

        ctx.restore();
    }

    function spawnNewTarget() {
        if (target) {
            World.remove(world, target);
        }

        // Select a random enemy type
        const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];

        const newX = 50 + Math.random() * (render.options.width - 100);
        const newY = 50 + Math.random() * 100;
        target = Bodies.circle(newX, newY, type.radius, {
            isStatic: !type.moving, // Set isStatic based on the type
            render: { fillStyle: type.color },
            label: type.label, // Use the specific label from the type
            // Add custom properties for movement logic to a 'plugin' object
            plugin: {
                isPatrolling: type.moving,
                patrolRange: 100,
                speed: type.speed || 0,
                initialX: newX
            }
        });

        if (type.moving) {
            Body.setVelocity(target, { x: type.speed, y: 0 });
        }

        World.add(world, target);
    }

    /**
     * Main render loop for drawing custom graphics on top of the physics world.
     */
    function onAfterRender() {
        drawGrid();
        drawAimingLine();
    }

    // --- Event Handlers ---
    equationInput.addEventListener('input', () => {
        const equation = equationInput.value.replace(/\s/g, ''); // Remove whitespace
        try {
            // Use a regular expression to robustly parse "mx+b" format
            // This correctly handles negative numbers, decimals, and omitted parts.
            const regex = /^(-?\d*\.?\d*|-?)x?([+-]\d*\.?\d*)?$/;
            const match = equation.match(regex);

            if (!match) {
                showAimingLine = false;
                return;
            }

            const mStr = match[1];
            const bStr = match[2];

            if (equation.includes('x')) {
                aimSlope = (mStr === '' || mStr === '+') ? 1 : (mStr === '-') ? -1 : parseFloat(mStr);
            } else {
                aimSlope = 0; // If 'x' is not present, slope is 0
            }
            aimIntercept = bStr ? parseFloat(bStr) : (equation.includes('x') ? 0 : parseFloat(mStr));

            showAimingLine = !isNaN(aimSlope) && !isNaN(aimIntercept);
        } catch {
            showAimingLine = false;
        }
    });

    vectorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (showAimingLine) {
            // Note: In a standard cartesian plane, a positive slope goes up-right.
            // In canvas/screen coordinates, y is inverted, so a "positive" slope goes down-right.
            // We use a negative slope (-m) to make the projectile go "up" the screen, matching the equation.
            fireProjectile(-aimSlope, aimIntercept);
            equationInput.value = '';
            showAimingLine = false;
        }
    });

    // Draw the grid on top of the world after every render
    Events.on(render, 'afterRender', onAfterRender);

    // After-update event to clean up off-screen projectiles and move enemies
    Events.on(engine, 'afterUpdate', () => {
        // --- Projectile Cleanup ---
        const projectiles = World.allBodies(world).filter(body => body.label === 'projectile');
        projectiles.forEach(proj => {
            // Remove projectiles that are below the screen (they missed)
            if (proj.position.y > render.options.height + 50) {
                World.remove(world, proj);
            }
        });

        // --- Enemy Movement ---
        const movingEnemies = World.allBodies(world).filter(body => body.plugin.isPatrolling);
        movingEnemies.forEach(enemy => {
            const { initialX, patrolRange, speed } = enemy.plugin;
            // Reverse direction if the enemy moves too far from its starting point
            if (enemy.position.x > initialX + patrolRange || enemy.position.x < initialX - patrolRange) {
                Body.setVelocity(enemy, { x: -enemy.velocity.x, y: 0 });
            }
        });
    });

    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            const isProjectileVsTarget =
                (bodyA.label === 'projectile' && bodyB.label.startsWith('target-')) ||
                (bodyB.label === 'projectile' && bodyA.label.startsWith('target-'));

            if (isProjectileVsTarget) {
                const targetBody = bodyA.label.startsWith('target-') ? bodyA : bodyB;
                const enemyType = ENEMY_TYPES.find(type => type.label === targetBody.label);

                if (enemyType) {
                    score += enemyType.points;
                }

                scoreDisplay.textContent = score;
                spawnNewTarget();
                // Remove the projectile that hit
                const projectileToRemove = bodyA.label === 'projectile' ? bodyA : bodyB;
                World.remove(world, projectileToRemove);
            }
        }
    });
});