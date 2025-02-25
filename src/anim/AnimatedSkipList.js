// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import AnimatedObject from './AnimatedObject.js';
import { UndoBlock } from './UndoFunctions.js';

export default class AnimatedSkipList extends AnimatedObject {
	constructor(objectID, label, w, h, labelColor, fillColor, edgeColor) {
		super();

		this.w = w;
		this.h = h;
		this.fillColor = fillColor;
		this.edgeColor = edgeColor;

		this.label = label;
		this.labelPosX = 0;
		this.labelPosY = 0;
		this.labelColor = labelColor;

		this.highlighted = false;
		this.objectID = objectID;
	}

	left() {
		return this.x - this.w / 2;
	}

	right() {
		return this.x + this.w / 2;
	}

	top() {
		return this.y - this.h / 2;
	}

	bottom() {
		return this.y + this.h / 2;
	}

	resetTextPosition() {
		this.labelPosY = this.y;
		this.labelPosX = this.x;
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		switch (anchor) {
			case 0: // Top
				return [this.x, this.top()];
			case 1: // Bottom
				return [this.x, this.bottom()];
			case 2: // Left
				return [this.left(), this.y];
			case 3: // Right
				return [this.right(), this.y];
			default:
				return;
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY); // Normal anchor
	}

	setWidth(wdth) {
		this.w = wdth;
		this.resetTextPosition();
	}

	setHeight(hght) {
		this.h = hght;
		this.resetTextPosition();
	}

	getWidth() {
		return this.w;
	}

	getHeight() {
		return this.h;
	}

	draw(context) {
		const startX = this.left();
		const startY = this.top();

		if (this.highlighted) {
			context.strokeStyle = '#ff0000';
			context.fillStyle = '#ff0000';

			context.beginPath();
			context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(startX + this.w + this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(
				startX + this.w + this.highlightDiff,
				startY + this.h + this.highlightDiff
			);
			context.lineTo(startX - this.highlightDiff, startY + this.h + this.highlightDiff);
			context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.closePath();
			context.stroke();
			context.fill();
		}
		context.strokeStyle = this.edgeColor;
		context.fillStyle = this.fillColor;

		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(startX + this.w, startY);
		context.lineTo(startX + this.w, startY + this.h);
		context.lineTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		context.closePath();
		context.stroke();
		context.fill();

		context.textAlign = 'center';
		context.font = '10px sans-serif';
		context.textBaseline = 'middle';
		context.lineWidth = 1;

		this.resetTextPosition();
		context.fillStyle = this.labelColor;
		if (this.label === '\u2212\u221E' /* -inf */ || this.label === '\u221E' /* inf */) {
			context.font = '18px Arial';
		}
		context.fillText(this.label, this.labelPosX, this.labelPosY);
	}

	setTextColor(color) {
		this.labelColor = color;
	}

	getTextColor() {
		return this.labelColor;
	}

	getText() {
		return this.label;
	}

	setText(newText) {
		this.label = newText;
		this.resetTextPosition();
	}

	createUndoDelete() {
		return new UndoDeleteSkipList(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.x,
			this.y,
			this.labelColor,
			this.fillColor,
			this.edgeColor,
			this.layer
		);
	}

	setHighlight(value) {
		if (value !== this.highlighted) {
			this.highlighted = value;
		}
	}
}

class UndoDeleteSkipList extends UndoBlock {
	constructor(objectID, label, w, h, x, y, labelColor, fillColor, edgeColor, layer) {
		super();
		this.objectID = objectID;
		this.label = label;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.labelColor = labelColor;
		this.fillColor = fillColor;
		this.edgeColor = edgeColor;
		this.layer = layer;
	}

	undoInitialStep(world) {
		world.addSkipListObject(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.labelColor,
			this.fillColor,
			this.edgeColor
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		world.setLayer(this.objectID, this.layer);
	}
}
