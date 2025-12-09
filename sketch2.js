function setup() {
    // SVG-Canvas
    createCanvas(600, 800, SVG);
    noLoop(); // nur ein Durchlauf, perfekt für Plotter/SVG

    background(255);

    stroke(0);
    strokeWeight(1);

    drawMinimalTree();
}

function drawMinimalTree() {
    let cx = width * 0.5 + random(-5, 5); // Baumzentrum
    let topY = height * 0.18 + random(-10, 10);
    let baseY = height * 0.68 + random(-15, 15);

    // Breiten der Baum-Segmente
    let baseHalfWidth = width * 0.26 + random(-10, 10);
    let topHalfWidth  = baseHalfWidth * (0.2 + random(-0.05, 0.05));

    // Stamm
    let trunkHeight = random(60, 90);
    let trunkWidth  = baseHalfWidth * 0.22 + random(-4, 4);

    let trunkBottomY = baseY + trunkHeight;
    let trunkTopY    = baseY;

    // leichte Kippung des Stamms
    let trunkTilt = radians(random(-4, 4));

    // Anzahl "Segmente" – also horizontale Stufen, die die Baumkante bilden
    let levels = int(random(6, 10));

    // Wir bauen eine Liste von Punkten für einen einzigen durchgehenden Pfad
    let pts = [];

    // Start: unten am Stamm
    pts.push(createVector(cx, trunkBottomY));

    // Stamm nach oben (leicht gekippt)
    {
        // Wir nähern den schrägen Stamm mit mehreren Punkten an,
        // damit der Plotter eine glatte Linie fährt.
        let steps = 5;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let y = lerp(trunkBottomY, trunkTopY, t);
            let dx = (y - trunkBottomY) * Math.tan(trunkTilt);
            pts.push(createVector(cx + dx, y));
        }
    }

    // Übergang von Stamm zur Basis des Baums
    pts.push(createVector(cx, baseY));

    // Jetzt nach oben in Zickzack-Form → mehrere Baumsegmente
    // Wir laufen von unten (baseY) zu topY und wechseln abwechselnd links/rechts.
    for (let i = 0; i <= levels; i++) {
        let t = i / levels;          // 0..1 von unten nach oben
        let y = lerp(baseY, topY, t);

        // Breite wird nach oben schmaler
        let halfWidth = lerp(baseHalfWidth, topHalfWidth, t);

        // Abwechselnd links / rechts um das Zentrum
        let dir = (i % 2 === 0) ? -1 : 1;

        // Ein bisschen Jitter, damit jede Version leicht anders ist
        let jitterX = random(-5, 5);
        let jitterY = random(-3, 3);

        let x = cx + dir * halfWidth + jitterX;

        pts.push(createVector(x, y + jitterY));
    }

    // Spitze des Baums exakt auf der Mittelachse
    pts.push(createVector(cx + random(-3, 3), topY + random(-3, 3)));

    // Für einen geschlossenen Eindruck gehen wir nun auf einer
    // Mittelachse wieder nach unten zurück – immer noch ohne abzusetzen.
    let centerSteps = levels + 3;
    for (let i = 0; i <= centerSteps; i++) {
        let t = i / centerSteps; // 0..1 von oben nach unten
        let y = lerp(topY, trunkTopY, t);
        // ganz leichte Zufälligkeit, aber deutlich schmaler als die Außenkante
        let jitterX = random(-2, 2);
        let jitterY = random(-2, 2);
        pts.push(createVector(cx + jitterX, y + jitterY));
    }

    // Stamm wieder nach unten zurück
    {
        let steps = 5;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let y = lerp(trunkTopY, trunkBottomY, t);
            let dx = (y - trunkBottomY) * Math.tan(trunkTilt);
            pts.push(createVector(cx + dx, y));
        }
    }

    // Jetzt alles in EINEM beginShape()/endShape() zeichnen
    noFill();
    beginShape();
    for (let p of pts) {
        vertex(p.x, p.y);
    }
    endShape();
}

// Speichern als SVG per Tastendruck
function keyPressed() {
    if (key === 's' || key === 'S') {
        save("tannenbaum_minimal.svg");
    }
}
