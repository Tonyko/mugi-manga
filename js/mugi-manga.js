var sizeBorder = 2;
var textBorderWidth = 20;
var textBorderHeight = 30;
var backgroundColor = 'orange';

var svg = d3.select('svg').style('border', '1px solid black');

var active;
var editing = false;

var menu = [
    {title: 'Edit text', action: function(elm) { editText(elm) }},
    {divider: true},
    {title: 'Set font WildWordsCE', action: function(elm) { setFont(elm, 'WildWordsCe', 16) }},
    {title: 'Set font MangaTempleCE', action: function(elm) { setFont(elm, 'MangaTempleCE', 16, true) }},
    {title: 'Set font Mistral', action: function(elm) { setFont(elm, 'Mistral', 16, true) }},
    {title: 'Set font BassoonCE', action: function(elm) { setFont(elm, 'BassoonCE', 16) }},
    {title: 'Set font BadaBoomCE', action: function(elm) { setFont(elm, 'BadaBoomCE', 16) }},
    {divider: true},
    {title: 'Font size up', action: function(elm) { sizeFont(elm, 1) }},
    {title: 'Font size down', action: function(elm) { sizeFont(elm, -1) }},
    {divider: true},
    {title: 'Delete', action: function() { deleteNode() }}
];

function getNodeOrParent(elm, tag) {
    if (elm.localName === tag) return d3.select(elm.parentNode.parentNode);
    else return d3.select(elm.parentNode);
}

function deleteNode() {
    d3.select('.active').remove();
}

function setEditing(state) {
    editing = state;
}

function setActive(node) {
    active = node;
}

function setFont(elm, font, size, fontWeight) {
    var g = getNodeOrParent(elm, 'body');
    var text = g.select('.text').node();
    var d3_text = d3.select(text).select('body').style('font', size + 'px ' + font);
    if (fontWeight === true) d3_text.style('font-weight', 'bold');
}

function sizeFont(elm, size) {
    var g = getNodeOrParent(elm, 'body');
    var text = g.select('.text').node();
    var d3_text = d3.select(text);
    var font_size = d3_text.select('body').style('font-size');
    d3_text.select('body')
        .style('font-size', (parseInt(font_size.substring(0, font_size.length - 2)) + size) + 'px');
}

function editText(elm) {
    var g = getNodeOrParent(elm, 'body');

    activeNode(g);
    setEditing(true);

    var text = g.select('.text').node();
    var d3_text = d3.select(text);
    var d3_node = d3.select(g.select('.node').node());
    var h = parseInt(d3_node.attr('height')) - textBorderHeight;
    var w = parseInt(d3_node.attr('width')) - textBorderWidth;

    var spn_text = '';
    if (g.select('.text').select('.edit').select('.spn-text').node()) {
        spn_text = g.select('.text').select('.edit').select('.spn-text').html().replaceAll('<br>', '\n');
    }

    d3_text.select('body')
        .attr('class', 'edit')
        .attr('x', d3_node.attr('x'))
        .attr('y', d3_node.attr('y'))
        .style('width', w + 'px')
        .style('height', h + 'px')
        .html('<textarea id=\"edit-text\" style=\"width:' + w + 'px; height:' + h + 'px;\">' + spn_text + '</textarea>')
        .moveToBack();
}

function activeNode(node) {
    if (active) {
        active.classed('active', false);
        active.select('.border').style('display', 'none');
    }

    setActive(node);
    node.raise().classed('active', true);
    active.select('.border').style('display', 'inline');
}

function dragstarted() {
    activeNode(d3.select(this.parentNode));
}

function draggedBodyStart() {
    activeNode(d3.select(this.parentNode.parentNode));
}

function draggedBody() {
    var node = d3.select(this.parentNode.parentNode).select('.node');
    node.attr('x', parseInt(node.attr('x')) + d3.event.dx)
        .attr('y', parseInt(node.attr('y')) + d3.event.dy);

    var border = d3.select(this.parentNode.parentNode).select('.border').nodes()[0];
    d3.select(border)
        .attr('x', parseInt(d3.select(border).attr('x')) + d3.event.dx)
        .attr('y', parseInt(d3.select(border).attr('y')) + d3.event.dy);

    var text = d3.select(this.parentNode.parentNode).select('.text').nodes()[0];
    d3.select(text)
        .attr('x', parseInt(node.attr('x')) + d3.event.dx + 5)
        .attr('y', parseInt(node.attr('y')) + d3.event.dy + 5);
}

function dragged() {
    var node = d3.select(this);
    node
        .attr('x', parseInt(node.attr('x')) + d3.event.dx)
        .attr('y', parseInt(node.attr('y')) + d3.event.dy);

    var border = d3.select(this.parentNode).select('.border').nodes()[0];
    d3.select(border)
        .attr('x', parseInt(d3.select(border).attr('x')) + d3.event.dx)
        .attr('y', parseInt(d3.select(border).attr('y')) + d3.event.dy);

    var text = d3.select(this.parentNode).select('.text').nodes()[0];
    d3.select(text)
        .attr('x', parseInt(node.attr('x')) + d3.event.dx + 5)
        .attr('y', parseInt(node.attr('y')) + d3.event.dy + 5);
}

function resized() {

    var border = d3.select(this);

    var node = d3.select(this.parentNode).select('.node').nodes()[0];
    var d3_text = d3.select(this.parentNode).select('.text').select('.edit').nodes()[0];
    var w = parseInt(d3.select(node).attr('width')) + d3.event.dx;
    var h = parseInt(d3.select(node).attr('height')) + d3.event.dy;

    if (w > 0 && h > 0) {
        d3.select(node)
            .attr('width', w)
            .attr('height', h);

        d3.select(d3_text)
            .style('width', (w - 30) + 'px')
            .style('height', (h - 20) + 'px');

        border
            .attr('x', parseInt(border.attr('x')) + d3.event.dx)
            .attr('y', parseInt(border.attr('y')) + d3.event.dy);
    }
}

svg.on('mousedown', function() {

    // left click
    if (d3.event.button === 0 && editing === false && d3.event.toElement.localName === 'image') {
        var coords1 = d3.mouse(this);

        var g = svg.append('g')
            .attr('class', 'group')
            .attr('changed', false);

        var border = g.append('rect')
            .attr('class', 'border')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', sizeBorder * 2)
            .attr('height', sizeBorder * 2)
            .style('display', 'inline')
            .attr('cursor', 'se-resize')
            .call(d3.drag()
                .on('drag', resized));

        var node = g.append('rect')
            .attr('class', 'node')
            .attr('x', coords1[0])
            .attr('y', coords1[1])
            .attr('rx', '10')
            .attr('ry', '10')
            .attr('width', 0)
            .attr('height', 0)
            .attr('fill', 'orange')
            .attr('cursor', 'move')
            .on('contextmenu', d3.contextMenu(menu))
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged));

        var text = g.append('foreignObject')
            .attr('class', 'text')
            .attr('x', coords1[0] + 5)
            .attr('y', coords1[1] + 5)
            .append('xhtml:body');

        activeNode(g, true);

        svg.on('mousemove', function() {
            var coords2 = d3.mouse(this);
            var width = coords2[0] - coords1[0];
            var height = coords2[1] - coords1[1];
            // todo: fix
            if (width > 10 && height > 10) {
                g.attr('changed', true);
                node.attr('width', width).attr('height', height);
                border.attr('x', coords1[0] + width - sizeBorder).attr('y', coords1[1] + height - sizeBorder);
            }
        });
    }

    if (editing === true && (d3.event.toElement.localName !== 'textarea')) {
        var text = document.getElementById("edit-text").value.replaceAll('\n', '<br />');
        d3.select('.active').select('.text').select('.edit')
            .style('cursor', 'move')
            .html('<p onselectstart=\"return false\" class=\"unselectable spn-text\" style=\"width: inherit; height: inherit;\">' + text + '</p>')
            .on('contextmenu', d3.contextMenu(menu))
            .call(d3.drag()
                .on('start', draggedBodyStart)
                .on('drag', draggedBody));
        editing = false;
    }

    // console.log(d3.event.toElement);
});

svg.on('mouseup', function() {
    svg.on('mousemove', null);
    d3.selectAll('g[changed = false]').remove();
});

d3.select('body').on('keydown', function() {
    // delete
    if (active && (d3.event.keyCode === 46) && editing === false) {
        deleteNode();
    }
});