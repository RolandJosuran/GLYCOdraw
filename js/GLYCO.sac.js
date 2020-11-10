//****************************************************************************************
// GLYCOdraw symbols for monosaccharide representation
//****************************************************************************************
/* global d3 */
/* global GLYCO */
/**
 * Constructor of base monosaccharide object
 * 
 * @param {GLYCO.sacEnum} [sacEnum] Enum type for monosaccharide
 * @param {GLYCO.sac} [parent] Parent monosaccharid
 * @param {number=} [x] Optional x coordinate
 * @param {number=} [y] Optional y coordinate
 * @returns {object} Monosaccharide
 * */
GLYCO.sac = function (sacEnum, parent, x, y) {

    // Base properties
    this.sacEnum = sacEnum;
    this.symbol = GLYCO.getSym(sacEnum);
    this.color = GLYCO.getColor(sacEnum);
    this.id = GLYCO.idCount++;
    this.parent = parent;
    this.children = new Array();
    this.target = null;
    this.x = isNaN(x) ? parent.x : x;
    this.y = isNaN(y) ? parent.y : y;
    this.linkRegion = sacEnum == GLYCO.sacEnum.dHex.Fuc || sacEnum == GLYCO.sacEnum.Pent.Xyl ? -1 : 0;
    this.isEdge = false;
    this.selected = false;
 
    return this;
}

/**
 * Render monosaccharid
 * 
 * @param {object} [target] d3.js selection of target
 * @returns {object} Monosaccharid
 */
GLYCO.sac.prototype.render = function (target) {
    var sac = this;

    // Set node to append
    sac.target = target;

    // Make a group for the symbol
    var g = sac.target
        .append("g")
        .attr("id", sac.symbol + "_" + sac.id)
        .attr("class",  "sac " + sac.symbol)
        .attr("transform", `translate(${sac.x}, ${sac.y})`)
        .attr("clip-path", "url(#canvasClipPath)");

    // Append symbol
    symbol = g.append("g")
        .attr("fill", sac.color);

    // Check if AllA or IdoA for mirroring upsidedown
    if (sac.sacEnum == GLYCO.sacEnum.HexA.AllA || sac.sacEnum == GLYCO.sacEnum.HexA.IdoA) {
        symbol.append("g").attr("transform", `translate(0, ${GLYCO.sacSize}) scale(1, -1)`);
    }

    //// Append defs of symbol shape
    //symbol.append("use")
    //    .attr("xlink:href", "#def_" + GLYCO.getType(sac.sacEnum));

    // Get monosaccharide type
    let type = Math.floor((sac.sacEnum / 10) % 10);

    // Append symbol
    switch (type) {
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
            if (type == GLYCO.typeEnum.HexNAc) break;

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
            if (type == GLYCO.typeEnum.HexN) break;

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
            if (type == GLYCO.typeEnum.dHex) break;

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


    // Return group with rendered monosaccharid
    return g;
}
