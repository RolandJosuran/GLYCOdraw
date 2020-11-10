//****************************************************************************************
// GLYCOglycan: Complete glycan structure
//
// A glycan is a grid with monosaccaride object in cells
//****************************************************************************************
/* global d3 */
/* global GLYCO */

/**
 * Constructor of base glycan object
 * 
 * @param {Object} [canvas] Canvas object
* @param {Object} [origin] Root of glycan tree
 * @returns {object} Glycan
 * */
GLYCO.glycan = function (canvas, origin) {

    // SVG objects
    this.canvas = canvas || this.canvas;
    this.g = null;
    this.origin = origin;

    // Glycan data
    let originX = this.canvas.scales.x(this.canvas.domains.x[1]);
    let originY = this.canvas.scales.y(this.canvas.domains.y[1] / 2);
    this.data = new GLYCO.sac(GLYCO.sacEnum.redEnd.redEnd, null, originX, originY);
    this.data.children.push(new GLYCO.sac(GLYCO.sacEnum.HexNAc.GlcNAc, this.data));
    this.tree = data => {
        return d3.tree().nodeSize([1, 1])(d3.hierarchy(data));
    };
    this.root = this.tree(this.data);

    // Initialise glycan
    // Create svg objects
    this.g = this.canvas.g.append("svg")
        .attr("id", "glycan");
    this.l = this.g.append("g")
        .attr("id", "linkages")
        .style('stroke', '#888')
        .style('stroke-width', '3px');

    return this;
}

GLYCO.glycan.prototype.render = function () {
    var glycan = this;

    // Add new data to glycan root
    glycan.root = d3.tree()(d3.hierarchy(glycan.data));

    // Update separation for proper positioning of Fuc. Read about separation: https://github.com/d3/d3-hierarchy#tree_separation
    glycan.root = d3.tree().separation((a, b) => {

        // All nodes with the same column (equal depth)
        let cousins = glycan.root.descendants().filter(d => d.depth == b.depth);
        let index = cousins.findIndex(c => c.data === b.data);

        // Check if its Fuc in upper position
        if (b.data.linkRegion < 0) {

            // Check if there is nothing else than Fuc on top
            function searchUp(i) {
                if (i == 0) {
                    return b.data.isEdge = true;
                } else if (cousins[i - 1].data.linkRegion < 0) {
                    i--;
                    return cousins[i].data.isEdge = searchUp(i);
                } else {
                    return b.data.isEdge = false;
                }
            }

            // Recursively search up
            return searchUp(index) ? 0 : 1;
        }

        // Check if its Fuc in lower position
        if (a.data.linkRegion > 0) {

            // Check if there is nothing else than Fuc below
            function searchDown(i) {
                if (i == cousins.length - 1) {
                    return a.data.isEdge = true;
                } else if (cousins[i + 1].data.linkRegion > 0) {
                    i++;
                    return cousins[i].data.isEdge = searchDown(i);
                } else {
                    return a.data.isEdge = false;
                }
            }

            // Recursively search down
            return searchDown(index) ? 0 : 1;
        }

        // All other situations
        return 1;
    }).nodeSize([1, 1])(d3.hierarchy(glycan.data));

    // Draw monosaccharides at their origin position
    draw();

    // Set final position
    glycan.root.descendants().forEach(d => glycan.setPosition(d));

    // Update positions with transition
    draw();

    function draw() {
        // Render links
        glycan.l.selectAll("line.linkage")
            .data(glycan.root.descendants().slice(1).sort((a, b) => a.data.id - b.data.id))
            .join(
                enter => enter.append("line")
                    .attr("class", "linkage")
                    .attr("x1", d => d.data.x + (GLYCO.sacSize / 2))
                    .attr("y1", d => d.data.y + (GLYCO.sacSize / 2))
                    .attr("x2", d => d.data.parent.x + (GLYCO.sacSize / 2))
                    .attr("y2", d => d.data.parent.y + (GLYCO.sacSize / 2))
                    .attr("clip-path", "url(#canvasClipPath)"),
                update => update.call(update => update.transition()
                    .attr("x1", d => d.data.x + (GLYCO.sacSize / 2))
                    .attr("y1", d => d.data.y + (GLYCO.sacSize / 2))
                    .attr("x2", d => d.data.parent.x + (GLYCO.sacSize / 2))
                    .attr("y2", d => d.data.parent.y + (GLYCO.sacSize / 2))
                ),
                exit => exit.remove()
            );

        // Render monosaccharides
        glycan.g.selectAll(".sac")
            .data(glycan.root.descendants().sort((a, b) => a.data.id - b.data.id))
            .join(
                enter => enter.append(d => d.data.render(glycan.g).node())
                    .call(d3.drag().on("start", (event, d) => glycan.canvas.dragstarted(event, d)))
                    .attr("pointer-events", "none"),
                update => update.call(update => update.transition()
                    .attr("transform", d => `translate(${d.data.x}, ${d.data.y})`)
                    .attr("pointer-events", "none")
                    .on("end", () => update.attr("pointer-events", null))
                    ),
                exit => exit.remove()
            );

    }

    return glycan;
}

GLYCO.glycan.prototype.setPosition = function (node) {
    var glycan = this;

    // Let D3 calculate x position
    node.data.x = glycan.canvas.scales.x(-node.y + glycan.canvas.domains.x[1]);

    // Fuc on edges needs additional distance
    if (node.data.isEdge) {

        // Get index of node in siblings
        let i = node.parent.children.findIndex(c => c === node);

        // Get neighbouring position
        // Get relative position to sister
        let x = node.parent.children.length > 1 ? node.parent.children[i - node.data.linkRegion].x : node.x;

        // ###### TODO ###### for consecutive Fuc add y for each
        node.data.y = glycan.canvas.scales.y(node.x + node.data.linkRegion + glycan.canvas.domains.y[1] / 2);

    } else {

        // All the others in normal positon
        node.data.y = glycan.canvas.scales.y(node.x + glycan.canvas.domains.y[1] / 2);

    }

    return glycan;
}

/**
 * Make a download for the chart as *.svg
 * 
 * @param {string} filename OPTIONAL Name of download file
 * @return {object} Chart
 */
GLYCO.glycan.prototype.download = function (filename) {
    var glycan = this;

    // Make filename and suffix optional
    filename = filename || "Glycan.svg";
    var suffix = ".svg";
    if (filename.indexOf(suffix, filename.length - suffix.length) === -1) {
        filename += ".svg";
    }

    // get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(glycan.g.node());

    // add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // add xml declaration
    source = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + source;

    // Make a blob with the correct type header
    var blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {

        // Create an anchor element to the svg blob and remove it after download
        var element = window.document.createElement('a');
        element.href = window.URL.createObjectURL(blob);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(element.href);
    }

    return glycan;
};
