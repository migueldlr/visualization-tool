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

import Algorithm, { addControlToAlgorithmBar } from './Algorithm.js';

// Constants.

const LINK_COLOR = '#007700';
const HIGHLIGHT_CIRCLE_COLOR = '#007700';
const FOREGROUND_COLOR = '#007700';
const BACKGROUND_COLOR = '#EEFFEE';
const PRINT_COLOR = FOREGROUND_COLOR;

const WIDTH_DELTA = 50;
const HEIGHT_DELTA = 50;
const STARTING_Y = 50;

const FIRST_PRINT_POS_X = 50;
const PRINT_VERTICAL_GAP = 20;
const PRINT_HORIZONTAL_GAP = 50;

export default class SplayTree extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.startingX = w / 2;
		this.first_print_pos_y = h - 2 * PRINT_VERTICAL_GAP;
		this.print_max = w - 10;

		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.cmd('CreateLabel', 0, '', 20, 10, 0);
		this.nextIndex = 1;
		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	addControls() {
		this.insertField = addControlToAlgorithmBar('Text', '');
		this.insertField.onkeydown = this.returnSubmit(
			this.insertField,
			this.insertCallback.bind(this),
			4
		);
		this.insertButton = addControlToAlgorithmBar('Button', 'Insert');
		this.insertButton.onclick = this.insertCallback.bind(this);
		this.deleteField = addControlToAlgorithmBar('Text', '');
		this.deleteField.onkeydown = this.returnSubmit(
			this.deleteField,
			this.deleteCallback.bind(this),
			4
		);
		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);
		this.findField = addControlToAlgorithmBar('Text', '');
		this.findField.onkeydown = this.returnSubmit(
			this.findField,
			this.findCallback.bind(this),
			4
		);
		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.printButton = addControlToAlgorithmBar('Button', 'Print');
		this.printButton.onclick = this.printCallback.bind(this);
	}

	reset() {
		this.nextIndex = 1;
		this.treeRoot = null;
	}

	insertCallback() {
		let insertedValue = this.insertField.value;
		// Get text value
		insertedValue = this.normalizeNumber(insertedValue, 4);
		if (insertedValue !== '') {
			// set text value
			this.insertField.value = '';
			this.implementAction(this.insertElement.bind(this), insertedValue);
		}
	}

	deleteCallback() {
		let deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			deletedValue = this.normalizeNumber(deletedValue, 4);
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), deletedValue);
		}
	}

	//  TODO:  This top-down version is broken.  Don't use
	splay(value) {
		if (this.treeRoot == null) {
			return false;
		}
		if (this.treeRoot.data === value) {
			return true;
		}
		if (value < this.treeRoot.data) {
			if (this.treeRoot.left == null) {
				return false;
			} else if (this.treeRoot.left.data === value) {
				this.singleRotateRight(this.treeRoot);
				return true;
			} else if (value < this.treeRoot.left.data) {
				if (this.treeRoot.left.left == null) {
					this.singleRotateRight(this.treeRoot);
					return this.splay(value);
				} else {
					this.zigZigRight(this.treeRoot);
					return this.splay(value);
				}
			} else {
				if (this.treeRoot.left.right == null) {
					this.singleRotateRight(this.treeRoot);
					return this.splay(value);
				} else {
					this.doubleRotateRight(this.treeRoot);
					return this.splay(value);
				}
			}
		} else {
			if (this.treeRoot.right == null) {
				return false;
			} else if (this.treeRoot.right.data === value) {
				this.singleRotateLeft(this.treeRoot);
				return true;
			} else if (value > this.treeRoot.right.data) {
				if (this.treeRoot.right.right == null) {
					this.singleRotateLeft(this.treeRoot);
					return this.splay(value);
				} else {
					this.zigZigLeft(this.treeRoot);
					return this.splay(value);
				}
			} else {
				if (this.treeRoot.right.left == null) {
					this.singleRotateLeft(this.treeRoot);
					return this.splay(value);
				} else {
					this.doubleRotateLeft(this.treeRot);
					return this.splay(value);
				}
			}
		}
	}

	printCallback() {
		this.implementAction(this.printTree.bind(this), '');
	}

	printTree() {
		this.commands = [];

		if (this.treeRoot != null) {
			this.highlightID = this.nextIndex++;
			const firstLabel = this.nextIndex;
			this.cmd(
				'CreateHighlightCircle',
				this.highlightID,
				HIGHLIGHT_CIRCLE_COLOR,
				this.treeRoot.x,
				this.treeRoot.y
			);
			this.xPosOfNextLabel = FIRST_PRINT_POS_X;
			this.yPosOfNextLabel = this.first_print_pos_y;
			this.printTreeRec(this.treeRoot);
			this.cmd('Delete', this.highlightID);
			this.cmd('Step');

			for (let i = firstLabel; i < this.nextIndex; i++) {
				this.cmd('Delete', i);
			}
			this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
		}
		return this.commands;
	}

	printTreeRec(tree) {
		this.cmd('Step');
		if (tree.left != null) {
			this.cmd('Move', this.highlightID, tree.left.x, tree.left.y);
			this.printTreeRec(tree.left);
			this.cmd('Move', this.highlightID, tree.x, tree.y);
			this.cmd('Step');
		}
		const nextLabelID = this.nextIndex++;
		this.cmd('CreateLabel', nextLabelID, tree.data, tree.x, tree.y);
		this.cmd('SetForegroundColor', nextLabelID, PRINT_COLOR);
		this.cmd('Move', nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
		this.cmd('Step');

		this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
		if (this.xPosOfNextLabel > this.print_max) {
			this.xPosOfNextLabel = FIRST_PRINT_POS_X;
			this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
		}
		if (tree.right != null) {
			this.cmd('Move', this.highlightID, tree.right.x, tree.right.y);
			this.printTreeRec(tree.right);
			this.cmd('Move', this.highlightID, tree.x, tree.y);
			this.cmd('Step');
		}
		return;
	}

	findCallback() {
		const findValue = this.normalizeNumber(this.findField.value, 4);
		this.findField.value = '';
		this.implementAction(this.findElement.bind(this), findValue);
	}

	findElement(findValue) {
		this.commands = [];

		this.highlightID = this.nextIndex++;

		const found = this.doFind(this.treeRoot, findValue);

		if (found) {
			this.cmd('SetText', 0, 'Element ' + findValue + ' found.');
		} else {
			this.cmd('SetText', 0, 'Element ' + findValue + ' not found.');
		}

		return this.commands;
	}

	doFind(tree, value) {
		this.cmd('SetText', 0, 'Searching for ' + value);
		if (tree != null) {
			this.cmd('SetHighlight', tree.graphicID, 1);
			if (tree.data === value) {
				this.cmd(
					'SetText',
					0,
					'Searching for ' + value + ' : ' + value + ' = ' + value + ' (Element found!)'
				);
				this.cmd('Step');
				this.cmd('SetText', 0, 'Splaying found node to root of tree');
				this.cmd('Step');
				this.cmd('SetHighlight', tree.graphicID, 0);
				this.splayUp(tree);
				return true;
			} else {
				if (tree.data > value) {
					this.cmd(
						'SetText',
						0,
						'Searching for ' +
							value +
							' : ' +
							value +
							' < ' +
							tree.data +
							' (look to left subtree)'
					);
					this.cmd('Step');
					this.cmd('SetHighlight', tree.graphicID, 0);
					if (tree.left != null) {
						this.cmd(
							'CreateHighlightCircle',
							this.highlightID,
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y
						);
						this.cmd('Move', this.highlightID, tree.left.x, tree.left.y);
						this.cmd('Step');
						this.cmd('Delete', this.highlightID);
						return this.doFind(tree.left, value);
					} else {
						this.splayUp(tree);
						return false;
					}
				} else {
					this.cmd(
						'SetText',
						0,
						'Searching for ' +
							value +
							' : ' +
							value +
							' > ' +
							tree.data +
							' (look to right subtree)'
					);
					this.cmd('Step');
					this.cmd('SetHighlight', tree.graphicID, 0);
					if (tree.right != null) {
						this.cmd(
							'CreateHighlightCircle',
							this.highlightID,
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y
						);
						this.cmd('Move', this.highlightID, tree.right.x, tree.right.y);
						this.cmd('Step');
						this.cmd('Delete', this.highlightID);
						return this.doFind(tree.right, value);
					} else {
						this.splayUp(tree);
						return false;
					}
				}
			}
		} else {
			this.cmd(
				'SetText',
				0,
				'Searching for ' + value + ' : < Empty Tree > (Element not found)'
			);
			this.cmd('Step');
			this.cmd('SetText', 0, 'Searching for ' + value + ' :  (Element not found)');
			return false;
		}
	}

	insertElement(insertedValue) {
		this.commands = [];
		this.cmd('SetText', 0, 'Inserting ' + insertedValue);
		this.highlightID = this.nextIndex++;

		if (this.treeRoot == null) {
			this.cmd('CreateCircle', this.nextIndex, insertedValue, this.startingX, STARTING_Y);
			this.cmd('SetForegroundColor', this.nextIndex, FOREGROUND_COLOR);
			this.cmd('SetBackgroundColor', this.nextIndex, BACKGROUND_COLOR);
			this.cmd('Step');
			this.treeRoot = new BSTNode(insertedValue, this.nextIndex, this.startingX, STARTING_Y);
			this.nextIndex += 1;
		} else {
			this.cmd('CreateCircle', this.nextIndex, insertedValue, 100, 100);
			this.cmd('SetForegroundColor', this.nextIndex, FOREGROUND_COLOR);
			this.cmd('SetBackgroundColor', this.nextIndex, BACKGROUND_COLOR);
			this.cmd('Step');
			const insertElem = new BSTNode(insertedValue, this.nextIndex, 100, 100);

			this.nextIndex += 1;
			this.cmd('SetHighlight', insertElem.graphicID, 1);
			this.insert(insertElem, this.treeRoot);
			this.resizeTree();
			this.cmd('SetText', 0, 'Splay inserted element to root of tree');
			this.cmd('Step');
			this.splayUp(insertElem);
		}
		this.cmd('SetText', 0, '');
		return this.commands;
	}

	insert(elem, tree) {
		let foundDuplicate = false;
		this.cmd('SetHighlight', tree.graphicID, 1);
		this.cmd('SetHighlight', elem.graphicID, 1);

		if (elem.data < tree.data) {
			this.cmd('SetText', 0, elem.data + ' < ' + tree.data + '.  Looking at left subtree');
		} else if (elem.data > tree.data) {
			this.cmd('SetText', 0, elem.data + ' >= ' + tree.data + '.  Looking at right subtree');
		} else {
			this.cmd('SetText', 0, elem.data + ' = ' + tree.data + '. Ignoring duplicate');
			foundDuplicate = true;
		}
		this.cmd('Step');
		this.cmd('SetHighlight', tree.graphicID, 0);
		this.cmd('SetHighlight', elem.graphicID, 0);

		if (foundDuplicate) {
			this.cmd('Delete', elem.graphicID, 0);
			return;
		}

		if (elem.data < tree.data) {
			if (tree.left == null) {
				this.cmd('SetText', 0, 'Found null tree, inserting element');

				this.cmd('SetHighlight', elem.graphicID, 0);
				tree.left = elem;
				elem.parent = tree;
				this.cmd('Connect', tree.graphicID, elem.graphicID, LINK_COLOR);
			} else {
				this.cmd(
					'CreateHighlightCircle',
					this.highlightID,
					HIGHLIGHT_CIRCLE_COLOR,
					tree.x,
					tree.y
				);
				this.cmd('Move', this.highlightID, tree.left.x, tree.left.y);
				this.cmd('Step');
				this.cmd('Delete', this.highlightID);
				this.insert(elem, tree.left);
			}
		} else {
			if (tree.right == null) {
				this.cmd('SetText', 0, 'Found null tree, inserting element');
				this.cmd('SetHighlight', elem.graphicID, 0);
				tree.right = elem;
				elem.parent = tree;
				this.cmd('Connect', tree.graphicID, elem.graphicID, LINK_COLOR);
				elem.x = tree.x + WIDTH_DELTA / 2;
				elem.y = tree.y + HEIGHT_DELTA;
				this.cmd('Move', elem.graphicID, elem.x, elem.y);
			} else {
				this.cmd(
					'CreateHighlightCircle',
					this.highlightID,
					HIGHLIGHT_CIRCLE_COLOR,
					tree.x,
					tree.y
				);
				this.cmd('Move', this.highlightID, tree.right.x, tree.right.y);
				this.cmd('Step');
				this.cmd('Delete', this.highlightID);
				this.insert(elem, tree.right);
			}
		}
	}

	deleteElement(deletedValue) {
		this.commands = [];
		this.cmd('SetText', 0, 'Deleting ' + deletedValue);
		this.cmd('Step');
		this.cmd('SetText', 0, '');
		this.highlightID = this.nextIndex++;
		this.treeDelete(this.treeRoot, deletedValue);
		this.cmd('SetText', 0, '');
		// Do delete
		return this.commands;
	}

	treeDelete(tree, valueToDelete) {
		this.cmd('SetText', 0, 'Finding ' + valueToDelete + ' and splaying to rooot');
		this.cmd('Step');

		const inTree = this.doFind(this.treeRoot, valueToDelete);
		this.cmd('SetText', 0, 'Removing root, leaving left and right trees');
		this.cmd('Step');
		if (inTree) {
			if (this.treeRoot.right == null) {
				this.cmd('Delete', this.treeRoot.graphicID);
				this.cmd('SetText', 0, 'No right tree, make left tree the root.');
				this.cmd('Step');
				this.treeRoot = this.treeRoot.left;
				this.treeRoot.parent = null;
				this.resizeTree();
			} else if (this.treeRoot.left == null) {
				this.cmd('Delete', this.treeRoot.graphicID);
				this.cmd('SetText', 0, 'No left tree, make right tree the root.');
				this.cmd('Step');
				this.treeRoot = this.treeRoot.right;
				this.treeRoot.parent = null;
				this.resizeTree();
			} else {
				const right = this.treeRoot.right;
				const left = this.treeRoot.left;
				const oldGraphicID = this.treeRoot.graphicID;
				this.cmd('Disconnect', this.treeRoot.graphicID, left.graphicID);
				this.cmd('Disconnect', this.treeRoot.graphicID, right.graphicID);
				this.cmd('SetAlpha', this.treeRoot.graphicID, 0);
				this.cmd('SetText', 0, 'Splay largest element in left tree to root');
				this.cmd('Step');

				left.parent = null;
				const largestLeft = this.findMax(left);
				this.splayUp(largestLeft);
				this.cmd(
					'SetText',
					0,
					'Left tree now has no right subtree, connect left and right trees'
				);
				this.cmd('Step');
				this.cmd('Connect', largestLeft.graphicID, right.graphicID, LINK_COLOR);
				largestLeft.parent = null;
				largestLeft.right = right;
				right.parent = largestLeft;
				this.treeRoot = largestLeft;
				this.cmd('Delete', oldGraphicID);
				this.resizeTree();
			}
		}
	}

	singleRotateRight(tree) {
		const B = tree;
		// const t3 = B.right;
		const A = tree.left;
		// const t1 = A.left;
		const t2 = A.right;

		this.cmd('SetText', 0, 'Zig Right');
		this.cmd('SetEdgeHighlight', B.graphicID, A.graphicID, 1);
		this.cmd('Step');

		if (t2 != null) {
			this.cmd('Disconnect', A.graphicID, t2.graphicID);
			this.cmd('Connect', B.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = B;
		}
		this.cmd('Disconnect', B.graphicID, A.graphicID);
		this.cmd('Connect', A.graphicID, B.graphicID, LINK_COLOR);
		A.parent = B.parent;
		if (B.parent == null) {
			this.treeRoot = A;
		} else {
			this.cmd('Disconnect', B.parent.graphicID, B.graphicID, LINK_COLOR);
			this.cmd('Connect', B.parent.graphicID, A.graphicID, LINK_COLOR);
			if (B.isLeftChild()) {
				B.parent.left = A;
			} else {
				B.parent.right = A;
			}
		}
		A.right = B;
		B.parent = A;
		B.left = t2;
		this.resizeTree();
	}

	zigZigRight(tree) {
		const C = tree;
		const B = tree.left;
		const A = tree.left.left;
		// const t1 = A.left;
		const t2 = A.right;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd('SetText', 0, 'Zig-Zig Right');
		this.cmd('SetEdgeHighlight', C.graphicID, B.graphicID, 1);
		this.cmd('SetEdgeHighlight', B.graphicID, A.graphicID, 1);
		this.cmd('Step');
		this.cmd('SetEdgeHighlight', C.graphicID, B.graphicID, 0);
		this.cmd('SetEdgeHighlight', B.graphicID, A.graphicID, 0);

		if (C.parent != null) {
			this.cmd('Disconnect', C.parent.graphicID, C.graphicID);
			this.cmd('Connect', C.parent.graphicID, A.graphicID, LINK_COLOR);
			if (C.isLeftChild()) {
				C.parent.left = A;
			} else {
				C.parent.right = A;
			}
		} else {
			this.treeRoot = A;
		}

		if (t2 != null) {
			this.cmd('Disconnect', A.graphicID, t2.graphicID);
			this.cmd('Connect', B.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = B;
		}
		if (t3 != null) {
			this.cmd('Disconnect', B.graphicID, t3.graphicID);
			this.cmd('Connect', C.graphicID, t3.graphicID, LINK_COLOR);
			t3.parent = C;
		}
		this.cmd('Disconnect', B.graphicID, A.graphicID);
		this.cmd('Connect', A.graphicID, B.graphicID, LINK_COLOR);
		this.cmd('Disconnect', C.graphicID, B.graphicID);
		this.cmd('Connect', B.graphicID, C.graphicID, LINK_COLOR);

		A.right = B;
		A.parent = C.parent;
		B.parent = A;
		B.left = t2;
		B.right = C;
		C.parent = B;
		C.left = t3;
		this.resizeTree();
	}

	zigZigLeft(tree) {
		const A = tree;
		const B = tree.right;
		const C = tree.right.right;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = C.left;
		// const t4 = C.right;

		this.cmd('SetText', 0, 'Zig-Zig Left');
		this.cmd('SetEdgeHighlight', A.graphicID, B.graphicID, 1);
		this.cmd('SetEdgeHighlight', B.graphicID, C.graphicID, 1);
		this.cmd('Step');
		this.cmd('SetEdgeHighlight', A.graphicID, B.graphicID, 0);
		this.cmd('SetEdgeHighlight', B.graphicID, C.graphicID, 0);

		if (A.parent != null) {
			this.cmd('Disconnect', A.parent.graphicID, A.graphicID);
			this.cmd('Connect', A.parent.graphicID, C.graphicID, LINK_COLOR);
			if (A.isLeftChild()) {
				A.parent.left = C;
			} else {
				A.parent.right = C;
			}
		} else {
			this.treeRoot = C;
		}

		if (t2 != null) {
			this.cmd('Disconnect', B.graphicID, t2.graphicID);
			this.cmd('Connect', A.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = A;
		}
		if (t3 != null) {
			this.cmd('Disconnect', C.graphicID, t3.graphicID);
			this.cmd('Connect', B.graphicID, t3.graphicID, LINK_COLOR);
			t3.parent = B;
		}
		this.cmd('Disconnect', A.graphicID, B.graphicID);
		this.cmd('Disconnect', B.graphicID, C.graphicID);
		this.cmd('Connect', C.graphicID, B.graphicID, LINK_COLOR);
		this.cmd('Connect', B.graphicID, A.graphicID, LINK_COLOR);
		C.parent = A.parent;
		A.right = t2;
		B.left = A;
		A.parent = B;
		B.right = t3;
		C.left = B;
		B.parent = C;

		this.resizeTree();
	}

	singleRotateLeft(tree) {
		const A = tree;
		const B = tree.right;
		// const t1 = A.left;
		const t2 = B.left;
		// const t3 = B.right;

		this.cmd('SetText', 0, 'Zig Left');
		this.cmd('SetEdgeHighlight', A.graphicID, B.graphicID, 1);
		this.cmd('Step');

		if (t2 != null) {
			this.cmd('Disconnect', B.graphicID, t2.graphicID);
			this.cmd('Connect', A.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = A;
		}
		this.cmd('Disconnect', A.graphicID, B.graphicID);
		this.cmd('Connect', B.graphicID, A.graphicID, LINK_COLOR);
		B.parent = A.parent;
		if (A.parent == null) {
			this.treeRoot = B;
		} else {
			this.cmd('Disconnect', A.parent.graphicID, A.graphicID, LINK_COLOR);
			this.cmd('Connect', A.parent.graphicID, B.graphicID, LINK_COLOR);

			if (A.isLeftChild()) {
				A.parent.left = B;
			} else {
				A.parent.right = B;
			}
		}
		B.left = A;
		A.parent = B;
		A.right = t2;

		this.resizeTree();
	}

	splayUp(tree) {
		if (tree.parent == null) {
			return;
		} else if (tree.parent.parent == null) {
			if (tree.isLeftChild()) {
				this.singleRotateRight(tree.parent);
			} else {
				this.singleRotateLeft(tree.parent);
			}
		} else if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
			this.doubleRotateLeft(tree.parent.parent);
			this.splayUp(tree);
		} else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
			this.doubleRotateRight(tree.parent.parent);
			this.splayUp(tree);
		} else if (tree.isLeftChild()) {
			this.zigZigRight(tree.parent.parent);
			this.splayUp(tree);
		} else {
			this.zigZigLeft(tree.parent.parent);
			this.splayUp(tree);
		}
	}

	findMax(tree) {
		if (tree.right != null) {
			this.highlightID = this.nextIndex++;
			this.cmd(
				'CreateHighlightCircle',
				this.highlightID,
				HIGHLIGHT_CIRCLE_COLOR,
				tree.x,
				tree.y
			);
			this.cmd('Step');
			while (tree.right != null) {
				this.cmd('Move', this.highlightID, tree.right.x, tree.right.y);
				this.cmd('Step');
				tree = tree.right;
			}
			this.cmd('Delete', this.highlightID);
			return tree;
		} else {
			return tree;
		}
	}

	doubleRotateRight(tree) {
		this.cmd('SetText', 0, 'Zig-Zag Right');
		const A = tree.left;
		const B = tree.left.right;
		const C = tree;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd('SetEdgeHighlight', C.graphicID, A.graphicID, 1);
		this.cmd('SetEdgeHighlight', A.graphicID, B.graphicID, 1);

		this.cmd('Step');

		if (t2 != null) {
			this.cmd('Disconnect', B.graphicID, t2.graphicID);
			t2.parent = A;
			A.right = t2;
			this.cmd('Connect', A.graphicID, t2.graphicID, LINK_COLOR);
		}
		if (t3 != null) {
			this.cmd('Disconnect', B.graphicID, t3.graphicID);
			t3.parent = C;
			C.left = t2;
			this.cmd('Connect', C.graphicID, t3.graphicID, LINK_COLOR);
		}
		if (C.parent == null) {
			B.parent = null;
			this.treeRoot = B;
		} else {
			this.cmd('Disconnect', C.parent.graphicID, C.graphicID);
			this.cmd('Connect', C.parent.graphicID, B.graphicID, LINK_COLOR);
			if (C.isLeftChild()) {
				C.parent.left = B;
			} else {
				C.parent.right = B;
			}
			B.parent = C.parent;
			C.parent = B;
		}
		this.cmd('Disconnect', C.graphicID, A.graphicID);
		this.cmd('Disconnect', A.graphicID, B.graphicID);
		this.cmd('Connect', B.graphicID, A.graphicID, LINK_COLOR);
		this.cmd('Connect', B.graphicID, C.graphicID, LINK_COLOR);
		B.left = A;
		A.parent = B;
		B.right = C;
		C.parent = B;
		A.right = t2;
		C.left = t3;

		this.resizeTree();
	}

	doubleRotateLeft(tree) {
		this.cmd('SetText', 0, 'Zig-Zag Left');
		const A = tree;
		const B = tree.right.left;
		const C = tree.right;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd('SetEdgeHighlight', A.graphicID, C.graphicID, 1);
		this.cmd('SetEdgeHighlight', C.graphicID, B.graphicID, 1);

		this.cmd('Step');

		if (t2 != null) {
			this.cmd('Disconnect', B.graphicID, t2.graphicID);
			t2.parent = A;
			A.right = t2;
			this.cmd('Connect', A.graphicID, t2.graphicID, LINK_COLOR);
		}
		if (t3 != null) {
			this.cmd('Disconnect', B.graphicID, t3.graphicID);
			t3.parent = C;
			C.left = t2;
			this.cmd('Connect', C.graphicID, t3.graphicID, LINK_COLOR);
		}

		if (A.parent == null) {
			B.parent = null;
			this.treeRoot = B;
		} else {
			this.cmd('Disconnect', A.parent.graphicID, A.graphicID);
			this.cmd('Connect', A.parent.graphicID, B.graphicID, LINK_COLOR);
			if (A.isLeftChild()) {
				A.parent.left = B;
			} else {
				A.parent.right = B;
			}
			B.parent = A.parent;
			A.parent = B;
		}
		this.cmd('Disconnect', A.graphicID, C.graphicID);
		this.cmd('Disconnect', C.graphicID, B.graphicID);
		this.cmd('Connect', B.graphicID, A.graphicID, LINK_COLOR);
		this.cmd('Connect', B.graphicID, C.graphicID, LINK_COLOR);
		B.left = A;
		A.parent = B;
		B.right = C;
		C.parent = B;
		A.right = t2;
		C.left = t3;

		this.resizeTree();
	}

	resizeTree() {
		let startingPoint = this.startingX;
		this.resizeWidths(this.treeRoot);
		if (this.treeRoot != null) {
			if (this.treeRoot.leftWidth > startingPoint) {
				startingPoint = this.treeRoot.leftWidth;
			} else if (this.treeRoot.rightWidth > startingPoint) {
				startingPoint = Math.max(
					this.treeRoot.leftWidth,
					2 * startingPoint - this.treeRoot.rightWidth
				);
			}
			this.setNewPositions(this.treeRoot, startingPoint, STARTING_Y, 0);
			this.animateNewPositions(this.treeRoot);
			this.cmd('Step');
		}
	}

	setNewPositions(tree, xPosition, yPosition, side) {
		if (tree != null) {
			tree.y = yPosition;
			if (side === -1) {
				xPosition = xPosition - tree.rightWidth;
			} else if (side === 1) {
				xPosition = xPosition + tree.leftWidth;
			}
			tree.x = xPosition;
			this.setNewPositions(tree.left, xPosition, yPosition + HEIGHT_DELTA, -1);
			this.setNewPositions(tree.right, xPosition, yPosition + HEIGHT_DELTA, 1);
		}
	}

	animateNewPositions(tree) {
		if (tree != null) {
			this.cmd('Move', tree.graphicID, tree.x, tree.y);
			this.animateNewPositions(tree.left);
			this.animateNewPositions(tree.right);
		}
	}

	resizeWidths(tree) {
		if (tree == null) {
			return 0;
		}
		tree.leftWidth = Math.max(this.resizeWidths(tree.left), WIDTH_DELTA / 2);
		tree.rightWidth = Math.max(this.resizeWidths(tree.right), WIDTH_DELTA / 2);
		return tree.leftWidth + tree.rightWidth;
	}

	disableUI() {
		this.insertField.disabled = true;
		this.insertButton.disabled = true;
		this.deleteField.disabled = true;
		this.deleteButton.disabled = true;
		this.findField.disabled = true;
		this.findButton.disabled = true;
		this.printButton.disabled = true;
	}

	enableUI() {
		this.insertField.disabled = false;
		this.insertButton.disabled = false;
		this.deleteField.disabled = false;
		this.deleteButton.disabled = false;
		this.findField.disabled = false;
		this.findButton.disabled = false;
		this.printButton.disabled = false;
	}
}

class BSTNode {
	constructor(val, id, initialX, initialY) {
		this.data = val;
		this.x = initialX;
		this.y = initialY;
		this.graphicID = id;
		this.left = null;
		this.right = null;
		this.parent = null;
	}

	isLeftChild() {
		if (this.parent == null) {
			return true;
		}
		return this.parent.left === this;
	}
}
