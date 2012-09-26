"use strict";
/* A framework for parent/child objects */
function ParentingObject() {
	
	this.parent = null;

	this.children=[];

	this.addChild = function (child) {
		this.children.push(child);
	}

}