import {Quaternion} from "../math/Quaternion.js"
import {Vector3} from "../math/Vector3.js"
import {Matrix4} from "../math/Matrix4.js"
import { EventDispatcher } from './EventDispatcher.js';
import {Euler} from "../math/Euler.js"
import * as MathUtils from '../math/MathUtils.js';
let _object3DId = 0;

const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1 = /*@__PURE__*/ new Matrix4();
const _target=new Vector3()

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3( 1, 0, 0 );
const _yAxis = /*@__PURE__*/ new Vector3( 0, 1, 0 );
const _zAxis = /*@__PURE__*/ new Vector3( 0, 0, 1 );




class Object3D extends EventDispatcher {
  constructor(){
    super();
    this.isObject3D = true;
    Object.defineProperty( this, 'id', { value: _object3DId ++ } );
    this.uuid = MathUtils.generateUUID();

    this.name = '';
    this.type = 'Object3D';

    this.parent=null

    this.position=new Vector3()
    this.rotation = new Euler()
    this.quaternion=new Quaternion()
    this.scale=new Vector3( 1, 1, 1)

    this.rotation._onChange( ()=>{this.onRotationChange()} )
		this.quaternion._onChange( ()=>{this.onQuaternionChange()} )

    // modelViewMatrix
    // normalMatrix

    this.up =new Vector3(0,1,0)
    this.matrix=new Matrix4()
    this.matrixAutoUpdate = true
    this.matrixWorld = new Matrix4()

    this.visible = true
    this.renderOrder = 0
    
    // userData 

    // 透明度
    this.alpha=1
	  this.globalAlpha=1
    
  }
  lookAt(x, y, z){
		if ( x.isVector3 ) {
			_target.copy( x );
		} else {
			_target.set( x, y, z );
		}
    const parent = this.parent;
		this.updateWorldMatrix( true, false );
    _position.setFromMatrixPosition( this.matrixWorld );
    _m1.lookAt( _position, _target, this.up );
    this.quaternion.setFromRotationMatrix( _m1 );
    
    if ( parent ) {
      // 父对象的世界矩阵里的旋转矩阵
			_m1.extractRotation( parent.matrixWorld );
      // 根据旋转矩阵设置四元数
			_q1.setFromRotationMatrix( _m1 );
      // 将当前对象的四元数基于其父对象的世界矩阵里的旋转矩阵反向旋转
			this.quaternion.premultiply( _q1.invert() );
		}
    // 更新世界坐标系
    this.updateWorldMatrix()
  }

  updateWorldMatrix( updateParents=true, updateChildren=false ) {
		const parent = this.parent;
		if ( updateParents === true && parent !== null ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ){
      this.updateMatrix()
    }

		if ( this.parent === null ) {

      this.matrixWorld.copy( this.matrix );

		} else {
			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		if ( updateChildren === true ) {

			const children = this.children;
      if(!children){return}
			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateWorldMatrix( false, true );

			}

		}

	}

  updateMatrix() {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	}

  onRotationChange() {

    this.quaternion.setFromEuler( this.rotation, false );

  }

  onQuaternionChange() {
    this.rotation.setFromQuaternion( this.quaternion, undefined, false );
  }
  onBeforeRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	onAfterRender( /* renderer, scene, camera, geometry, material, group */ ) {}

  applyMatrix4( matrix ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	}

	applyQuaternion( q ) {

		this.quaternion.premultiply( q );

		return this;

	}

	setRotationFromAxisAngle( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	}

	setRotationFromEuler( euler ) {

		this.quaternion.setFromEuler( euler, true );

	}

	setRotationFromMatrix( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	}

	setRotationFromQuaternion( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	}

	rotateOnAxis( axis, angle ) {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.multiply( _q1 );

		return this;

	}

	rotateOnWorldAxis( axis, angle ) {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.premultiply( _q1 );

		return this;

	}

	rotateX( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	}

	rotateY( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	}

	rotateZ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	}

	translateOnAxis( axis, distance ) {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		_v1.copy( axis ).applyQuaternion( this.quaternion );

		this.position.add( _v1.multiplyScalar( distance ) );

		return this;

	}

	translateX( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	}

	translateY( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	}

	translateZ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	}

	localToWorld( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	}

	worldToLocal( vector ) {

		return vector.applyMatrix4( _m1.copy( this.matrixWorld ).invert() );

	}


  removeFromParent() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent.remove( this );

		}

		return this;

	}

  getObjectById( id ) {

		return this.getObjectByProperty( 'id', id );

	}

	getObjectByName( name ) {

		return this.getObjectByProperty( 'name', name );

	}

	getObjectByProperty( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	getWorldPosition( target ) {

		this.updateWorldMatrix( true, false );

		return target.setFromMatrixPosition( this.matrixWorld );

	}

	getWorldQuaternion( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, target, _scale );

		return target;

	}

	getWorldScale( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, _quaternion, target );

		return target;

	}

	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	raycast( /* raycaster, intersects */ ) {}

  traverse( callback ) {

		callback( this );

		const children = this.children;

    if(!children){return}

		for ( let i = 0, l = children.length; i < l; i ++ ) {
      const child=children[ i ]
			child.traverse( callback );
		}

	}

  traverseVisible( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		const children = this.children;

    if(!children){return}

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

  traverseAncestors( callback ) {

		const parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

  


  updateMatrixWorld( force ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( force );

		}

	}

  /* 获取Scene */
  getScene(){
    if(this.isScene){
      return this
    }else if(this.parent){
      return this.parent.getScene()
    }else{
      return null
    }

  }

  toJSON( meta ) {
    // 待完善
  }



  /* 更新透明度 */
  updateGlobalAlpha(){
    const {parent,alpha}=this
    if(parent){
      parent.updateGlobalAlpha()
      this.globalAlpha=alpha*parent.globalAlpha
    }else{
      this.globalAlpha=alpha
    }
  }

  
}

export {Object3D}