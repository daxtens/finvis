
"use strict";
/** A framework for parent/child objects 
 *	@constructor
 */
function ParentingObject() {
	
	/** create array for storage of objects
            @private */ 	
	var _children = [];

	/** return my children: array of ParentingObjects
	 * @returns {Array.<ParentingObject>} my children
	 */ 	
	this.children = function () {
		return _children;
	}

	/** add child
	 * @param {ParentingObject} child A ParentingObject (ViewState or ViewObj)
	 */ 	
	this.addChild = function (child) {
		_children.push(child);
	}

	/** remove child
	 * @param {ParentingObject} child A ParentingObject (ViewState or ViewObj)
	 */ 	
	this.removeChild = function (child) {
		_children.splice(_children.indexOf(child),1);
	}

}