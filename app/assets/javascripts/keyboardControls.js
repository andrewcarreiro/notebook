'use strict';

/**
 * To add new keyboard controls, modify this function's return'
 * 
 * @returns
 */
function knownKeyboardControls () {
	/** default interpretation of keycodes to human-readable characters.*/
	var KEYCODES = {
		"n" : 78,
		"c" : 67,
		"u" : 85,
		"l" : 76,
		"i" : 73,
		"." : 190, // also >
		"," : 180 // also <
	};

	return [
		// N+c => new character form
		{
			"input" : [
				{ key : KEYCODES["n"], shiftKey : true, ctrlKey : false },
				{ key : KEYCODES["c"], shiftKey : false, ctrlKey : false }
			],
			"result" : () => {
				document.location.pathname = "/plan/characters/new";
			}
		},

		// N+u => new universe form
		{
			"input" : [
				{ key : KEYCODES["n"], shiftKey : true, ctrlKey : false },
				{ key : KEYCODES["u"], shiftKey : false, ctrlKey : false }
			],
			"result" : () => {
				document.location.pathname = "/plan/universes/new";
			}
		},

		// N+l => new location form
		{
			"input" : [
				{ key : KEYCODES["n"], shiftKey : true, ctrlKey : false },
				{ key : KEYCODES["l"], shiftKey : false, ctrlKey : false }
			],
			"result" : () => {
				document.location.pathname = "/plan/locations/new";
			}
		},

		// N+i => new item form
		{
			"input" : [
				{ key : KEYCODES["n"], shiftKey : true, ctrlKey : false },
				{ key : KEYCODES["i"], shiftKey : false, ctrlKey : false }
			],
			"result" : () => {
				document.location.pathname = "/plan/items/new";
			}
		}
	];
}


function keyboardControlManager ( keyboardControls ) {
	/**
	 * Listens to the keyboard events and pushes items into the stack
	 * 
	 * @param {KeyboardEvent} event
	 */
	function keyListener ( event ) {
		// must ignore modifier keys
		var ignored_keys = [
			16, // shift
			17, // osx control
			18, // osx alt/option
			91 // osx CMD / win CTRL
		];

		if( ignored_keys.indexOf(event.keyCode) !== -1 ){
			return;
		}

		// if not modifier, continue
		stackManager.add({
			"key" : event.keyCode, 
			"shiftKey" : event.shiftKey,
			"ctrlKey" : event.ctrlKey
		});
	}

	/**
	 * on every stack update, we compare against our keyboardControls object
	 * 
	 * @param {any} keyStackArray
	 * 
	 * @returns boolean;
	 */
	function onStackUpdate ( keyStackArray ){
		for ( var i in keyboardControls ){
			var kc = keyboardControls[i];
			
			if(_.isEqual(kc.input, keyStackArray)){
				kc.result();
				return true;	
			}
		};

		return false;
	}

	document.addEventListener("keyup", keyListener);
	var stackManager = new KeyboardControlStackManager(1000, onStackUpdate);
}

class KeyboardControlStackManager {
	/**
	 * Creates an instance of KeyboardControlStackManager.
	 * 
	 * @param {number} entryTime The time required between keypresses
	 * @param {function} stackEvaluationFunction the function to evaluate the stack once it's finalized. should return TRUE if a match is found
	 * 
	 * @memberOf KeyboardControlStackManager
	 */
	constructor ( entryTime, stackEvaluationFunction ) {
		this.entryTime = entryTime;
		this.timer = undefined;
		this.currentStack = [];
		this.stackEvaluationFunction = stackEvaluationFunction;
	}

	/**
	 * Adds an element to the currentStack
	 * 
	 * @param {{key : number, shiftKey : boolean, ctrlKey : boolean}} standardKeyStructure
	 * 
	 * @memberOf KeyboardControlStackManager
	 */
	add ( standardKeyStructure ) {
		this.currentStack.push( standardKeyStructure );
		if( this.timer ){ 
			clearTimeout(this.timer);
			this.timer = undefined; 
		}
		this.timer = setTimeout(() => {
			this.timerComplete();
		},this.entryTime);

		// if it's found, clear the timer & stack
		if(this.stackEvaluationFunction(this.currentStack)){
			this.timerComplete();
		} 
	}

	/**
	 * handles the completion of the timer and clears the stack
	 * 
	 * 
	 * @memberOf KeyboardControlStackManager
	 */
	timerComplete () {
		this.currentStack = [];
		this.timer = undefined;
	}

	
}

keyboardControlManager(knownKeyboardControls());