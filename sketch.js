let treeTop, treeLeft, treeRight;
let trunkTopY, trunkBottomY;
let ornamentColors = [];
let ornaments = [];

function setup() {
    // SVG-Canvas
    createCanvas(600, 800, SVG);
    noLoop(); // Nur ein Frame, perfekt für Plotter/SVG

    // Leichter Zufall in Gesamt-Layout
    randomizeTreeGeometry();
    randomizeOrnaments();

    drawTreeScene();
}

// Definiert zufällige Geometrie für Baum & Stamm
function randomizeTreeGeometry() {
    background(255);
    stroke(0);
    noFill();

    // Leichte Zufallsvariation von Breite/Höhe des Baums
    let topY = height * 0.12 + random(-15, 15);
    let baseY = height * 0.65 + random(-20, 20);
    let centerX = width * 0.5 + random(-10, 10);
    let baseHalfWidth = width * 0.28 + random(-15, 15);

    treeTop   = createVector(centerX + random(-10, 10), topY);
    treeLeft  = createVector(centerX - baseHalfWidth + random(-5, 5), baseY);
    treeRight = createVector(centerX + baseHalfWidth + random(-5, 5), baseY);

    // Stamm-Geometrie mit etwas Zufall
    trunkTopY    = baseY + 10 + random(-5, 5);
    trunkBottomY = trunkTopY + random(60, 90);
}

// Erzeuge zufällige Kugel-Farben & -Positionen
function randomizeOrnaments() {
    // Farbmodus: HSB für bunte Kugeln
    colorMode(HSB, 360, 100, 100);
    ornamentColors = [];
    ornaments = [];

    // 5–20 Kugeln
    let count = int(random(8, 18));

    // Grundfarben (in HSB)
    let baseHues = [0, 30, 60, 120, 200, 280, 320]; // rot, orange, gelb, grün, blau, violett, pink

    for (let i = 0; i < count; i++) {
        let hue = random(baseHues) + random(-10, 10);
        let sat = random(55, 95);
        let bri = random(60, 100);
        ornamentColors.push(color(hue, sat, bri));

        // Punkt zufällig in Baumsilhouette
        let p = randomPointInTriangle(treeTop, treeLeft, treeRight);
        // Optional: etwas Luft zur Basis, damit nicht zu weit unten
        if (p.y > (treeLeft.y - 10)) {
            p.y = treeLeft.y - random(15, 40);
        }
        ornaments.push(p);
    }

    // Zurück zu RGB für alles andere
    colorMode(RGB, 255);
}

// Hauptzeichnen
function drawTreeScene() {
    background(255);
    stroke(0);
    strokeWeight(1);

    // Baum-Schraffur
    drawHatchedTree();
    // Baumkontur oben drauf
    //drawTreeOutline();
    // Stamm
    drawTrunk();
    // Kugeln
    drawOrnaments();
}

// Zeichnet den Baum als schraffierte Fläche
function drawHatchedTree() {
    // Parameter für Schraffur
    let spacing = 6;                // Abstand zwischen Linien
    let jitter  = 2;                // leichtes Zittern
    let topY    = treeTop.y;
    let baseY   = (treeLeft.y + treeRight.y) * 0.5;

    // Für jede horizontale "Schraffur-Reihe"
    for (let y = topY; y <= baseY; y += spacing) {
        // Interpolationsfaktor von Spitze (0) bis Basis (1)
        let t = (y - topY) / (baseY - topY);

        // Linke & rechte x-Koordinate auf Höhe y
        let leftX  = lerp(treeTop.x, treeLeft.x, t);
        let rightX = lerp(treeTop.x, treeRight.x, t);

        // leichte Variation: Linien nicht genau horizontal
        let x1 = leftX  + random(-jitter, jitter);
        let x2 = rightX + random(-jitter, jitter);
        let y1 = y + random(-jitter, jitter);
        let y2 = y + random(-jitter, jitter);

        line(x1, y1, x2, y2);
    }
}

// Figurale Kontur des Baums
function drawTreeOutline() {
    noFill();
    stroke(0);
    strokeWeight(1.5);

    beginShape();
    vertex(treeLeft.x, treeLeft.y);
    vertex(treeTop.x, treeTop.y);
    vertex(treeRight.x, treeRight.y);
    endShape(CLOSE);
}

// Zeichnet den Stamm
function drawTrunk() {
    let trunkWidth = (treeRight.x - treeLeft.x) * 0.18 + random(-5, 5);
    let trunkX = (treeLeft.x + treeRight.x) / 2 - trunkWidth / 2;

    // leichte Kippung
    let tilt = random(-3, 3);

    push();
    translate(trunkX + trunkWidth / 2, (trunkTopY + trunkBottomY) / 2);
    rotate(radians(tilt));
    rectMode(CENTER);
    noFill();
    stroke(0);
    rect(0, 0, trunkWidth, trunkBottomY - trunkTopY);
    pop();
}

// Kugeln auf den Baum
function drawOrnaments() {
    stroke(0);
    strokeWeight(0.8);
    for (let i = 0; i < ornaments.length; i++) {
        let p = ornaments[i];
        let c = ornamentColors[i];

        let r = random(7, 14); // Kugelradius

        fill(c);
        circle(p.x, p.y, r * 2);
    }
}

// Hilfsfunktion: Punkt zufällig in Dreieck (Baryzentrische Koordinaten)
function randomPointInTriangle(a, b, c) {
    let r1 = random();
    let r2 = random();

    // Faltet Punkte über die Diagonale, damit sie im Dreieck landen
    if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
    }

    let x = a.x + r1 * (b.x - a.x) + r2 * (c.x - a.x);
    let y = a.y + r1 * (b.y - a.y) + r2 * (c.y - a.y);
    return createVector(x, y);
}

// Optional: SVG speichern per Tastendruck
function keyPressed() {
    if (key === 's' || key === 'S') {
        save("tannenbaum.svg");
    }
}
