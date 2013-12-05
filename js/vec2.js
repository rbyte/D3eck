
function Vec2(x_,y_) {
	this.x = x_
	this.y = y_
}

Vec2.prototype.clone = function() {
	return new Vec2(this.x, this.y)
}

Vec2.prototype.equals = function(v) {
	return v.x === this.x && v.y === this.y
}

Vec2.prototype.mulS = function (value) {
	return new Vec2(this.x*value, this.y*value)
}

Vec2.prototype.mul = function(value) {
	return new Vec2(this.x * value, this.y * value)
}

Vec2.prototype.mulV = function(vec_) {
	return new Vec2(this.x * vec_.x, this.y * vec_.y)
}

Vec2.prototype.divS = function(value) {
	return new Vec2(this.x/value,this.y/value)
}

Vec2.prototype.addS = function(value) {
	return new Vec2(this.x+value,this.y+value)
}

Vec2.prototype.add = function(vec_) {
	return new Vec2(this.x+vec_.x,this.y+vec_.y)
}

Vec2.prototype.subS = function(value) {
	return new Vec2(this.x-value, this.y-value)
}

Vec2.prototype.sub = function(vec_) {
	return new Vec2(this.x-vec_.x,this.y-vec_.y)
}

Vec2.prototype.abs = function() {
	return new Vec2(Math.abs(this.x),Math.abs(this.y))
}

Vec2.prototype.dot = function(vec_) {
	return (this.x*vec_.x+this.y*vec_.y)
}

Vec2.prototype.length = function() {
	return Math.sqrt(this.dot(this))
}

Vec2.prototype.lengthSqr = function() {
	return this.dot(this)
}

Vec2.prototype.linearInterpolation = function(vec_, value) {
	return new Vec2(
		this.x+(vec_.x-this.x)*value,
		this.y+(vec_.y-this.y)*value
	)
}

Vec2.prototype.normalize = function() {
	var vlen = this.length()
	return new Vec2(this.x / vlen, this.y / vlen)
}

Vec2.prototype.scaleToLength = function(newLength) {
	return this.normalize().mul(newLength)
}

Vec2.prototype.angleBetween = function(a) {
	return Math.abs(Math.atan2(a.y, a.x) - Math.atan2(this.y, this.x))
}

Vec2.prototype.smallAngleBetween = function(a) {
	var angle = this.angleBetween(a)
	return angle > Math.PI ? Math.PI*2 - angle : angle
}

// rotieren um 90°. bildet den dazu orthogonalen vector
Vec2.prototype.ort = function() {
	return this.rot(Math.PI/2)
}

// rotateCounterClockwise
Vec2.prototype.rot = function(angle) {
	var cs = Math.cos(-angle)
	var sn = Math.sin(-angle)
	var px = this.x * cs - this.y * sn 
	var py = this.x * sn + this.y * cs
	return new Vec2(px, py)
}

Vec2.prototype.centerVector = function(a) {
	var aN = a.normalize()
	var bN = this.normalize()
	var result = aN.add( bN.sub(aN).mul(0.5) )
	if (result.x == 0 && result.y == 0)
		return a.ort()
	return result
}

Vec2.prototype.distanceToLine = function(line) {
	return this.sub(line.cutPoint(new Line(this, line.dir.ort()))).length()
}

function Line(pos_, dir_) {
	// position = one point on the line
	this.pos = pos_
	// direction
	this.dir = dir_
}

Line.prototype.cutPoint = function(b) {
	// TODO if parallel
	var t2 = (
			b.pos.x		* this.dir.y
		-	this.pos.x	* this.dir.y
		-	b.pos.y		* this.dir.x
		+	this.pos.y	* this.dir.x)
		/ (	this.dir.x	* b.dir.y
		-	b.dir.x		* this.dir.y)
	
	var cx = b.pos.x + t2 * b.dir.x
	var cy = b.pos.y + t2 * b.dir.y
	return new Vec2(cx, cy)
}
