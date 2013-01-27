
"use strict";
/** A framework for parent/child objects 
	@constructor
*/
function ParentingObject() {
	
	/** create array for storage of objects */ 	
	var _children = [];

	/** return array of Objects
	@returns {Array} Array of objects
	*/ 	
	this.children = function () {
		return _children;
	}

	/** add child to array of Objects 
	@param {Object} child A ViewState or ViewObj object
	*/ 	
	this.addChild = function (child) {
		_children.push(child);
	}

	/** remove child from array of Objects
	@param {Object} child A ViewState or ViewObj object
	*/ 	
	this.removeChild = function (child) {
		_children.splice(_children.indexOf(child),1);
	}

}