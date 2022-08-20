import {Camera} from "./Camera.js";

class PerspectiveCamera extends Camera{
  constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {
    super()

		this.isPerspectiveCamera = true;

		this.type = 'PerspectiveCamera';

		this.fov = fov;
		this.zoom = 1;

		this.near = near;
		this.far = far;
		this.focus = 10;

		this.aspect = aspect;

    
		this.updateProjectionMatrix();

	}
  updateProjectionMatrix() {

		const near = this.near;
		let top = near * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
		let height = 2 * top;
		let width = this.aspect * height;
		let left = - 0.5 * width;
		const view = this.view;

		if ( this.view !== null && this.view.enabled ) {

			const fullWidth = view.fullWidth,
				fullHeight = view.fullHeight;

			left += view.offsetX * width / fullWidth;
			top -= view.offsetY * height / fullHeight;
			width *= view.width / fullWidth;
			height *= view.height / fullHeight;

		}

		this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far );


	}
}

export {PerspectiveCamera} 