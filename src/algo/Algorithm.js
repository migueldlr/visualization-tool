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

export function addLabelToAlgorithmBar(labelName, group) {
	const element = document.createTextNode(labelName);

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		// Append the element in page (in span)
		controlBar.appendChild(tableEntry);
	} else {
		group.appendChild(element);
	}

	return element;
}

export function addCheckboxToAlgorithmBar(boxLabel, checked, group) {
	const element = document.createElement('input');

	element.setAttribute('type', 'checkbox');
	element.setAttribute('value', boxLabel);
	checked && element.setAttribute('checked', 'true');

	const label = document.createTextNode(boxLabel);

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);
		tableEntry.appendChild(label);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		const span = document.createElement('span');
		span.appendChild(element);
		span.appendChild(label);

		group.appendChild(span);
	}

	return element;
}

export function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName, group) {
	const buttonList = [];
	const newTable = document.createElement('table');

	for (let i = 0; i < buttonNames.length; i++) {
		const midLevel = document.createElement('tr');
		const bottomLevel = document.createElement('td');

		const button = document.createElement('input');
		button.setAttribute('type', 'radio');
		button.setAttribute('name', groupName);
		button.setAttribute('value', buttonNames[i]);
		bottomLevel.appendChild(button);
		midLevel.appendChild(bottomLevel);
		const txtNode = document.createTextNode(' ' + buttonNames[i]);
		bottomLevel.appendChild(txtNode);
		newTable.appendChild(midLevel);
		buttonList.push(button);
	}

	if (!group) {
		const topLevelTableEntry = document.createElement('td');
		topLevelTableEntry.appendChild(newTable);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(topLevelTableEntry);
	} else {
		group.appendChild(newTable);
	}

	return buttonList;
}

export function addControlToAlgorithmBar(type, value, group) {
	const element = document.createElement('input');

	element.setAttribute('type', type);
	element.setAttribute('value', value);

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		group.appendChild(element);
	}

	return element;
}

export function addGroupToAlgorithmBar(horizontal, parentGroup) {
	const group = document.createElement('div');

	group.setAttribute('class', horizontal ? 'hgroup' : 'vgroup');

	if (!parentGroup) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(group);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		parentGroup.appendChild(group);
	}

	return group;
}

export default class Algorithm {
	constructor(am, w, h) {
		if (am == null) {
			return;
		}
		this.animationManager = am;
		am.addListener('AnimationStarted', this, this.disableUI);
		am.addListener('AnimationEnded', this, this.enableUI);
		am.addListener('AnimationUndo', this, this.undo);
		this.canvasWidth = w;
		this.canvasHeight = h;

		this.actionHistory = [];
		this.recordAnimation = true;
		this.commands = [];
	}

	addCodeToCanvasBase(code, start_x, start_y, line_height, standard_color, layer) {
		layer = typeof layer !== 'undefined' ? layer : 0;
		const codeID = Array(code.length);
		let i, j;
		for (i = 0; i < code.length; i++) {
			codeID[i] = new Array(code[i].length);
			for (j = 0; j < code[i].length; j++) {
				codeID[i][j] = this.nextIndex++;
				this.cmd(
					'CreateLabel',
					codeID[i][j],
					code[i][j],
					start_x,
					start_y + i * line_height,
					0
				);
				this.cmd('SetForegroundColor', codeID[i][j], standard_color);
				this.cmd('SetLayer', codeID[i][j], layer);
				if (j > 0) {
					this.cmd('AlignRight', codeID[i][j], codeID[i][j - 1]);
				}
			}
		}
		return codeID;
	}

	setCodeAlpha(code, newAlpha) {
		for (let i = 0; i < code.length; i++) {
			for (let j = 0; j < code[i].length; j++) {
				this.cmd('SetAlpha', code[i][j], newAlpha);
			}
		}
	}

	cmd() {
		// Helper method to create a command string from a bunch of arguments
		if (this.recordAnimation) {
			let command = arguments[0];
			for (let i = 1; i < arguments.length; i++) {
				command = command + '<;>' + String(arguments[i]);
			}
			this.commands.push(command);
		}
	}

	clearHistory() {
		this.actionHistory = [];
	}

	undo() {
		// Remove the last action (the one that we are going to undo)
		this.actionHistory.pop();
		// Clear out our data structure.  Be sure to implement reset in
		// every AlgorithmAnimation subclass!
		this.reset();
		//  Redo all actions from the beginning, throwing out the animation
		//  commands (the animation manager will update the animation on its own).
		//  Note that if you do something non-deterministic, you might cause problems!
		//  Be sure if you do anything non-deterministic (that is, calls to a random
		//  number generator) you clear out the undo stack here and in the animation
		//  manager.

		//  If this seems horribly inefficient -- it is! However, it seems to work well
		//  in practice, and you get undo for free for all algorithms, which is a non-trivial
		//  gain.
		const len = this.actionHistory.length;
		this.recordAnimation = false;
		for (let i = 0; i < len; i++) {
			this.actionHistory[i][0](this.actionHistory[i][1]);
		}
		this.recordAnimation = true;
	}

	implementAction(funct, val) {
		const nxt = [funct, val];
		this.actionHistory.push(nxt);
		const retVal = funct(val);
		this.animationManager.StartNewAnimation(retVal);
	}

	normalizeNumber(input, maxLen) {
		const isAllDigits = str => !/\D/.test(str);
		if (!isAllDigits(input) || input === '') {
			return input;
		}
		return ('OOO0000' + input).substr(-maxLen, maxLen);
	}

	returnSubmit(field, funct, maxsize, intOnly) {
		if (maxsize !== undefined) {
			field.size = maxsize;
		}
		return function(event) {
			let keyASCII = 0;
			if (window.event) {
				// IE
				keyASCII = event.keyCode;
			} else if (event.which) {
				// Netscape/Firefox/Opera
				keyASCII = event.which;
			}

			if (keyASCII === 13 && funct != null) {
				funct();
			} else if (
				keyASCII === 190 ||
				keyASCII === 59 ||
				keyASCII === 173 ||
				keyASCII === 189
			) {
				return false;
			} else if (
				(maxsize !== undefined && field.value.length >= maxsize) ||
				(intOnly && (keyASCII < 48 || keyASCII > 57))
			) {
				if (!controlKey(keyASCII)) return false;
			}
		};
	}

	// Abstract methods - these should be implemented in the base class

	// eslint-disable-next-line no-unused-vars
	sizeChanged(newWidth, newHeight) {
		throw new Error('sizeChanged should be implemented in base class');
	}

	// eslint-disable-next-line no-unused-vars
	disableUI(event) {
		throw new Error('disableUI should be implemented in base class');
	}

	// eslint-disable-next-line no-unused-vars
	enableUI(event) {
		throw new Error('enableUI should be implemented in base class');
	}

	reset() {
		throw new Error('reset should be implemented in base class');
	}
}

export function controlKey(keyASCII) {
	return (
		keyASCII === 8 ||
		keyASCII === 9 ||
		keyASCII === 37 ||
		keyASCII === 38 ||
		keyASCII === 39 ||
		keyASCII === 40 ||
		keyASCII === 46
	);
}

Algorithm.prototype.returnSubmitFloat = function(field, funct, maxsize) {
	if (maxsize !== undefined) {
		field.size = maxsize;
	}
	return function(event) {
		let keyASCII = 0;
		if (window.event) {
			// IE
			keyASCII = event.keyCode;
		} else if (event.which) {
			// Netscape/Firefox/Opera
			keyASCII = event.which;
		}
		// Submit on return
		if (keyASCII === 13) {
			funct();
		}
		// Control keys (arrows, del, etc) are always OK
		else if (controlKey(keyASCII)) {
			return;
		}
		// - (minus sign) only OK at beginning of number
		//  (For now we will allow anywhere -- hard to see where the beginning of the
		//   number is ...)
		//else if (keyASCII == 109 && field.value.length  == 0)
		else if (keyASCII === 109) {
			return;
		}
		// Digis are OK if we have enough space
		else if (
			(maxsize !== undefined || field.value.length < maxsize) &&
			keyASCII >= 48 &&
			keyASCII <= 57
		) {
			return;
		}
		// . (Decimal point) is OK if we haven't had one yet, and there is space
		else if (
			(maxsize !== undefined || field.value.length < maxsize) &&
			keyASCII === 190 &&
			field.value.indexOf('.') === -1
		) {
			return;
		}
		// Nothing else is OK
		else {
			return false;
		}
	};
};

Algorithm.prototype.addReturnSubmit = function(field, action) {
	field.onkeydown = this.returnSubmit(field, action, 4, false);
};
