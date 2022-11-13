import { Vector2 } from './Vector2.js'

const _vector = /*@__PURE__*/ new Vector2()
const _segCenter = /*@__PURE__*/ new Vector2()
const _segDir = /*@__PURE__*/ new Vector2()
const _diff = /*@__PURE__*/ new Vector2()

const _edge1 = /*@__PURE__*/ new Vector2()
const _edge2 = /*@__PURE__*/ new Vector2()
const _normal = /*@__PURE__*/ new Vector2()

class Ray2D {
	constructor(origin = new Vector2(), direction = new Vector2(0, 0, -1)) {
		this.origin = origin
		this.direction = direction
	}

	set(origin, direction) {
		this.origin.copy(origin)
		this.direction.copy(direction)

		return this
	}

	copy(ray) {
		this.origin.copy(ray.origin)
		this.direction.copy(ray.direction)

		return this
	}

	at(t, target) {
		return target.copy(this.direction).multiplyScalar(t).add(this.origin)
	}

	lookAt(v) {
		this.direction.copy(v).sub(this.origin).normalize()

		return this
	}

	// 相对插值值
	recast(t) {
		this.origin.copy(this.at(t, _vector))

		return this
	}

	// 任意点在射线上的正射影
	closestPointToPoint(point, target) {
		target.subVectors(point, this.origin)

		const directionDistance = target.dot(this.direction)

		if (directionDistance < 0) {
			return target.copy(this.origin)
		}

		return target
			.copy(this.direction)
			.multiplyScalar(directionDistance)
			.add(this.origin)
	}

	// 射线到点的距离
	distanceToPoint(point) {
		return Math.sqrt(this.distanceSqToPoint(point))
	}

	// 射线到点的开方距离
	distanceSqToPoint(point) {
		const directionDistance = _vector
			.subVectors(point, this.origin)
			.dot(this.direction)

		// point behind the ray

		if (directionDistance < 0) {
			return this.origin.distanceToSquared(point)
		}

		_vector
			.copy(this.direction)
			.multiplyScalar(directionDistance)
			.add(this.origin)

		return _vector.distanceToSquared(point)
	}

	// 射线到线段的开方距离？
	distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
		// It returns the min distance between the ray and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray
		// - The closest point on the segment

		// 线段的中心点
		_segCenter.copy(v0).add(v1).multiplyScalar(0.5)
		// 线段方向
		_segDir.copy(v1).sub(v0).normalize()
		// 源点到线段中心的方向
		_diff.copy(this.origin).sub(_segCenter)

		// 线段长度的一半
		const segExtent = v0.distanceTo(v1) * 0.5

		// 负的射线方向与线段方向的点积
		const a01 = -this.direction.dot(_segDir)

		const b0 = _diff.dot(this.direction)
		const b1 = -_diff.dot(_segDir)
		const c = _diff.lengthSq()
		const det = Math.abs(1 - a01 * a01)
		let s0, s1, sqrDist, extDet

		if (det > 0) {
			// The ray and segment are not parallel.

			s0 = a01 * b1 - b0
			s1 = a01 * b0 - b1
			extDet = segExtent * det

			if (s0 >= 0) {
				if (s1 >= -extDet) {
					if (s1 <= extDet) {
						// region 0
						// Minimum at interior points of ray and segment.

						const invDet = 1 / det
						s0 *= invDet
						s1 *= invDet
						sqrDist =
							s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c
					} else {
						// region 1

						s1 = segExtent
						s0 = Math.max(0, -(a01 * s1 + b0))
						sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
					}
				} else {
					// region 5

					s1 = -segExtent
					s0 = Math.max(0, -(a01 * s1 + b0))
					sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
				}
			} else {
				if (s1 <= -extDet) {
					// region 4

					s0 = Math.max(0, -(-a01 * segExtent + b0))
					s1 =
						s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)
					sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
				} else if (s1 <= extDet) {
					// region 3

					s0 = 0
					s1 = Math.min(Math.max(-segExtent, -b1), segExtent)
					sqrDist = s1 * (s1 + 2 * b1) + c
				} else {
					// region 2

					s0 = Math.max(0, -(a01 * segExtent + b0))
					s1 =
						s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)
					sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
				}
			}
		} else {
			// Ray and segment are parallel.

			s1 = a01 > 0 ? -segExtent : segExtent
			s0 = Math.max(0, -(a01 * s1 + b0))
			sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
		}

		if (optionalPointOnRay) {
			optionalPointOnRay
				.copy(this.direction)
				.multiplyScalar(s0)
				.add(this.origin)
		}

		if (optionalPointOnSegment) {
			optionalPointOnSegment.copy(_segDir).multiplyScalar(s1).add(_segCenter)
		}

		return sqrDist
	}

	// 射线在线段上的交点，Vector2|null
	intersectSegment(p1, p2) {
		const { origin, direction } = this
		// 射线与线段的一般式
		const l1 = this.getGeneralForm()
		const l2 = this.getGeneralFormBySeg(p1, p2)
		// 根据一般式求直线的交点
		const interPoint = this.getInterPointOfLines(...l1, ...l2)
		/* 没有交点 */
		if (!interPoint) {
			return null
		}
		/* 有交点 */
		// 判断交点是否与射线同向
		const inRay = interPoint.clone().sub(origin).dot(direction) > 0
		if (!inRay) {
			return null
		}
		// 判断交点是否在线段中
		// 线段长度
		const seglen = p1.distanceToSquared(p2)
		// 交点到p1的距离
		const d1 = interPoint.distanceToSquared(p1)
		if (d1 > seglen) {
			return null
		}
		// 交点到p2的距离
		const d2 = interPoint.distanceToSquared(p2)
		if (d2 > seglen) {
			return null
		}
		return interPoint
	}

	// 一般式求交点
	getInterPointOfLines(A1, B1, C1, A2, B2, C2) {
		const sub = A1 * B2 - A2 * B1
		if (sub) {
			// 直线相交
			return new Vector2((B1 * C2 - C1 * B2) / sub, (A2 * C1 - A1 * C2) / sub)
		} else {
			// 直线平行
			return null
		}
	}

	// 射线所在直线的一般式
	getGeneralForm() {
		const { origin, direction } = this
		return this.getGeneralFormBySeg(
			origin,
			_vector.addVectors(origin, direction)
		)
	}

	// 线段所在直线的一般式
	getGeneralFormBySeg(p1, p2) {
		const [dx, dy] = [p2.x - p1.x, p2.y - p1.y]
		const [A, B] = [dy, -dx]
		return [A, B, -(A * p1.x + B * p1.y)]
	}

	// 射线的反弹
	reflect(p, n) {
		const { origin, direction } = this
		origin.copy(p)
		this.direction.subVectors(
			direction,
			n.clone().multiplyScalar(2 * n.dot(direction))
		)
	}

	// 求等
	equals(ray) {
		return (
			ray.origin.equals(this.origin) && ray.direction.equals(this.direction)
		)
	}

	clone() {
		return new this.constructor().copy(this)
	}
}

export { Ray2D }
