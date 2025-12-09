let treeTop, treeLeft, treeRight;
let trunkTopY, trunkBottomY;
let ornamentColors = [];
let ornaments = [];
let ornamentRadii = [];

function setup() {
    // SVG-Canvas
    createCanvas(600, 800, SVG);
    noLoop(); // Nur ein Frame, perfekt für Plotter/SVG

    randomizeTreeGeometry();
    randomizeOrnaments();

    drawTreeScene();
}

// Definiert zufällige Geometrie für Baum & Stamm
function randomizeTreeGeometry() {
    background(255);
    stroke(0);
    noFill();

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

// Erzeuge zufällige Kugel-Positionen & -Radien
function randomizeOrnaments() {
    // Wenn du später doch für Screen-Farben willst, lass HSB hier drin.
    colorMode(HSB, 360, 100, 100);
    ornamentColors = [];
    ornaments = [];
    ornamentRadii = [];

    let count = int(random(8, 18));
    let baseHues = [0, 30, 60, 120, 200, 280, 320];

    for (let i = 0; i < count; i++) {
        let hue = random(baseHues) + random(-10, 10);
        let sat = random(55, 95);
        let bri = random(60, 100);
        ornamentColors.push(color(hue, sat, bri));

        // Punkt zufällig in Baumsilhouette
        let p = randomPointInTriangle(treeTop, treeLeft, treeRight);
        if (p.y > (treeLeft.y - 10)) {
            p.y = treeLeft.y - random(15, 40);
        }
        ornaments.push(p);

        // Kugelradius hier festlegen und merken
        let r = random(9, 15);
        ornamentRadii.push(r);
    }

    colorMode(RGB, 255);
}

// Hauptzeichnen
function drawTreeScene() {
    background(255);
    stroke(0);
    strokeWeight(1);

    drawHatchedTree();
    //drawTreeOutline(); // optional
    drawTrunk();
    drawOrnaments();
}

// Zeichnet den Baum als schraffierte Fläche, aber mit Lücken an den Kugeln
function drawHatchedTree() {
    let spacing = 12;
    let jitter  = 2;
    let topY    = treeTop.y;
    let baseY   = (treeLeft.y + treeRight.y) * 0.5;

    for (let y = topY; y <= baseY; y += spacing) {
        let t = (y - topY) / (baseY - topY);

        let leftX  = lerp(treeTop.x, treeLeft.x, t);
        let rightX = lerp(treeTop.x, treeRight.x, t);

        let x1 = leftX  + random(-jitter, jitter);
        let x2 = rightX + random(-jitter, jitter);
        let y1 = y + random(-jitter, jitter);
        let y2 = y + random(-jitter, jitter);

        // Statt direkt line(...):
        drawSegmentWithOrnamentHoles(x1, y1, x2, y2);
    }
}

// Zeichnet einen Linien-Segment, aber schneidet Löcher an allen Kugeln heraus
function drawSegmentWithOrnamentHoles(x1, y1, x2, y2) {
    // t-Bereiche [t0, t1], die aktuell noch gezeichnet werden
    let segments = [{ t0: 0, t1: 1 }];

    for (let i = 0; i < ornaments.length; i++) {
        let cx = ornaments[i].x;
        let cy = ornaments[i].y;
        let r  = ornamentRadii[i] + 1; // kleiner Extra-Abstand

        segments = cutSegmentsWithCircle(segments, x1, y1, x2, y2, cx, cy, r);
        if (segments.length === 0) break;
    }

    // Übrig gebliebene Teilstücke zeichnen
    for (let seg of segments) {
        let t0 = seg.t0;
        let t1 = seg.t1;
        if (t1 <= t0) continue;

        let sx1 = lerp(x1, x2, t0);
        let sy1 = lerp(y1, y2, t0);
        let sx2 = lerp(x1, x2, t1);
        let sy2 = lerp(y1, y2, t1);

        line(sx1, sy1, sx2, sy2);
    }
}

// schneidet eine Liste von [t0,t1]-Segmenten mit einem Kreis
function cutSegmentsWithCircle(segments, x1, y1, x2, y2, cx, cy, r) {
    let result = [];
    let dx = x2 - x1;
    let dy = y2 - y1;

    let fx = x1 - cx;
    let fy = y1 - cy;

    let a = dx * dx + dy * dy;
    let b = 2 * (fx * dx + fy * dy);
    let c = fx * fx + fy * fy - r * r;

    let disc = b * b - 4 * a * c;

    if (disc <= 0) {
        // Kein Schnitt mit unendlicher Linie -> alles bleibt
        return segments.slice();
    }

    let sqrtD = sqrt(disc);
    let tA = (-b - sqrtD) / (2 * a);
    let tB = (-b + sqrtD) / (2 * a);

    let tStart = min(tA, tB);
    let tEnd   = max(tA, tB);

    // Schnitt liegt komplett außerhalb des Segments
    if (tEnd <= 0 || tStart >= 1) {
        return segments.slice();
    }

    // auf [0,1] clampen
    tStart = max(0, tStart);
    tEnd   = min(1, tEnd);

    for (let seg of segments) {
        let s0 = seg.t0;
        let s1 = seg.t1;

        // wenn gar keine Überlappung
        if (tEnd <= s0 || tStart >= s1) {
            result.push(seg);
            continue;
        }

        // vier Fälle:
        // 1) Kreis schneidet innen -> segment wird ggf. in zwei Teile gesplittet
        if (tStart > s0) {
            result.push({ t0: s0, t1: tStart });
        }
        if (tEnd < s1) {
            result.push({ t0: tEnd, t1: s1 });
        }
        // Der Bereich [max(s0,tStart), min(s1,tEnd)] wird einfach weggelassen (Loch)
    }

    return result;
}

// Figurale Kontur des Baums (optional)
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
    let trunkWidth = (treeRight.x - treeLeft.x) * 0.1 + random(-5, 5);
    let trunkX = (treeLeft.x + treeRight.x) / 2 - trunkWidth / 2;

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

// Kugeln – nur Outline, keine Füllung, einfarbig
function drawOrnaments() {
    noFill();
    stroke(0);
    strokeWeight(0.8);
    for (let i = 0; i < ornaments.length; i++) {
        let p = ornaments[i];
        let r = ornamentRadii[i];
        circle(p.x, p.y, r * 2);
    }
}

// Punkt zufällig in Dreieck
function randomPointInTriangle(a, b, c) {
    let r1 = random();
    let r2 = random();

    if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
    }

    let x = a.x + r1 * (b.x - a.x) + r2 * (c.x - a.x);
    let y = a.y + r1 * (b.y - a.y) + r2 * (c.y - a.y);
    return createVector(x, y);
}

// SVG speichern per Tastendruck
function keyPressed() {
    if (key === 's' || key === 'S') {
        save("tannenbaum.svg");
    }
}
