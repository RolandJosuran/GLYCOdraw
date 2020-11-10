//****************************************************************************************
// Canvas: Area for drawing
//****************************************************************************************
/* global d3 */
/* global GLYCO */

/**
 * Constructor of canvas
 *
 * @param {number} [height] SVG height
 * @param {number} [width] SVG width
 * @returns {object} draw
 * */
GLYCO.canvas = function (svg, width, height, toolbar) {

    // Toolbar property
    this.toolbar = toolbar;

    // Root for glycan
    this.root = {
        x: (width - GLYCO.sacSize) / 2,
        y: GLYCO.sacSize
        //x: width - GLYCO.sacSize,
        //y: (height - GLYCO.sacSize) / 2
    };

    // SVG properties
    this.height = height - this.toolbar.height;
    this.width = width;
    this.svg = svg;

    // domains for unzoomed chart
    this.domains = {    
        x0: [0, this.width / GLYCO.sacSize / 2],
        y0: [0, this.height / GLYCO.sacSize / 2],
        x: null,
        y: null
    };
    // set initial domains
    this.domains.x = this.domains.x || this.domains.x0;
    this.domains.y = this.domains.y || this.domains.y0;

    // set scales
    this.scales = {
        x: null,
        y: null
    };
    // ##### only for development #####
    this.setScales();

    // Add group for canvas
    this.g = this.svg.append("g")
        .attr("id", "canvas")
        .attr("transform", `translate(0, ${this.toolbar.height})`);
    this.g.append("clipPath")
        .attr("id", "canvasClipPath")
        .append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("stroke", "#888")
        .style("fill", "none");


    // Glycan
    this.glycan = new GLYCO.glycan(this, this.root);
    this.glycan.render();

    return this;
}

/**
 * Set dimensions of canvas.
 * 
 * @param {string} id Optional HTML id of div that holds the svg chart.
 * @returns {object} D3PLOT chart object.
 */
GLYCO.canvas.prototype.setScales = function () {
    var canvas = this;

    // set scales
    canvas.scales.x = d3.scaleLinear().domain(canvas.domains.x).range([0, canvas.width]).nice();
    canvas.scales.y = d3.scaleLinear().domain(canvas.domains.y).range([0, canvas.height]).nice();

    return this;
};

GLYCO.canvas.prototype.click = function (event, d) {
    var canvas = this;


    // Set flag for click event
    canvas.clicked = true;

    // Generate Monosaccharid and append to data
    d.data.children.push(new GLYCO.sac(
        canvas.toolbar.selected ? canvas.toolbar.selected.sacEnum : d.data.sacEnum,
        d.data.x,
        d.data.y
    ));

    // Rerender glycan
    canvas.glycan.render();

    return canvas;
}

GLYCO.canvas.prototype.dragstarted = function (event, node) {
    var canvas = this;

    // Create new monosaccharid
    var sacObj = new GLYCO.sac(
        canvas.toolbar.selected ? canvas.toolbar.selected.sacEnum : node.data.sacEnum,
        node.data
    )

    // Render monosaccharid at start position and listen for drag
    var sac = sacObj.render(canvas.glycan.g)
        .call(d3.drag().on("start", (event, d) => canvas.dragstarted(event, d)));

    // Drag clone to glycan
    event.on("drag", (e, n) => canvas.dragged(e, n, sacObj, sac));

    // When finaly dragging has ended
    event.on("end", (e, n) => canvas.dragended(e, n, canvas, sacObj, sac) );

    return;
}

GLYCO.canvas.prototype.dragged = function (event, n, sacObj, sac) {

    // Get drag position
    sacObj.x += event.dx;
    sacObj.y += event.dy;

    // Monosaccharide follows cursor
    sac.attr("transform", `translate(${sacObj.x}, ${sacObj.y})`);
}

GLYCO.canvas.prototype.dragended = function (event, n, canvas, sacObj, sac) {

    // For vertically linked monosaccharides
    if (sacObj.linkRegion != 0) {

        // Get index of node in parents children
        let index = n.parent.data.children.indexOf(n.data);

        // Compare relative position to parent (up or down)
        if (sacObj.y < n.data.y) {

            // Check if parent has allready Fuc in direct above position
            if (n.parent.children.filter(d => d.data.linkRegion < 0 && d.data.parent == n.data).length > 0) {
                sac.remove();
                return;
            }

            // Insert above
            sacObj.linkRegion = n.parent.children[index].data.linkRegion - 1;
            n.parent.data.children.splice(index, 0, sacObj);

        } else {

            // Check if parent has allready Fuc in direct below position
            if (n.parent.children.filter(d => d.data.linkRegion > 0 && d.data.parent == n.data).length > 0) {
                sac.remove();
                return;
            }

            // Insert below
            sacObj.linkRegion = n.parent.children[index].data.linkRegion + 1;
            n.parent.data.children.splice(index + 1, 0, sacObj);

        }
    } else if (n.data.children.length == 0) {

        // If there are no children, just push at first
        n.data.children.push(sacObj);

    } else {

        // Get position for non-Fuc monosaccharides
        let inserted = false;

        // Sort from top to bottom
        n.data.children.sort((a, b) => a.y - b.y).entries();

        // Recursion for above
        function searchUp(i) {

            // Check if above position is Fuc
            if (i > 0 && n.data.children[i - 1].linkRegion < 0) {

                // Move new monosaccharid  upwards
                i--;

                // Recursively go upwards
                searchUp(i);

            }

            // Above highest Fuc
            return i;
        }

        // Recursion for below
        function searchDown(i) {

            // Check if below position is Fuc
            if (i < n.data.children.length && n.data.children[i].linkRegion > 0) {

                // Move new monosaccharid  downwards
                i++;

                // Recursively go upwards
                searchDown(i);

            }

            // Below lowest Fuc
            return i;
        }

        
        for (let [i, d] of n.data.children.entries()) {

            // New monosaccharid is just below this child
            if (d.y > sacObj.y) {

                // Check if above position is Fuc
                if (n.data.children[i - 1] && n.data.children[i - 1].linkRegion < 0) {

                    // Move new monosaccharid upwards
                    i = searchUp(i);
                }

                // Check if below position is Fuc
                else if (n.data.children[i].linkRegion > 0) {

                    // Move new monosaccharid downwards
                    i = searchDown(i);
                }

                // Insert monosaccharidat this position to glycan data
                n.data.children.splice(i, 0, sacObj);
                inserted = true;
                break;
            }
        }

        // If new monosaccharid is not inserted...
        if (!inserted) {

            // ... just append it at the end
            n.data.children.push(sacObj);
        }

    }

    // Render glycan
    canvas.glycan.render();

    return;
}