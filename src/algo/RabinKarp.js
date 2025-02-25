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

const ARRAY_START_X = 100;
const ARRAY_START_Y = 30;

const MAX_LENGTH = 22;

// const LOWER_A_CHAR_CODE = 97;

const BASE_LABEL_Y = 45;
const CHARACTER_VALUES_LABEL_Y = 60;
const TEXT_HASH_LABEL_START_Y = 100;
const PATTERN_HASH_LABEL_START_Y = 115;

export default class RabinKarp extends Algorithm {
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

		addLabelToAlgorithmBar('Text');

		// Text text field
		this.textField = addControlToAlgorithmBar('Text', '');
		this.textField.onkeydown = this.returnSubmit(
			this.textField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false
		);
		this.controls.push(this.textField);

		addLabelToAlgorithmBar('Pattern');

		// Pattern text field
		this.patternField = addControlToAlgorithmBar('Text', '');
		this.patternField.onkeydown = this.returnSubmit(
			this.patternField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false
		);
		this.controls.push(this.patternField);

		// Find button
		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.textRowID = [];
		this.comparisonMatrixID = [];
		this.baseLabelID = this.nextIndex++;
		this.characterValuesLabelID = this.nextIndex++;
		this.textHashLabelID = this.nextIndex++;
		this.textHashCalculationID = this.nextIndex++;
		this.patternHashLabelID = this.nextIndex++;
		this.patternHashCalculationID = this.nextIndex++;
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

	findCallback() {
		if (
			this.textField.value !== '' &&
			this.patternField.value !== '' &&
			this.textField.value.length >= this.patternField.value.length
		) {
			this.implementAction(this.clear.bind(this), '');
			const text = this.textField.value;
			const pattern = this.patternField.value;
			this.textField.value = '';
			this.patternField.value = '';
			this.implementAction(this.find.bind(this), text + ',' + pattern);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), '');
	}

	find(params) {
		this.commands = [];

		// Filter non-letters from string and make lower case
		const text = params
			.split(',')[0]
			.replace(/[^a-zA-Z]/g, '')
			.toLowerCase();
		const pattern = params
			.split(',')[1]
			.replace(/[^a-zA-Z]/g, '')
			.toLowerCase();

		if (text.length <= 14) {
			this.cellSize = 30;
		} else if (text.length <= 17) {
			this.cellSize = 25;
		} else {
			this.cellSize = 20;
		}

		this.textRowID = new Array(text.length);
		this.comparisonMatrixID = new Array(text.length);
		for (let i = 0; i < text.length; i++) {
			this.comparisonMatrixID[i] = new Array(text.length);
		}

		let xpos, ypos;

		for (let i = 0; i < text.length; i++) {
			xpos = i * this.cellSize + ARRAY_START_X;
			ypos = ARRAY_START_Y;
			this.textRowID[i] = this.nextIndex;
			this.cmd(
				'CreateRectangle',
				this.nextIndex,
				text.charAt(i),
				this.cellSize,
				this.cellSize,
				xpos,
				ypos
			);
			this.cmd('SetBackgroundColor', this.nextIndex++, '#D3D3D3');
		}

		for (let row = 0; row < text.length; row++) {
			for (let col = 0; col < text.length; col++) {
				xpos = col * this.cellSize + ARRAY_START_X;
				ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.comparisonMatrixID[row][col] = this.nextIndex;
				this.cmd(
					'CreateRectangle',
					this.nextIndex++,
					'',
					this.cellSize,
					this.cellSize,
					xpos,
					ypos
				);
			}
		}

		const labelsX = ARRAY_START_X + text.length * this.cellSize + 10;
		this.cmd('CreateLabel', this.baseLabelID, 'Base constant = 1', labelsX, BASE_LABEL_Y, 0);
		this.cmd(
			'CreateLabel',
			this.characterValuesLabelID,
			'Character values: a = 0, b = 1, ..., z = 25',
			labelsX,
			CHARACTER_VALUES_LABEL_Y,
			0
		);
		this.cmd(
			'CreateLabel',
			this.textHashLabelID,
			'Text hash:',
			labelsX,
			TEXT_HASH_LABEL_START_Y,
			0
		);
		this.cmd(
			'CreateLabel',
			this.patternHashLabelID,
			'Pattern hash:',
			labelsX,
			PATTERN_HASH_LABEL_START_Y,
			0
		);

		let textCalculation = '';
		let textHash = 0;
		let patternCalculation = '';
		let patternHash = 0;
		for (let i = 0; i < pattern.length; i++) {
			textHash += text.charCodeAt(i) - 97;
			textCalculation += text.charAt(i) + ' + ';
			patternHash += pattern.charCodeAt(i) - 97;
			patternCalculation += pattern.charAt(i) + ' + ';
		}
		textCalculation =
			textCalculation.substring(0, textCalculation.length - 2) + ' = ' + textHash;
		patternCalculation =
			patternCalculation.substring(0, patternCalculation.length - 2) + ' = ' + patternHash;
		const calculationsX = ARRAY_START_X + text.length * this.cellSize + 80;
		this.cmd(
			'CreateLabel',
			this.textHashCalculationID,
			textCalculation,
			calculationsX,
			TEXT_HASH_LABEL_START_Y,
			0
		);
		this.cmd(
			'CreateLabel',
			this.patternHashCalculationID,
			patternCalculation,
			calculationsX,
			PATTERN_HASH_LABEL_START_Y,
			0
		);

		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;

		let row = 0;
		for (let i = 0; i <= text.length - pattern.length; i++) {
			for (let k = i; k < i + pattern.length; k++) {
				this.cmd(
					'SetText',
					this.comparisonMatrixID[row][k],
					pattern.charAt(k - i),
					xpos,
					ypos
				);
			}
			this.cmd('Step');
			if (patternHash === textHash) {
				xpos = i * this.cellSize + ARRAY_START_X;
				this.cmd('CreateHighlightCircle', iPointerID, '#0000FF', xpos, ARRAY_START_Y);
				ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.cmd('CreateHighlightCircle', jPointerID, '#0000FF', xpos, ypos);
				this.cmd('Step');
				let j = 0;
				while (j < pattern.length && pattern.charAt(j) === text.charAt(i + j)) {
					this.cmd('SetBackgroundColor', this.comparisonMatrixID[row][i + j], '#2ECC71');
					j++;
					if (j !== pattern.length) {
						xpos = (i + j) * this.cellSize + ARRAY_START_X;
						this.cmd('Move', iPointerID, xpos, ARRAY_START_Y);
						ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
						this.cmd('Move', jPointerID, xpos, ypos);
						this.cmd('Step');
					}
				}
				if (j !== pattern.length) {
					this.cmd('SetBackgroundColor', this.comparisonMatrixID[row][i + j], '#E74C3C');
				}
				this.cmd('Delete', iPointerID);
				this.cmd('Delete', jPointerID);
				this.cmd('Step');
			} else {
				for (let k = i; k < i + pattern.length; k++) {
					this.cmd('SetBackgroundColor', this.comparisonMatrixID[row][k], '#FFFF4D');
				}
				this.cmd('Step');
			}
			if (i < text.length - pattern.length) {
				textHash =
					textHash -
					(text.charCodeAt(i) - 97) +
					(text.charCodeAt(i + pattern.length) - 97);
				textCalculation = '';
				for (let k = 0; k < pattern.length; k++) {
					textCalculation += text.charAt(k + i + 1) + ' + ';
				}
				textCalculation =
					textCalculation.substring(0, textCalculation.length - 2) + ' = ' + textHash;
				this.cmd('SetText', this.textHashCalculationID, textCalculation);
			}
			row++;
		}

		return this.commands;
	}

	clear() {
		this.commands = [];
		if (this.textRowID.length !== 0) {
			this.cmd('Delete', this.baseLabelID);
			this.cmd('Delete', this.characterValuesLabelID);
			this.cmd('Delete', this.textHashLabelID);
			this.cmd('Delete', this.textHashCalculationID);
			this.cmd('Delete', this.patternHashLabelID);
			this.cmd('Delete', this.patternHashCalculationID);
		}
		for (let i = 0; i < this.textRowID.length; i++) {
			this.cmd('Delete', this.textRowID[i]);
		}
		this.textRowID = [];
		for (let i = 0; i < this.comparisonMatrixID.length; i++) {
			for (let j = 0; j < this.comparisonMatrixID.length; j++) {
				this.cmd('Delete', this.comparisonMatrixID[i][j]);
			}
		}
		this.comparisonMatrixID = [];

		return this.commands;
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
