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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';

const ARRAY_START_X = 120;
const ARRAY_START_Y = 50;
const ARRAY_LINE_SPACING = 80;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

// const ARRRAY_ELEMS_PER_LINE = 15;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const PUSH_LABEL_X = 50;
// const PUSH_LABEL_Y = 30;
// const PUSH_ELEMENT_X = 120;
// const PUSH_ELEMENT_Y = 30;

// const SIZE = 10;

const LARGE_OFFSET = 15;
const SMALL_OFFSET = 7;

export default class MergeSort extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		// TODO:  Add any code necessary to set up your own algorithm.  Initialize data
		// structures, etc.
		this.setup();
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar('Comma separated list (e.g. "3,1,2", max 12 elements)');

		// List text field
		this.listField = addControlToAlgorithmBar('Text', '');
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false
		);
		this.controls.push(this.listField);

		// Sort button
		this.findButton = addControlToAlgorithmBar('Button', 'Sort');
		this.findButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.findButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.arrayData = [];
		this.arrayID = [];
		this.iPointerID = 0;
		this.jPointerID = 0;
		this.kPointerID = 0;
	}

	reset() {
		// Reset all of your data structures to *exactly* the state they have immediately after the init
		// function is called.  This method is called whenever an "undo" is performed.  Your data
		// structures are completely cleaned, and then all of the actions *up to but not including* the
		// last action are then redone.  If you implement all of your actions through the "implementAction"
		// method below, then all of this work is done for you in the Animation "superexport default class"

		// Reset the (very simple) memory manager
		this.nextIndex = 0;
	}

	sortCallback() {
		if (this.listField.value !== '') {
			this.implementAction(this.clear.bind(this), '');
			const list = this.listField.value;
			this.listField.value = '';
			this.implementAction(this.sort.bind(this), list);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), '');
	}

	clear() {
		this.commands = [];
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd('Delete', this.arrayID[i]);
		}
		this.arrayData = [];
		this.displayData = [];
		this.arrayID = [];
		return this.commands;
	}

	sort(params) {
		this.commands = [];

		this.arrayID = [];
		this.arrayData = params
			.split(',')
			.map(Number)
			.filter(x => x)
			.slice(0, 12);
		this.displayData = new Array(this.arrayData.length);

		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < this.arrayData.length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'A');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < this.arrayData.length; i++) {
			this.arrayData[i] = parseInt(this.arrayData[i]);
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yPos = ARRAY_START_Y;
			this.arrayID.push(this.nextIndex);

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.displayData[i] = displayData;
			this.cmd(
				'CreateRectangle',
				this.nextIndex++,
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos
			);
		}
		this.cmd('Step');

		if (this.arrayData.length !== 1) {
			const mid = Math.ceil((this.arrayData.length - 1) / 2);
			this.leftHelper(0, mid - 1, -LARGE_OFFSET, 0, 1);
			this.rightHelper(mid, this.arrayData.length - 1, LARGE_OFFSET, 0, 1);
			this.merge(
				0,
				this.arrayData.length - 1,
				mid,
				0,
				0,
				-LARGE_OFFSET,
				LARGE_OFFSET,
				this.arrayID
			);
		} else {
			this.cmd('SetBackgroundColor', this.arrayID[0], '#2ECC71');
			this.cmd('Step');
		}

		return this.commands;
	}

	leftHelper(left, right, offset, prevOffset, row) {
		if (left > right) return;

		const tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);

		if (left !== right) {
			const mid = Math.ceil((left + right) / 2);
			const extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
			this.leftHelper(left, mid - 1, offset - extraOffset, offset, row + 1);
			this.leftHelper(mid, right, offset, offset, row + 1);
			this.merge(left, right, mid, row, offset, offset - extraOffset, offset, tempArrayID);
		} else {
			this.cmd('SetBackgroundColor', tempArrayID[left], '#2ECC71');
			this.cmd('Step');
		}
	}

	rightHelper(left, right, offset, prevOffset, row) {
		if (left > right) return;

		const tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);

		if (left !== right) {
			const mid = Math.ceil((left + right) / 2);
			const extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
			this.rightHelper(left, mid - 1, offset, offset, row + 1);
			this.rightHelper(mid, right, offset + extraOffset, offset, row + 1);
			this.merge(left, right, mid, row, offset, offset, offset + extraOffset, tempArrayID);
		} else {
			this.cmd('SetBackgroundColor', tempArrayID[left], '#2ECC71');
			this.cmd('Step');
		}
	}

	drawArrayAndCopy(left, right, offset, prevOffset, row) {
		const tempArrayID = [];

		// Display subarray
		for (let i = left; i <= right; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
			const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
			tempArrayID[i] = this.nextIndex;
			this.arrayID.push(this.nextIndex);
			this.cmd(
				'CreateRectangle',
				this.nextIndex++,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos
			);
		}
		this.cmd('Step');

		// Copy elements from big array to current subarray
		for (let i = left; i <= right; i++) {
			this.copyData(
				i,
				i,
				prevOffset,
				offset,
				row - 1,
				row,
				this.displayData[i],
				tempArrayID[i],
				-1
			);
		}

		return tempArrayID;
	}

	merge(left, right, mid, row, currOffset, leftOffset, rightOffset, currArrayID) {
		const tempArray = new Array(this.arrayData.length); // Temporary array to store data for sorting
		const tempDisplay = new Array(this.arrayData.length);

		// Copy data to temporary array
		for (let i = left; i <= right; i++) {
			tempArray[i] = this.arrayData[i];
			tempDisplay[i] = this.displayData[i];
		}

		// Create pointers
		const bottomYPos = ARRAY_START_Y + (row + 1) * ARRAY_LINE_SPACING;
		const iPointerID = this.nextIndex++;
		const iXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + leftOffset;
		this.cmd('CreateHighlightCircle', iPointerID, '#0000FF', iXPos, bottomYPos);
		const jPointerID = this.nextIndex++;
		const jXPos = mid * ARRAY_ELEM_WIDTH + ARRAY_START_X + rightOffset;
		this.cmd('CreateHighlightCircle', jPointerID, '#0000FF', jXPos, bottomYPos);
		const kPointerID = this.nextIndex++;
		const kXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + currOffset;
		const topYPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
		this.cmd('CreateHighlightCircle', kPointerID, '#0000FF', kXPos, topYPos);
		this.cmd('Step');

		// Merge data and animate
		let i = left;
		let j = mid;
		let k = left;
		while (i < mid && j <= right) {
			if (tempArray[i] <= tempArray[j]) {
				this.copyData(
					i,
					k,
					leftOffset,
					currOffset,
					row + 1,
					row,
					tempDisplay[i],
					currArrayID[k],
					iPointerID
				);
				this.arrayData[k] = tempArray[i];
				this.displayData[k] = tempDisplay[i];
				k++;
				this.movePointer(k, row, currOffset, kPointerID);
				i++;
				if (i < mid) {
					this.movePointer(i, row + 1, leftOffset, iPointerID);
				}
			} else {
				this.copyData(
					j,
					k,
					rightOffset,
					currOffset,
					row + 1,
					row,
					tempDisplay[j],
					currArrayID[k],
					jPointerID
				);
				this.arrayData[k] = tempArray[j];
				this.displayData[k] = tempDisplay[i];
				k++;
				this.movePointer(k, row, currOffset, kPointerID);
				j++;
				if (j <= right) {
					this.movePointer(j, row + 1, rightOffset, jPointerID);
				}
			}
			this.cmd('Step');
		}
		while (i < mid) {
			this.copyData(
				i,
				k,
				leftOffset,
				currOffset,
				row + 1,
				row,
				tempDisplay[i],
				currArrayID[k],
				iPointerID
			);
			this.arrayData[k] = tempArray[i];
			this.displayData[k] = tempDisplay[i];
			k++;
			i++;
			if (k <= right) {
				this.movePointer(i, row + 1, leftOffset, iPointerID);
				this.movePointer(k, row, currOffset, kPointerID);
			}
		}
		while (j <= right) {
			this.copyData(
				j,
				k,
				rightOffset,
				currOffset,
				row + 1,
				row,
				tempDisplay[j],
				currArrayID[k],
				jPointerID
			);
			this.arrayData[k] = tempArray[j];
			this.displayData[k] = tempDisplay[j];
			j++;
			k++;
			if (k <= right) {
				this.movePointer(j, row + 1, rightOffset, jPointerID);
				this.movePointer(k, row, currOffset, kPointerID);
			}
		}

		// Delete pointers
		this.cmd('Delete', iPointerID);
		this.cmd('Delete', jPointerID);
		this.cmd('Delete', kPointerID);
		this.cmd('Step');
	}

	copyData(fromIndex, toIndex, fromOffset, toOffset, fromRow, toRow, value, cellID, pointerID) {
		if (pointerID !== -1) {
			this.cmd('SetForegroundColor', pointerID, '#FF0000');
			this.cmd('Step');
		}
		const fromXPos = fromIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + fromOffset;
		const fromYPos = ARRAY_START_Y + fromRow * ARRAY_LINE_SPACING;
		const labelID = this.nextIndex++;
		this.cmd('CreateLabel', labelID, value, fromXPos, fromYPos);
		const toXPos = toIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + toOffset;
		const toYPos = ARRAY_START_Y + toRow * ARRAY_LINE_SPACING;
		this.cmd('Move', labelID, toXPos, toYPos);
		this.cmd('Step');
		this.cmd('SetText', cellID, value);
		this.cmd('Delete', labelID);
		if (pointerID !== -1) {
			this.cmd('SetBackgroundColor', cellID, '#2ECC71');
			this.cmd('SetForegroundColor', pointerID, '#0000FF');
			this.cmd('Step');
		}
	}

	movePointer(index, row, offset, pointerID) {
		const xPos = index * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
		const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
		this.cmd('Move', pointerID, xPos, yPos);
	}

	// Called by our superexport default class when we get an animation started event -- need to wait for the
	// event to finish before we start doing anything
	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	// Called by our superexport default class when we get an animation completed event -- we can
	/// now interact again.
	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}
