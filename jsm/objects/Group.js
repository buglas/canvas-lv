import { Object3D } from '../core/Object3D.js';
const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };


class Group extends Object3D {
	constructor() {
		super();
		this.isGroup = true;
		this.type = 'Group';
    this.children = []
	}
  add( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error( 'THREE.Object3D.add: object can\'t be added as a child of itself.', object );
			return this;

		}

		if ( object && object.isObject3D ) {

			if ( object.parent !== null ) {

				object.parent.remove( object );

			}

			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

		} else {

			console.error( 'THREE.Object3D.add: object not an instance of THREE.Object3D.', object );

		}

    // object.updateWorldMatrix(true,true)


		return this;

	}

	remove( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		const index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

		}

		return this;

	}

  clear() {
		for ( let i = 0; i < this.children.length; i ++ ) {

			const object = this.children[ i ];

			object.parent = null;

			object.dispatchEvent( _removedEvent );

		}

		this.children.length = 0;

		return this;
	}

  attach( object ) {

		// adds object as a child of this, while maintaining the object's world transform

		// Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

		this.updateWorldMatrix( true, false );

		_m1.copy( this.matrixWorld ).invert();

		if ( object.parent !== null ) {

			object.parent.updateWorldMatrix( true, false );

			_m1.multiply( object.parent.matrixWorld );

		}

		object.applyMatrix4( _m1 );

		this.add( object );

		object.updateWorldMatrix( false, true );

		return this;

	}

  


}

export { Group };