function setup() {
    createCanvas(600, 800, SVG);
    noLoop();

    background(255);
    stroke(0);
    strokeWeight(1);

    drawMinimalTreeWithOrnaments();
}

function drawMinimalTreeWithOrnaments() {
    let cx = width * 0.5 + random(-5, 5);    // Baumzentrum
    let topY = height * 0.18 + random(-10, 10);
    let baseY = height * 0.68 + random(-15, 15);

    let baseHalfWidth = width * 0.26 + random(-10, 10);
    let topHalfWidth  = baseHalfWidth * (0.2 + random(-0.05, 0.05));

    let trunkHeight = random(60, 90);
    let trunkWidth  = baseHalfWidth * 0.22 + random(-4, 4);

    let trunkBottomY = baseY + trunkHeight;
    let trunkTopY    = baseY;

    let trunkTilt = radians(random(-4, 4));
    let levels = int(random(6, 10));

    let basePts = [];

    // Start: unten am Stamm
    basePts.push(createVector(cx, trunkBottomY));

    // Stamm hoch (leicht gekippt, in mehreren Schritten)
    {
        let steps = 5;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let y = lerp(trunkBottomY, trunkTopY, t);
            let dx = (y - trunkBottomY) * Math.tan(trunkTilt);
            basePts.push(createVector(cx + dx, y));
        }
    }

    // Basis Baum
    basePts.push(createVector(cx, baseY));

    // Zickzack nach oben – mehrere Segmente
    for (let i = 0; i <= levels; i++) {
        let t = i / levels;
        let y = lerp(baseY, topY, t);
        let halfWidth = lerp(baseHalfWidth, topHalfWidth, t);

        let dir = (i % 2 === 0) ? -1 : 1;

        let jitterX = random(-5, 5);
        let jitterY = random(-3, 3);

        let x = cx + dir * halfWidth + jitterX;
        basePts.push(createVector(x, y + jitterY));
    }

    // Spitze
    basePts.push(createVector(cx + random(-3, 3), topY + random(-3, 3)));

    // Mitte wieder nach unten Richtung Stammoberkante
    let centerSteps = levels + 3;
    for (let i = 0; i <= centerSteps; i++) {
        let t = i / centerSteps;
        let y = lerp(topY, trunkTopY, t);
        let jitterX = random(-2, 2);
        let jitterY = random(-2, 2);
        basePts.push(createVector(cx + jitterX, y + jitterY));
    }

    // Stamm wieder runter
    {
        let steps = 5;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let y = lerp(trunkTopY, trunkBottomY, t);
            let dx = (y - trunkBottomY) * Math.tan(trunkTilt);
            basePts.push(createVector(cx + dx, y));
        }
    }

    // Jetzt wählen wir ein paar Punkte entlang des Pfads für Kugeln
    let ornamentCount = int(random(3, 7)); // 3–6 Kugeln
    let ornamentIndices = pickOrnamentIndices(basePts.length, ornamentCount);

    // Eine einzige Shape mit Loops für Kugeln
    noFill();
    beginShape();
    for (let i = 0; i < basePts.length; i++) {
        let p = basePts[i];
        vertex(p.x, p.y);

        // An ausgewählten Stellen: kleiner Kreisloop
        if (ornamentIndices.has(i)) {
            addCircleLoopVertices(p.x, p.y, random(8, 14), 16);
        }
    }
    endShape();
}

// Wählt zufällige Indizes im Pfad für Kugeln (nicht zu dicht an den Enden)
function pickOrnamentIndices(len, count) {
    let indices = new Set();
    if (len < 10) return indices;

    let minIndex = 3;
    let maxIndex = len - 4;

    let maxAttempts = 50;
    let attempts = 0;

    while (indices.size < count && attempts < maxAttempts) {
        let idx = int(random(minIndex, maxIndex));
        // nicht zu nah beieinander
        let tooClose = false;
        indices.forEach(i => {
            if (abs(i - idx) < 3) tooClose = true;
        });
        if (!tooClose) {
            indices.add(idx);
        }
        attempts++;
    }
    return indices;
}

// Fügt eine Kreisapproximation als Loop in den laufenden Pfad ein
// – OHNE beginShape/endShape oder Pen-Absetzen.
function addCircleLoopVertices(cx, cy, r, segments) {
    for (let i = 0; i <= segments; i++) {
        let t = i / segments;
        let angle = t * TWO_PI;
        let x = cx + cos(angle) * r;
        let y = cy + sin(angle) * r;
        vertex(x, y);
    }
}

// SVG speichern per Tastendruck
function keyPressed() {
    if (key === 's' || key === 'S') {
        save("tannenbaum_minimal_kugeln.svg");
    }
}
