//****************************************************************************************
// GLYCOtoolbar: Toolbar for drawing
//****************************************************************************************
/* global d3 */
/* global GLYCO */

/**
 * Constructor of toolbar
 * @param {object} [svg] d3 selection of svg container
 * @returns {object} toolbar
 * */
GLYCO.toolbar = function (svg) {

    // Dimension
    this.svg = svg;
    this.g = null;
    this.sacTable = null;
    this.file = null;
    this.padding = {
        x: 15,
        y: 5
    }
    this.cols = GLYCO.sym[10].length;
    this.rows = GLYCO.sym.length;
    this.cellWidth = GLYCO.sacSize + 2 * this.padding.x;
    this.cellHeight = GLYCO.sacSize + GLYCO.fontSize * 1.2 + 2 * this.padding.y;
    this.height = this.rows * this.cellHeight;


    // Generate data for toolbar rendering
    this.data = this.getGrid();

    // Toolbar button clicked
    this.selected = null;

    // Render toolbar
    // ---------------
    // Add group for toolbar
    this.g = this.svg.append("g")
        .attr("id", "toolbar");

    // File menu
    // --------------------
    this.file = this.g.append("g")
        .attr("id", "download")
        .attr("transform", `translate(${this.cols * this.cellWidth}, 0)`);
    this.file.append("text")
        .text("Save")
        .attr("x", this.cellWidth / 2)
        .attr("y", this.cellHeight / 2)
        .attr("font-size", GLYCO.fontSize)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("fill", "#888");
    this.file.append("rect")
        .attr("class", "button")
        .attr("width", this.cellWidth)
        .attr("height", this.cellHeight)
        .style("stroke", "#888")
        .style("fill", "#888")
        .style("fill-opacity", 0);

    // Full palett of monosaccharides
    // --------------------
    this.sacTable = this.g.append("g")
        .attr("id", "sacTable");

    // Draw grid for buttons https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739
    var col = this.sacTable.selectAll(".col")
        .data(this.data)
        .enter().append("g")
        .attr("class", "col");
    var row = col.selectAll(".button")
        .data(function (d) {
            return d;
        })
        .enter();

    // Append cells
    cell = row.append("g")
        .attr("transform", function (d) {
            return `translate(${d.x}, ${d.y})`;
        })

    // Write name
    cell.append("text")
        .text(d => GLYCO.getSym(d.sacEnum))
        .attr("x", this.cellWidth / 2)
        .attr("y", this.cellHeight - this.padding.y)
        .attr("font-size", GLYCO.fontSize)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "baseline")
        .style("fill", "#888");

    // Draw border
    cell.append("rect")
        .attr("class", d => d.selected ? "button selected" : "button")
        .attr("width", this.cellWidth)
        .attr("height", this.cellHeight)
        .style("stroke", "#888")
        .style("fill", "#888")
        .style("fill-opacity", 0)
        .on("click", (e, d) => this.select(e, d, this));

    // Create monosaccaride object
    this.sacTable.selectAll(".sac")
        .data(this.data.reduce((acc, val) => acc.concat(val), []))
        .enter()
        .append((d, i, n) => {
            d.x += this.padding.x;
            d.y += this.padding.y;
            return d.render(d3.select(n[i])).node();
        })
        .attr("pointer-events", "none");

    return this;
}

/**
 * Get grid data
 * 
 * @returns {Array} Grid data 
 * */
GLYCO.toolbar.prototype.getGrid = function () {
    var toolbar = this;

    var data = new Array();
    var xpos = 0; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 0;

    // iterate for rows 
    for (var col = 0; col < toolbar.cols; col++) {
        data.push(new Array());

        // iterate for cells/columns inside rows
        for (var row = 0; row < toolbar.rows - 1; row++) {

            // Create monosaccharid an add to data array
            data[col].push(new GLYCO.sac((row) * 10 + col, null, xpos, ypos));

            // increment the x position. I.e. move it over by 50 (width variable)
            ypos += toolbar.cellHeight;
        }
        // reset the x position after a row is complete
        ypos = 0;
        // increment the y position for the next row. Move it down 50 (height variable)
        xpos += toolbar.cellWidth;
    }
    return data;
}

GLYCO.toolbar.prototype.select = function (e, d, toolbar) {
    var toolbar = toolbar;

    // Check if allready selected and revert
    if (d.selected) {
        d.selected = false;
        toolbar.selected = false;
        toolbar.sacTable.selectAll(".selected")
            .classed("selected", false)
            .style("fill-opacity", 0);
    } else {

        // Reset selected
        if (toolbar.selected) {
            toolbar.selected.selected = false;
            toolbar.selected = false;
            toolbar.sacTable.selectAll(".selected")
                .classed("selected", false)
                .style("fill-opacity", 0);
        }

        // Set selected monosaccharide
        d.selected = true;
        toolbar.selected = d;

        // Add class .selected
        d3.select(event.currentTarget)
            .classed("selected", true)
            .style("fill-opacity", 0.25);
    }

    return toolbar;
}