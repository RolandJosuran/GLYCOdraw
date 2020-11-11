//****************************************************************************************
// GLYCOdraw: Workspace for drawing the glycan
//****************************************************************************************
/* global d3 */
/* global GLYCO */

/**
 * Constructor of base glycan object
 * 
 * @param {string} [id] HTML id of div that contains the svg glycan
 * @param {number=} height SVG height
 * @param {number=} width SVG width
 * @param {string=} theme Black or white theme
 * @returns {object} draw
 * */
GLYCO.draw = function (id, height, width, theme = "white") {

    // Base properties
    this.id = id || this.id;
    this.svg = null;
    this.meta = null;
    this.defs = null;
    this.width = null;
    this.height = null;
    this.theme = theme;

    // Set dimensions
    this.margin = 15;
    this.aspectRatio = 1.618;
    this.toolbarHeight = 650;

    // Height and width
    this.width = width || d3.select(id).node().clientWidth - (2 * this.margin);
    if (this.width < 0) this.width = 0;
    if (height) {
        this.height = height;
        this.aspectRatio = this.width / this.height;
    } else {
        this.height = Math.floor(this.width / this.aspectRatio) + this.toolbarHeight;
    }

    // Components
    this.toolbar = null;
    this.canvas = null;
    this.glycan = null;

    // Render the svg
    // --------------
    // select and create the svg container
    this.svg = d3.select(this.id).append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("version", "1.1")
        .attr("baseProfile", "full")
        .attr("width", this.width)
        .attr("height", this.height);

    // Set meta information e.g. styles (CSS)
    this.meta = this.svg.append("g")
        .attr("class", "meta")
        .attr("id", "meta");

    // Set background
    this.meta.append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("pointer-events", "all")
        .style("fill", this.theme);

    // Set title of svg
    this.meta.append("title")
        .text("GLYCOdraw");

    // Set description of svg
    this.meta.append("desc")
        .text("A JavaScript library to draw glycan structures.");

    // Set svg styles
    this.meta.append("style")
        .text(
`text {
    font-family: Segoe UI, -apple - system, Roboto, Helvetica Neue, Arial, sans - serif;
}
.sac {
    cursor: pointer;
}
.sac:hover {
    stroke-width: 2;
    overflow: visible;
}
.button {
    cursor: pointer;
}
.button:hover:not(.selected) {
    fill-opacity: 0.125 !important;
}`);



    // Initialise components
    //this.renderDefs();
    this.toolbar = new GLYCO.toolbar(this.svg);
    this.canvas = new GLYCO.canvas(this.svg, this.width, this.height, this.toolbar);

    // ##### TODO download
    this.toolbar.file.selectAll("#download > *")
        .on("click", () => this.canvas.glycan.download());

    return this;
}

// ###### currently not used #####

/**
 * Render defs in draw
 * 
 * @returns {object} draw
 * */
GLYCO.draw.prototype.renderDefs = function () {
    var draw = this;

    // Create defs object
    draw.defs = draw.svg.append("defs");

    // Add monosaccharide symbols zu defs
    var gSacs = draw.defs.append("g")
        .attr("id", "defSac");

    // Add a symbol for each monosaccharide to defs
    for (const [key, value] of Object.entries(GLYCO.typeEnum)) {

        // Add group for each monosaccharide
        let symbol = gSacs.append("g");

        // Set id
        symbol.attr("id", "def_" + key);

        // Append symbol
        switch (value) {
            case GLYCO.typeEnum.redEnd:
                symbol.append("circle")
                    .attr("r", GLYCO.sacSize / 4)
                    .attr("cx", GLYCO.sacSize / 2)
                    .attr("cy", GLYCO.sacSize / 2)
                    .style("stroke", "#888");
                break;
            case GLYCO.typeEnum.Hex:
                symbol.append("circle")
                    .attr("r", GLYCO.sacSize / 2)
                    .attr("cx", GLYCO.sacSize / 2)
                    .attr("cy", GLYCO.sacSize / 2)
                    .style("stroke", "#888");
                break;
            case GLYCO.typeEnum.HexNAc:
            case GLYCO.typeEnum.HexN:
            case GLYCO.typeEnum.HexA: {
                symbol.append("rect")
                    .attr("width", GLYCO.sacSize)
                    .attr("height", GLYCO.sacSize)
                    .style("stroke", "#888");
                if (value == GLYCO.typeEnum.HexNAc) break;

                // HexN
                // HexA
                // p1         y1
                // |  \ 
                // |     \
                // p2_____p3  y2
                // x1     x2
                const
                    x1 = 0,
                    x2 = y2 = GLYCO.sacSize,
                    y1 = 0,
                    p1 = x1 + " " + y1,
                    p2 = x1 + " " + y2,
                    p3 = x2 + " " + y2,
                    p = p1 + ", " + p2 + ", " + p3;
                symbol.append("polygon")
                    .attr("points", p)
                    .attr("fill", "#FFFFFF")
                    .style("stroke", "#888");
                if (value == GLYCO.typeEnum.HexN) break;

                // HexA
                symbol.attr("transform", `translate(0, ${GLYCO.sacSize / 2}) rotate(-45) scale(${1 / Math.sqrt(2)})`);
                break;
            }
            case GLYCO.typeEnum.dHex:
            case GLYCO.typeEnum.dHexNAc: {
                //    p1     y1
                //   /|\ 
                //  / | \
                // p2_p4_p3  y2
                // x1 x2 x3
                const
                    h = Math.sqrt(3) * GLYCO.sacSize / 2
                x1 = 0,
                    x2 = GLYCO.sacSize / 2,
                    x3 = GLYCO.sacSize,
                    y1 = 0,//(GLYCO.sacSize - h) / 2,
                    y2 = h, //GLYCO.sacSize - (GLYCO.sacSize - h) / 2,
                    p1 = x2 + " " + y1,
                    p2 = x1 + " " + y2,
                    p3 = x3 + " " + y2,
                    p4 = x2 + " " + y2,
                    p = p1 + ", " + p2 + ", " + p3;
                symbol.append("rect")
                    .attr("width", GLYCO.sacSize)
                    .attr("height", GLYCO.sacSize)
                    .attr("fill", "none");
                symbol.append("polygon")
                    .attr("points", p)
                    .style("stroke", "#888");
                if (value == GLYCO.typeEnum.dHex) break;

                // dHexNAc
                symbol.append("polygon")
                    .attr("points", p1 + ", " + p2 + ", " + p4)
                    .attr("fill", "#FFFFFF")
                    .style("stroke", "#888");
                break;
            }
            case GLYCO.typeEnum.ddHex:
                symbol.attr("transform", `translate(0, ${GLYCO.sacSize / 4})`);
                symbol.append("rect")
                    .attr("width", GLYCO.sacSize)
                    .attr("height", GLYCO.sacSize / 2)
                    .style("stroke", "#888");
                break;
            case GLYCO.typeEnum.Pent: {
                // Get points for star
                var r1 = GLYCO.sacSize / 2;
                var r2 = r1 / 2;
                var radP = []
                for (var p = 0; p < 11; p++) {
                    if (p % 2 == 0) {
                        radP[p] = [Math.PI * 0.2 * p, r1];
                    } else {
                        radP[p] = [Math.PI * 0.2 * p, r2];
                    }
                }
                var lRad = d3.radialLine();
                symbol.attr("transform", `translate(${GLYCO.sacSize / 2}, ${GLYCO.sacSize / 2})`);
                symbol.append("path")
                    .attr("d", lRad(radP))
                    .style("stroke", "#888");
                break;
            }
            case GLYCO.typeEnum.Sia:
                symbol.attr("transform", `translate(0, ${GLYCO.sacSize / 2}) rotate(-45) scale(${1 / Math.sqrt(2)})`);
                symbol.append("rect")
                    .attr("width", GLYCO.sacSize)
                    .attr("height", GLYCO.sacSize)
                    .style("stroke", "#888");
                break;
        }
    }

    return draw;
}


GLYCO.draw.prototype.dragstarted = function (event, d) {
    var draw = this;

    // Clone monosaccharid to add to glycan
    var sacObj = new GLYCO.sac(d.sacEnum);

    // Set cloning position
    sacObj.pos = {
        x: d.pos.x,
        y: d.pos.y - draw.toolbarHeight
    }
    var sac = sacObj.render(draw.canvas.glycan.g);

    // Make symbol transparent for pointer events to detect drag over
    sac.selectAll("*").attr("pointer-events", "none");

    // Set global flag for dragging
    GLYCO.dragging = true;

    // it's important that we suppress the mouseover event on the node being dragged.
    // Otherwise it will absorb the mouseover event and the underlying node will not detect it
    // event.sourceEvent.stopPropagation();

    // Drag clone to glycan
    event.on("drag", function (event, d) { draw.dragged(event, d, draw, sac, sacObj) });

    // When finaly dragging has ended
    event.on("end", function (event, d) { draw.dragended(event, d, draw, sac, sacObj) });

    return sac;
}

GLYCO.draw.prototype.dragged = function (event, d, draw, sac, sacObj) {
    sacObj.pos.x += event.dx;
    sacObj.pos.y += event.dy;
    sac.attr("transform", "translate(" + (sacObj.pos.x) + ", " + (sacObj.pos.y) + ")");
}

GLYCO.draw.prototype.dragended = function (event, d, draw, sac, sacObj) {

    // Remove global flagg for dragging
    GLYCO.dragging = false;

    // Don't add monosaccharide, if no well is reached
    if (!draw.canvas.dragTarget) {
        sac.remove();
        return;
    }

    // Set target cell
    sacObj.cell = d3.select(draw.canvas.dragTarget).data()[0];

    // reset dragTarget
    draw.canvas.dragTarget = null;

    // Join sac to glycan
    draw.canvas.joinSac(sacObj);

    return;
}