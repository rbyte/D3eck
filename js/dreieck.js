function interfaceInit() {
	d3eck()
}

function d3eck() {
	var srcT, umdreieck, indreieck
	var delta = Math.PI/2
	var lastMousePosition = new Vec2(0, 0)
	var mouseDragDeltaEntryPoint = 0
	var clickRadius = 20
	var srcTcornerDefaultColor = "rgb(150,150,150)"
	var isDragged = false
	
	var width = document.getElementById("viz").offsetWidth
	var height = document.getElementById("viz").offsetHeight
	if (width == 0)
		width = window.innerWidth-4
	if (height == 0)
		height = width*0.7
	if (width <= 50)
		width = 50
	if (height <= 50)
		height = 50
	console.log([width, height])
	
	srcT = new Triangle(
		new Vec2(width*0.42, height*0.4),
		new Vec2(width*0.58, height*0.5),
		new Vec2(width*0.47, height*0.6)
	)
	
	function updateUmAndIn() {
		umdreieck = srcT.umdreieck(-delta)
		indreieck = srcT.indreieck(delta, umdreieck)
		d3.select("#umdreieck").attr("d", umdreieck.toPathString())
		d3.select("#indreieck").attr("d", indreieck.toPathString())
	}
	
	function getDelta(v) {
		var z = srcT.center().sub(v)
		// this is always between 0 and 180°
		var angle = new Vec2(1,0).angleBetween(z)
		return z.y > 0 ? angle : 2*Math.PI-angle
	}
	
	var onSVGDrag = d3.behavior.drag()
		.on("drag", function() {
			var mpc = d3.mouse(this)
			var mousePos = new Vec2(mpc[0], mpc[1])
			if (!(mousePos.equals(lastMousePosition))) {
				lastMousePosition = mousePos
				delta = getDelta(mousePos) + mouseDragDeltaEntryPoint	
				updateUmAndIn()
			}
		})
		.on("dragstart", function() {
			isDragged = true
			var mpc = d3.mouse(this)
			var mousePos = new Vec2(mpc[0], mpc[1])
			mouseDragDeltaEntryPoint = delta - getDelta(mousePos)

			d3.select("#srcTcenter")
				.transition()
				.duration(200)
				.attr("fill-opacity", 0.3)
			d3.selectAll(".srcTcorner")
				.transition()
				.duration(200)
				.attr("fill-opacity", 0)
		})
		.on("dragend", function() {
			isDragged = false
			d3.select("#srcTcenter")
				.transition()
				.duration(200)
				.attr("fill-opacity", 0)
		})
	
	function cornerMouseOver(elem) {
		d3.select(elem)
			.attr("fill", "rgb(255,200,0)")
	}
	
	function cornerMouseOut(elem) {
		d3.select(elem).attr("fill", srcTcornerDefaultColor)
	}
	
	var onCornerDrag = d3.behavior.drag()
		.on("drag", function() {
			var mpc = d3.mouse(this)
			var mousePos = new Vec2(mpc[0], mpc[1])
//			var mousePos = new Vec2(d3.event.x, d3.event.y)
			srcT.set(d3.select(this).attr("abc"), mousePos)
			d3.select(this).attr("cx", mousePos.x).attr("cy", mousePos.y)
			d3.select("#srcTcenter").attr("cx", srcT.center().x).attr("cy", srcT.center().y)
			d3.select("#srcT").attr("d", srcT.toPathString())
			updateUmAndIn()
		})
		.on("dragstart", function() {
			this.isDragged = true
			cornerMouseOver(this)
		})
		.on("dragend", function() {
			this.isDragged = false
			cornerMouseOut(this)
		})
	
	var svg = d3.select("#viz")
		.append("svg")
		.attr("id", "d3svg")
		.attr("width", width)
		.attr("height", height)
		.on("mousemove", function() {
			if (!isDragged)
				d3.selectAll(".srcTcorner")
					.transition()
					.duration(100)
					.attr("fill-opacity", 0.2)
					.transition()
					.delay(1000)
					.duration(500)
					.attr("fill-opacity", 0)
		})
	
	svg
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("fill-opacity", "0")
		.call(onSVGDrag)
	
	svg
		.append("path")
		.attr("id", "umdreieck")
		.attr("fill", "rgb(240,240,240)")
	
	svg
		.append("path")
		.attr("id", "srcT")
		.attr("d", srcT.toPathString())
		.attr("fill", "rgb(255,255,255)")
	
	svg
		.append("path")
		.attr("id", "indreieck")
		.attr("fill", "rgb(220,220,220)")
	
	svg
		.selectAll("path")
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.call(onSVGDrag)
	
	updateUmAndIn()
	
	svg
		.selectAll("circle")
		.data(srcT.getEdgeCoordsArray())
		.enter()
		.append("circle")
		.attr("fill", srcTcornerDefaultColor)
		.attr("fill-opacity", 0)
		.attr("r", clickRadius)
		.attr("class", "srcTcorner" )
		.attr("abc", function(d, i) { return d.name })
		.attr("id", function(d, i) { return "srcTcorner_"+d.name })
		.attr("cx", function(d, i) { return d.val.x })
		.attr("cy", function(d, i) { return d.val.y })
		.on("mouseover", function() {
			if (!this.isDragged)
				cornerMouseOver(this)
		})
		.on("mouseout", function() {
			if (!this.isDragged)
				cornerMouseOut(this)
		})
		.call(onCornerDrag)
		
	svg
		.append("circle")
		.attr("fill", "rgb(0,0,0)")
		.attr("fill-opacity", 0)
		.attr("r", 2)
		.attr("id", "srcTcenter")
		.attr("cx", srcT.center().x)
		.attr("cy", srcT.center().y)
}


function Triangle(a_,b_,c_) {
	var self = this
	var a, b, c, alpha, beta, gamma, umkreis
	
	self.construct = function(a_, b_, c_) {
		a = a_
		b = b_
		c = c_
		alpha	= c.sub(a).smallAngleBetween(b.sub(a))
		beta	= c.sub(b).smallAngleBetween(a.sub(b))
		gamma	= b.sub(c).smallAngleBetween(a.sub(c))
		umkreis = self.umkreis()
		return self
	}
	
	self.a = function() { return a }
	self.b = function() { return b }
	self.c = function() { return c }
	
	self.get = function(x) {
		switch (x) {
		case "a": return a
		case "b": return b
		case "c": return c
		default: console.assert(false)
		}
	}
	
	self.seta = function(a_) { return self.construct(a_,b,c) }
	self.setb = function(b_) { return self.construct(a,b_,c) }
	self.setc = function(c_) { return self.construct(a,b,c_) }
	
	self.set = function(what, x) {
		switch (what) {
		case "a": return self.seta(x)
		case "b": return self.setb(x)
		case "c": return self.setc(x)
		default: // nothing
		}
	}
	
	self.smallestAngle	= function() { return Math.min(alpha, beta, gamma)}
	self.biggestAngle	= function() { return Math.max(alpha, beta, gamma) }
	
	self.lengthAB = function() { return a.sub(b).length() }
	self.lengthBC = function() { return b.sub(c).length() }
	self.lengthCA = function() { return c.sub(a).length() }
	
	self.getEdgeCoordsArray = function() {
		return [
			{"name": "a", "val": a},
			{"name": "b", "val": b},
			{"name": "c", "val": c}]
	}
	
	self.toPathString = function() {
		return "M"+a.x+","+a.y
			+" L"+b.x+","+b.y
			+" L"+c.x+","+c.y+" Z"
	}
	
	self.center = function() {
		return	new Line(a, a.sub(c).centerVector(a.sub(b))).cutPoint(
				new Line(b, b.sub(c).centerVector(b.sub(a)))
		)
	}
	
//	Der Mittelpunkt des Umkreises ist der Schnittpunkt der drei Mittelsenkrechten
	self.umkreisMittelpunkt = function() {
		return	new Line(a.add(c.sub(a).mul(0.5)), a.sub(c).ort()).cutPoint(
				new Line(b.add(c.sub(b).mul(0.5)), b.sub(c).ort())
			)
	}
	
	self.umkreis = function() {
		var umkreisMittelpunkt = self.umkreisMittelpunkt()
		
		var radius = Math.max(
			umkreisMittelpunkt.sub(a).length(),
			umkreisMittelpunkt.sub(b).length(),
			umkreisMittelpunkt.sub(c).length())
		
		return { "x":umkreisMittelpunkt.x, "y":umkreisMittelpunkt.y, "r":radius}
	}
	
	self.getTouchingCornerFor = function(x, y, delta) {
		var newAB = x.sub(y).rot(delta)
		// can have 2 directions. turns tangent AWAY from original XY side
		var pAufUmkreis = new Vec2(umkreis.x, umkreis.y).add(
			newAB.ort().normalize().mul(umkreis.r)
		)
		
		var da = a.distanceToLine(new Line(pAufUmkreis, newAB))
		var db = b.distanceToLine(new Line(pAufUmkreis, newAB))
		var dc = c.distanceToLine(new Line(pAufUmkreis, newAB))
		if (da < 0) da = 0
		if (db < 0) db = 0
		if (dc < 0) dc = 0
		
		// return corner farthest away
		if (da < db)
			if (db < dc)		return c;
			else if (da < dc)	return b;
				else			return b;
		else
			if (db < dc)
				 if (da < dc)	return c;
				 else			return a;
			else				return a;
	}
	
	self.umdreieck = function(delta) {
		var eckAB = self.getTouchingCornerFor(a,b,delta)
		var eckBC = self.getTouchingCornerFor(b,c,delta)
		var eckCA = self.getTouchingCornerFor(c,a,delta)
		
		return new Triangle(
			new Line(eckAB, a.sub(b).rot(delta)).cutPoint(new Line(eckCA, c.sub(a).rot(delta) )),
			new Line(eckAB, a.sub(b).rot(delta)).cutPoint(new Line(eckBC, b.sub(c).rot(delta) )),
			new Line(eckBC, b.sub(c).rot(delta)).cutPoint(new Line(eckCA, c.sub(a).rot(delta) )))
	}
	
	self.getIndreieckCornerForEdgeXY = function(x, y, umDx, umDy, delta, result) {
		// this is well thought through!
		var eckXY = self.getTouchingCornerFor(x,y,delta)
		var dist = eckXY.sub(umDx).length() / umDy.sub(umDx).length() * y.sub(x).length()
		var corner = x.add(y.sub(x).scaleToLength(dist))
		
		if (eckXY === a) result.a = corner
		if (eckXY === b) result.b = corner
		if (eckXY === c) result.c = corner
	}
	
	self.indreieck = function(delta, umdreieckMinusD) {
		var umD = self.umdreieck(delta)
		
		var r = {}
		self.getIndreieckCornerForEdgeXY(a, b, umD.a(), umD.b(), delta, r)
		self.getIndreieckCornerForEdgeXY(b, c, umD.b(), umD.c(), delta, r)
		self.getIndreieckCornerForEdgeXY(c, a, umD.c(), umD.a(), delta, r)
		// one of r.a, r.b or r.c will be null, if it is not on an edge - "dangling"
		
		// Länge der Seiten im inneren Dreieck
		var bcIl = b.sub(c).length() / umD.b().sub(umD.c()).length() * b.sub(c).length()
		var caIl = c.sub(a).length() / umD.c().sub(umD.a()).length() * c.sub(a).length()
		
		// handle dangling corners: calculate based on position of the other 2
		// rotation needs to be done to the right side
		// I just try and pick the one closer to the corresponding corner of the umdreieck
		// yes, it is UGLY...
		if (r.a == null) {
			r.a		= r.c.add(r.b.sub(r.c).rot( gamma).scaleToLength(caIl))
			var raN = r.c.add(r.b.sub(r.c).rot(-gamma).scaleToLength(caIl))
			if (umdreieckMinusD.a().sub(r.a).length() >
				umdreieckMinusD.a().sub(raN).length())
				r.a = raN
		}
		if (r.b == null) {
			r.b		= r.c.add(r.a.sub(r.c).rot( gamma).scaleToLength(bcIl))
			var rbN = r.c.add(r.a.sub(r.c).rot(-gamma).scaleToLength(bcIl))
			if (umdreieckMinusD.b().sub(r.b).length() >
				umdreieckMinusD.b().sub(rbN).length())
				r.b = rbN
		}
		if (r.c == null) {
			r.c		= r.b.add(r.a.sub(r.b).rot( beta).scaleToLength(bcIl))
			var rcN = r.b.add(r.a.sub(r.b).rot(-beta).scaleToLength(bcIl))
			if (umdreieckMinusD.c().sub(r.c).length() >
				umdreieckMinusD.c().sub(rcN).length())
				r.c = rcN
		}
		
		return new Triangle(r.a, r.b, r.c)
	}
	
	self.construct(a_,b_,c_)
}



