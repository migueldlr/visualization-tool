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

import AnimatedObject from './AnimatedObject';
import { UndoBlock } from './UndoFunctions';

export default class AnimatedCircle extends AnimatedObject {
	constructor(objectID, objectLabel) {
		super();
		this.objectID = objectID;
		this.label = objectLabel;
		this.radius = 20;
		this.thickness = 3;
		this.x = 0;
		this.y = 0;
		this.alpha = 1.0;
		this.addedToScene = true;
		this.highlightIndex = -1;
		/*	this.foregroundColor  = '#007700';
	this.backgroundColor  = '#EEFFEE';
 */
	}

	getTailPointerAttachPos(fromX, fromY) {
		return this.getHeadPointerAttachPos(fromX, fromY);
	}

	getWidth() {
		return this.radius * 2;
	}

	setWidth(newWidth) {
		this.radius = newWidth / 2;
	}

	getHeadPointerAttachPos(fromX, fromY) {
		const xVec = fromX - this.x;
		const yVec = fromY - this.y;
		const len = Math.sqrt(xVec * xVec + yVec * yVec);
		if (len === 0) {
			return [this.x, this.y];
		}
		return [this.x + (xVec / len) * this.radius, this.y + (yVec / len) * this.radius];
	}

	setHighlightIndex(hlIndex) {
		this.highlightIndex = hlIndex;
		this.highlightIndexDirty = true;
	}

	draw(ctx) {
		ctx.globalAlpha = this.alpha;

		if (this.highlighted) {
			ctx.fillStyle = this.highlightColor;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius + this.highlightDiff, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}

		ctx.fillStyle = this.backgroundColor;
		ctx.strokeStyle = this.foregroundColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.textAlign = 'center';
		ctx.font = '10px sans-serif';
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 1;
		ctx.fillStyle = this.foregroundColor;

		const strList = this.label.split('\n');
		if (strList.length === 1) {
			if (this.highlightIndexDirty && this.highlightIndex !== -1) {
				this.leftWidth = ctx.measureText(
					this.label.substring(0, this.highlightIndex)
				).width;
				this.centerWidth = ctx.measureText(
					this.label.substring(this.highlightIndex, this.highlightIndex + 1)
				).width;
				this.textWidth = ctx.measureText(this.label).width;
				this.highlightIndexDirty = false;
			}
			if (this.highlightIndex !== -1 && this.highlightIndex < this.label.length) {
				//this.highlghtIndex < this.label.length)
				const startingXForHighlight = this.x - this.textWidth / 2;
				ctx.textAlign = 'left';
				const leftStr = this.label.substring(0, this.highlightIndex);
				const highlightStr = this.label.substring(
					this.highlightIndex,
					this.highlightIndex + 1
				);
				const rightStr = this.label.substring(this.highlightIndex + 1);
				ctx.fillText(leftStr, startingXForHighlight, this.y);
				ctx.strokeStyle = '#FF0000';
				ctx.fillStyle = '#FF0000';
				ctx.fillText(highlightStr, startingXForHighlight + this.leftWidth, this.y);

				ctx.strokeStyle = this.labelColor;
				ctx.fillStyle = this.labelColor;
				ctx.fillText(
					rightStr,
					startingXForHighlight + this.leftWidth + this.centerWidth,
					this.y
				);
			} else {
				ctx.fillText(this.label, this.x, this.y);
			}
		} else if (strList.length % 2 === 0) {
			const mid = strList.length / 2;
			for (let i = 0; i < strList.length / 2; i++) {
				ctx.fillText(strList[mid - i - 1], this.x, this.y - (i + 0.5) * 12);
				ctx.fillText(strList[mid + i], this.x, this.y + (i + 0.5) * 12);
			}
		} else {
			const mid = (strList.length - 1) / 2;
			ctx.fillText(strList[mid], this.x, this.y);
			for (let i = 0; i < mid; i++) {
				ctx.fillText(strList[mid - (i + 1)], this.x, this.y - (i + 1) * 12);
				ctx.fillText(strList[mid + (i + 1)], this.x, this.y + (i + 1) * 12);
			}
		}
	}

	createUndoDelete() {
		return new UndoDeleteCircle(
			this.objectID,
			this.label,
			this.x,
			this.y,
			this.foregroundColor,
			this.backgroundColor,
			this.layer,
			this.radius
		);
	}
}

class UndoDeleteCircle extends UndoBlock {
	constructor(id, lab, x, y, foregroundColor, backgroundColor, l, radius) {
		super();
		this.objectID = id;
		this.posX = x;
		this.posY = y;
		this.nodeLabel = lab;
		this.fgColor = foregroundColor;
		this.bgColor = backgroundColor;
		this.layer = l;
		this.radius = radius;
	}

	undoInitialStep(world) {
		world.addCircleObject(this.objectID, this.nodeLabel);
		world.setWidth(this.objectID, this.radius * 2);
		world.setNodePosition(this.objectID, this.posX, this.posY);
		world.setForegroundColor(this.objectID, this.fgColor);
		world.setBackgroundColor(this.objectID, this.bgColor);
		world.setLayer(this.objectID, this.layer);
	}
}
