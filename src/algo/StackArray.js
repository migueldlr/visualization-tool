﻿// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
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

import Algorithm, { addControlToAlgorithmBar } from './Algorithm.js';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRRAY_ELEMS_PER_LINE = 15;
const ARRAY_LINE_SPACING = 130;

const TOP_POS_X = 180;
const TOP_POS_Y = 100;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 100;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const SIZE = 30;

export default class StackArray extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.setup();
		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];
		this.pushField = addControlToAlgorithmBar('Text', '');
		this.pushField.onkeydown = this.returnSubmit(
			this.pushField,
			this.pushCallback.bind(this),
			6
		);
		this.pushButton = addControlToAlgorithmBar('Button', 'Push');
		this.pushButton.onclick = this.pushCallback.bind(this);
		this.controls.push(this.pushField);
		this.controls.push(this.pushButton);

		this.popButton = addControlToAlgorithmBar('Button', 'Pop');
		this.popButton.onclick = this.popCallback.bind(this);
		this.controls.push(this.popButton);

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear Stack');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	setup() {
		this.nextIndex = 0;

		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}
		this.topID = this.nextIndex++;
		this.topLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.top = 0;
		this.leftoverLabelID = this.nextIndex++;
		this.commands = [];

		for (let i = 0; i < SIZE; i++) {
			const xpos = (i % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			this.cmd(
				'CreateRectangle',
				this.arrayID[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos
			);
			this.cmd('CreateLabel', this.arrayLabelID[i], i, xpos, ypos + ARRAY_ELEM_HEIGHT);
			this.cmd('SetForegroundColor', this.arrayLabelID[i], '#0000FF');
		}
		this.cmd('CreateLabel', this.topLabelID, 'top', TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			'CreateRectangle',
			this.topID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y
		);

		this.cmd('CreateLabel', this.leftoverLabelID, '', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.highlight1ID = this.nextIndex++;
		this.highlight2ID = this.nextIndex++;

		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.top = 0;
		this.nextIndex = this.initialIndex;
	}

	pushCallback() {
		if (this.top < SIZE && this.pushField.value !== '') {
			const pushVal = this.pushField.value;
			this.pushField.value = '';
			this.implementAction(this.push.bind(this), pushVal);
		}
	}

	popCallback() {
		if (this.top > 0) {
			this.implementAction(this.pop.bind(this), '');
		}
	}

	clearCallback() {
		this.implementAction(this.clearData.bind(this), '');
	}

	clearData() {
		this.commands = [];
		this.clearAll();
		return this.commands;
	}

	push(elemToPush) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		this.arrayData[this.top] = elemToPush;

		this.cmd('SetText', this.leftoverLabelID, '');

		this.cmd('CreateLabel', labPushID, 'Pushing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd('CreateLabel', labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd('Step');
		this.cmd('Step');
		this.cmd('Step');
		this.cmd('CreateHighlightCircle', this.highlight1ID, '#0000FF', TOP_POS_X, TOP_POS_Y);
		this.cmd('Step');

		const xpos = (this.top % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.top / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Step');

		this.cmd('Move', labPushValID, xpos, ypos);
		this.cmd('Step');

		this.cmd('Settext', this.arrayID[this.top], elemToPush);
		this.cmd('Delete', labPushValID);

		this.cmd('Delete', this.highlight1ID);

		this.cmd('SetHighlight', this.topID, 1);
		this.cmd('Step');
		this.top = this.top + 1;
		this.cmd('SetText', this.topID, this.top);
		this.cmd('Delete', labPushID);
		this.cmd('Step');
		this.cmd('SetHighlight', this.topID, 0);

		return this.commands;
	}

	pop() {
		this.commands = [];

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd('SetText', this.leftoverLabelID, '');

		this.cmd('CreateLabel', labPopID, 'Popped Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.cmd('SetHighlight', this.topID, 1);
		this.cmd('Step');
		this.top = this.top - 1;
		this.cmd('SetText', this.topID, this.top);
		this.cmd('Step');
		this.cmd('SetHighlight', this.topID, 0);

		this.cmd('CreateHighlightCircle', this.highlight1ID, '#0000FF', TOP_POS_X, TOP_POS_Y);
		this.cmd('Step');

		const xpos = (this.top % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.top / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Move', this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd('Step');

		this.cmd('CreateLabel', labPopValID, this.arrayData[this.top], xpos, ypos);
		this.cmd('Settext', this.arrayID[this.top], '');
		this.cmd('Move', labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd('Step');
		this.cmd('Delete', labPopValID);
		this.cmd('Delete', labPopID);
		this.cmd('Delete', this.highlight1ID);
		this.cmd('SetText', this.leftoverLabelID, 'Popped Value: ' + this.arrayData[this.top]);

		return this.commands;
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.top; i++) {
			this.cmd('SetText', this.arrayID[i], '');
		}
		this.top = 0;
		this.cmd('SetText', this.topID, '0');
		return this.commands;
	}
}
