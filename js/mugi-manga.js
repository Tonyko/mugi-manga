var sizeBorder = 2;
var textBorderWidth = 20;
var textBorderHeight = 30;
var backgroundColor = 'orange';

var svg = d3.select('svg').style('border', '1px solid black');

var active;
var editing = false;
var id = 0;
var data = [];

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
    var activeBubble = d3.select('.active');
    var id = activeBubble.attr('data-id');
    removeBubble(id);
    activeBubble.remove();
}

function incrementId() {
    id += 1;
}

function setEditing(state) {
    editing = state;
}

function setActive(node) {
    active = node;
}

function compareSelection(a, b) {
    return a.node() === b.node()
}

function appendBubble(newObj) {
    data.push(newObj)
}

function removeBubble(id) {
    var index = data.findIndex(function (d) { return d.id === id });
    data.splice(index, 1)
}

function existBubble(id) {
    return data.filter(function (d) { return d.id === id}).length !== 0
}

function getBubble(g) {
    var id = g.attr('data-id');
    return data.filter(function (d) { return d.id === id})[0];
}

function updateBubble(newObject) {
    var index = data.findIndex(function (d) { return d.id === newObject.id });
    if (index !== -1) data[index] = newObject;
}

function setFont(elm, font, size, fontWeight) {
    var g = getNodeOrParent(elm, 'body');
    var text = g.select('.text').node();
    var d3_text = d3.select(text).select('body').style('font', size + 'px ' + font);
    if (fontWeight === true) d3_text.style('font-weight', 'bold');

    var obj = getBubble(g);
    obj.font = font;
    obj.fontSize = size;
    obj.fontWeight = fontWeight;
    updateBubble(obj);
}

function sizeFont(elm, size) {
    var g = getNodeOrParent(elm, 'body');
    var text = g.select('.text').node();
    var d3_text = d3.select(text);
    var font_size = d3_text.select('body').style('font-size');
    var s = parseInt(font_size.substring(0, font_size.length - 2)) + size;
    d3_text.select('body')
        .style('font-size', s + 'px');

    var obj = getBubble(g);
    obj.fontSize = s;
    updateBubble(obj);
}

function editText(elm) {
    var g = getNodeOrParent(elm, 'body');

    if (!compareSelection(g, active)) {
        activeNode(g);
    }
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

function textAreaToText() {
    if (document.getElementById("edit-text") !== null) {
        var t = document.getElementById("edit-text").value.replaceAll('\n', '<br />');
        var activeBubble = d3.select('.active');
        activeBubble.select('.text').select('.edit')
            .style('cursor', 'move')
            .html('<p onselectstart=\"return false\" class=\"unselectable spn-text\" style=\"width: inherit; height: inherit;\">' + t + '</p>')
            .on('contextmenu', d3.contextMenu(menu))
            .call(d3.drag()
                .on('start', function(d) { dragStarted(d, activeBubble); })
                .on('drag', function(d) { dragged(d, activeBubble); }));

        var obj = getBubble(activeBubble);
        obj.text = t;
        updateBubble(obj);

        setEditing(false);
    }
}

function activeNode(node) {
    if (active) {
        textAreaToText();
        active.classed('active', false);
        active.select('.resizer').style('display', 'none');
    }

    setActive(node);
    node.raise().classed('active', true);
    active.select('.resizer').style('display', 'inline');
}

function dragStarted(event, g) {
    if (!compareSelection(g, active)) {
        activeNode(g);
    }
}

function dragged(event, g) {
    var node = g.select('.node');
    var x = parseInt(node.attr('x')) + d3.event.dx;
    var y = parseInt(node.attr('y')) + d3.event.dy;

    node
        .attr('x', x)
        .attr('y', y);

    var resizer = g.select('.resizer');
    resizer
        .attr('x', parseInt(resizer.attr('x')) + d3.event.dx)
        .attr('y', parseInt(resizer.attr('y')) + d3.event.dy);

    var text = g.select('.text');
    text
        .attr('x', x + 5)
        .attr('y', y + 5);

    var obj = getBubble(g);
    obj.x = x;
    obj.y = y;
    updateBubble(obj);
}

function resized(event, g) {
    var resizer = g.select('.resizer');
    var node = g.select('.node');
    var d3_text = g.select('.text').select('.edit');

    var w = parseInt(node.attr('width')) + d3.event.dx;
    var h = parseInt(node.attr('height')) + d3.event.dy;

    if (w > 0 && h > 0) {
        node
            .attr('width', w)
            .attr('height', h);

        d3_text
            .style('width', (w - textBorderWidth) + 'px')
            .style('height', (h - textBorderHeight) + 'px');

        resizer
            .attr('x', parseInt(resizer.attr('x')) + d3.event.dx)
            .attr('y', parseInt(resizer.attr('y')) + d3.event.dy);

        var obj = getBubble(g);
        obj.width = w;
        obj.height = h;
        updateBubble(obj);
    }
}

svg.on('mousedown', function() {
    // left click
    if (d3.event.button === 0 && editing === false && d3.event.toElement.localName === 'image') {
        var coords1 = d3.mouse(this);

        var g = svg.append('g')
            .attr('class', 'group')
            .attr('data-id', id)
            .attr('changed', false);

        incrementId();

        var node = g.append('rect')
            .attr('class', 'node')
            .attr('x', coords1[0])
            .attr('y', coords1[1])
            .attr('rx', '10')
            .attr('ry', '10')
            .attr('width', 0)
            .attr('height', 0)
            .attr('fill', backgroundColor)
            .attr('cursor', 'move')
            .on('contextmenu', d3.contextMenu(menu))
            .call(d3.drag()
                .on('start', function(d) {dragStarted(d, g); })
                .on('drag', function(d) {dragged(d, g); }));

        var text = g.append('foreignObject')
            .attr('class', 'text')
            .attr('x', coords1[0] + 5)
            .attr('y', coords1[1] + 5)
            .append('xhtml:body');

        var resizer = g.append('rect')
            .attr('class', 'resizer')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', sizeBorder * 2)
            .attr('height', sizeBorder * 2)
            .style('display', 'inline')
            .attr('cursor', 'se-resize')
            .call(d3.drag()
                .on('drag', function(d) { return resized(d, g); }));

        activeNode(g);

        svg.on('mousemove', function() {
            // create bubble
            var coords2 = d3.mouse(this);
            var width = coords2[0] - coords1[0];
            var height = coords2[1] - coords1[1];
            // todo: fix
            if (width > 10 && height > 10) {
                g.attr('changed', true);
                node.attr('width', width).attr('height', height);
                resizer.attr('x', coords1[0] + width - sizeBorder).attr('y', coords1[1] + height - sizeBorder);
            }
        });
    }

    if (editing === true && (d3.event.toElement.localName !== 'textarea')) {
        textAreaToText();
    }
});

svg.on('mouseup', function() {
    svg.on('mousemove', null);
    d3.selectAll('g[changed = false]').remove();

    var activeBubble = d3.select('.active');
    if (!activeBubble.empty() && !existBubble(activeBubble.attr('data-id'))) {
        appendBubble({
            id: activeBubble.attr('data-id'),
            height: activeBubble.select('.node').attr('height'),
            width: activeBubble.select('.node').attr('width')
        });
    }
});

d3.select('body').on('keydown', function() {
    // delete
    if (active && (d3.event.keyCode === 46) && editing === false) {
        deleteNode();
    }
});