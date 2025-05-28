//=============================================================================
//                                 INITIALIZATION
//=============================================================================

var jsPsych = initJsPsych({
	// on_finish: function() {
	// 	jsPsych.data.get().localSave('csv', 'experiment-data.csv');
	// }
});

/* create timeline */
var timeline = [];
var count = 0;

var preload = {
	type: jsPsychPreload,
	images: Object.values(objects_src),
	audio: [
		'src/Correct.wav',
		'src/Incorrect.wav',
	],
}
timeline.push(preload);

// Function to render history sidebar
function renderHistorySidebar(past_trials) {
	if (!past_trials || past_trials.length === 0) return '';
	
	let history_rows = [];
	for (let i = past_trials.length - 1; i > -1; i--) {
		const trial_data = past_trials[i];
		if (!trial_data.Obj1 || !trial_data.Obj2) continue;
		
		const past_Obj1 = trial_data.Obj1;
		const past_Obj2 = trial_data.Obj2;
		const past_truth = trial_data.truth;
		
		history_rows.push(`
			<div class="history-trial-container" style="background-color: ${past_truth ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)'}">
				<div style="display: flex; align-items: center; gap: 10px; height: 120px; width: 420px; margin: 0 auto;">
					<div style="display: flex; gap: 10px; flex: 3; justify-content: space-between; align-items: center; padding: 0 5px;">
						<img class="history-past-stimuli" src="${objects_src[past_Obj1]}" style="width: 100px; height: 100px; object-fit: contain;">
						<img class="history-past-stimuli" src="${objects_src[past_Obj2]}" style="width: 100px; height: 100px; object-fit: contain;">
					</div>
					<div style="width: 1px; height: 90%; background-color: #95a5a6; margin: 0 5px;"></div>
					<div style="display: flex; flex-direction: column; justify-content: flex-start; flex: 2; text-align: left; white-space: nowrap; padding: 0 10px;">
						<span style="font-size: 16px; text-align: left; margin-left: 0;">Trial ${trial_data.trial_number}</span>
						<br>
						<span style="color: ${past_truth ? '#e74c3c' : '#27ae60'}; font-weight: 500; font-size: 16px; text-align: left; margin-left: 0">
							${past_truth ? messages.feedback.explode : messages.feedback.notExplode}
						</span>
					</div>
				</div>
			</div>
		`);
	}
	
	return `
		<div id="history-sidebar" class="history-sidebar" style="transform: translateX(-100%); width: 450px;">
			<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
				<h3>Previous Trials:</h3>
			</div>
			${history_rows.join('')}
		</div>
	`;
}

//=============================================================================
//                                 WELCOME SCREENS
//=============================================================================

var welcome_1 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<h2>${messages.welcome.background.title}</h2>
		<p class="explanations">${messages.welcome.background.text}</p>
		</center>
	`,
	choices: [messages.buttons.continue]
};

var welcome_2 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<table>
			<tr>
				<td> <img class="stimuli" src="${objects_src[2]}"> </td>
				<td> <img class="stimuli" src="${objects_src[3]}"> </td>
				<td> <img class="stimuli" src="${objects_src[5]}"> </td>
				<td> <img class="stimuli" src="${objects_src[7]}"> </td>
			</tr>
			<tr>
				<td> <img class="stimuli" src="${objects_src[11]}"> </td>
				<td> <img class="stimuli" src="${objects_src[13]}"> </td>
				<td> <img class="stimuli" src="${objects_src[17]}"> </td>
				<td> <img class="stimuli" src="${objects_src[19]}"> </td>
			</tr>
		</table>
		<br>
		<p class="explanations">${messages.welcome.objects.text}</p>
		</center>
	`,
	choices: [messages.buttons.continue]
};

var welcome_3 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<table>
			<tr>
				<td> <img class="stimuli" src="${objects_src[2]}"> </td>
				<td> <img class="stimuli" src="${objects_src[7]}"> </td>
			</tr>
		</table>
		<br>
		<p class="explanations">${messages.welcome.pairs.text}</p>
		</center>
	`,
	choices: [messages.buttons.continue]
};

var welcome_4 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<p class="explanations">${messages.welcome.instructions.text}</p>
		</center>
	`,
	choices: [messages.buttons.beginPractice]
};

timeline.push(welcome_1, welcome_2, welcome_3, welcome_4);

//=============================================================================
//                                 PRACTICE PHASE
//=============================================================================

// Define instruction types
const INSTRUCTION_TYPES = {
	TRIAL: 'trial',
	OUTCOME: 'outcome',
	HISTORY_BUTTON: 'history-button',
	HISTORY_SIDEBAR: 'history-sidebar'
};

// Create a unified practice trial with configurable instructions
function createPracticeTrial(obj1_code, obj2_code, truth, instructions, index, total_trials) {
	return {
		type: jsPsychSurveyMultiSelect,
		preamble: function() {
			return `<h2>Practice Trial ${index + 1} of ${total_trials}</h2>`;
		},
		questions: [
			{
				prompt: `
					<center>
					<div class="trial-images" style="position: relative;">
						<img class="stimuli" src="${objects_src[obj1_code]}">
						<img class="stimuli" src="${objects_src[obj2_code]}">
						${instructions[INSTRUCTION_TYPES.TRIAL] ? `
							<div id="instruction-bubble" style="
								position: absolute;
								left: calc(100% + 20px);
								top: 50%;
								transform: translateY(-50%);
								background-color: white;
								border-radius: 8px;
								padding: 15px 20px;
								width: 300px;
								box-shadow: 0 2px 10px rgba(0,0,0,0.1);
								border-left: 4px solid #2980b9;
								animation: slideIn 0.3s ease-out;
								z-index: 1000;
								cursor: pointer;
								transition: opacity 0.3s ease-out;
							">
								<div style="
									position: absolute;
									left: -8px;
									top: 50%;
									transform: translateY(-50%);
									width: 16px;
									height: 16px;
									background-color: white;
									border-left: 4px solid #2980b9;
									border-bottom: 4px solid #2980b9;
									transform: translateY(-50%) rotate(45deg);
								"></div>
								<div style="
									color: #2c3e50;
									font-size: 15px;
									line-height: 1.4;
								">${instructions[INSTRUCTION_TYPES.TRIAL].text}</div>
							</div>
						` : ''}
					</div>
					<div style="
						width: calc(100% - 100px);
						height: 2px;
						background-color: #ddd;
						margin: 40px auto;
					"></div>
					<p class="stimuli">Will these two objects explode?</p>
					</center>
					<style>
						@keyframes slideIn {
							from {
								opacity: 0;
								transform: translateY(-50%) translateX(-10px);
							}
							to {
								opacity: 1;
								transform: translateY(-50%) translateX(0);
							}
						}
					</style>
				`,
				options: [
					{ html: '<div class="prediction-option">True (Yes, they will explode)</div>', value: 'true' },
					{ html: '<div class="prediction-option">False (No, they won\'t explode)</div>', value: 'false' }
				],
				horizontal: true,
				required: true,
				required_selections: 1,
				name: 'prediction',
				type: 'radio'
			}
		],
		button_label: "Submit Prediction",
		on_load: function() {
			if (instructions[INSTRUCTION_TYPES.TRIAL]) {
				// Create an overlay to prevent interaction
				const overlay = document.createElement('div');
				overlay.style.cssText = `
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: transparent;
					z-index: 999;
					pointer-events: none;
				`;
				document.body.appendChild(overlay);

				// Disable all interactive elements
				const disableElements = () => {
					const predictionOptions = document.querySelectorAll('.prediction-option');
					predictionOptions.forEach(option => {
						option.style.pointerEvents = 'none';
						option.style.opacity = '0.5';
					});

					const submitButton = document.querySelector('.jspsych-btn');
					if (submitButton) {
						submitButton.disabled = true;
						submitButton.style.opacity = '0.5';
						submitButton.style.pointerEvents = 'none';
					}

					const checkboxes = document.querySelectorAll('input[type="checkbox"]');
					checkboxes.forEach(checkbox => {
						checkbox.disabled = true;
					});
				};

				// Enable all interactive elements
				const enableElements = () => {
					const predictionOptions = document.querySelectorAll('.prediction-option');
					predictionOptions.forEach(option => {
						option.style.pointerEvents = 'auto';
						option.style.opacity = '1';
					});

					const submitButton = document.querySelector('.jspsych-btn');
					if (submitButton) {
						submitButton.disabled = false;
						submitButton.style.opacity = '1';
						submitButton.style.pointerEvents = 'auto';
					}

					const checkboxes = document.querySelectorAll('input[type="checkbox"]');
					checkboxes.forEach(checkbox => {
						checkbox.disabled = false;
					});
				};

				// Initially disable all elements
				disableElements();

				// Add click handler to the instruction bubble
				const instructionBubble = document.getElementById('instruction-bubble');
				if (instructionBubble) {
					instructionBubble.addEventListener('click', function() {
						this.style.opacity = '0';
						overlay.remove();
						setTimeout(() => {
							enableElements();
						}, 300);
					});
				}
			}

			// Add event listeners to the checkboxes
			const checkboxes = document.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach(checkbox => {
				checkbox.addEventListener('change', function() {
					if (this.checked) {
						checkboxes.forEach(otherCheckbox => {
							if (otherCheckbox !== this) {
								otherCheckbox.checked = false;
							}
						});
					}
				});
			});
		},
		on_finish: function(data) {
			data.Obj1 = obj1_code;
			data.Obj2 = obj2_code;
			data.prediction = data.response.prediction[0] === 'true';
			data.truth = truth;
			data.is_correct = data.prediction === truth;
			data.trial_number = index + 1;
			data.is_practice = true;
			data.instructions = instructions;
		}
	};
}

// Create a unified practice output trial with configurable instructions
function createPracticeOutputTrial(instructions) {
	return {
		type: jsPsychHtmlButtonResponse,
		stimulus: function() {
			const lastTrialData = jsPsych.data.getLastTrialData();
			const lastTrial = lastTrialData.values()[0];
			
			if (!lastTrial) {
				console.error('No trial data found');
				return 'Error: No trial data found';
			}

			const obj1_code = lastTrial.Obj1;
			const obj2_code = lastTrial.Obj2;
			const prediction = lastTrial.prediction;
			const truth = lastTrial.truth;
			const isCorrect = prediction === truth;

			// Play feedback sound
			const audio = new Audio(isCorrect ? 'src/Correct.wav' : 'src/Incorrect.wav');
			audio.play();

			// Get all previous trials and render history
			const past_trials = jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values();
			const history_html = renderHistorySidebar(past_trials);

			return `
				<div class="outcome-trial-container">
					${history_html}
					<div id="history-main" class="history-main">
						<button id="toggle-history" class="history-toggle-btn">Show History</button>
						<center>
							<h2 style="width: 60%; text-align: center;">Practice Outcome</h2>
							<div class="trial-images">
								<img class="stimuli" src="${objects_src[obj1_code]}">
								<img class="stimuli" src="${objects_src[obj2_code]}">
							</div>
							<div style="
								width: calc(100% - 100px);
								height: 2px;
								background-color: transparent;
								margin: 40px auto;
							"></div>
							<div style="margin: 20px 0;">
								<div style="
									font-size: 20px;
									margin-top: 10px;
									margin-bottom: 10px;
									color: ${isCorrect ? '#27ae60' : '#e74c3c'};
									font-weight: 500;
								">
									${isCorrect ? messages.feedback.correct : messages.feedback.incorrect}
								</div>
								<table style="margin: 20px auto; border-collapse: separate; border-spacing: 20px 0;">
									<tr>
										<td style="text-align: right; font-size: 18px;">Your prediction:</td>
										<td style="text-align: left;">
											<span style="color: ${prediction ? '#e74c3c' : '#27ae60'}; font-size: 18px;">
												${prediction ? messages.feedback.explode : messages.feedback.notExplode}
											</span>
										</td>
									</tr>
									<tr>
										<td style="text-align: right; font-size: 18px;">Actual outcome:</td>
										<td style="text-align: left;">
											<span style="color: ${truth ? '#e74c3c' : '#27ae60'}; font-size: 18px;">
												${truth ? messages.feedback.explode : messages.feedback.notExplode}
											</span>
										</td>
									</tr>
								</table>
							</div>
						</center>
					</div>
				</div>
				<style>
					@keyframes slideIn {
						from {
							opacity: 0;
							transform: translateY(-50%) translateX(-10px);
						}
						to {
							opacity: 1;
							transform: translateY(-50%) translateX(0);
						}
					}
					@keyframes slideInFromRight {
						from {
							opacity: 0;
							transform: translateX(20px);
						}
						to {
							opacity: 1;
							transform: translateX(0);
						}
					}
				</style>
			`;
		},
		choices: ["Continue"],
		on_load: function() {
			const continueButton = document.querySelector('.jspsych-btn');
			
			// Check if there are any instructions to show
			const hasInstructions = Object.values(instructions).some(i => i);
			
			// If no instructions, enable continue button immediately
			if (!hasInstructions) {
				if (continueButton) {
					continueButton.disabled = false;
					continueButton.style.opacity = '1';
					continueButton.style.pointerEvents = 'auto';
				}
				return;
			}

			// Disable continue button initially only if we have instructions
			if (continueButton) {
				continueButton.disabled = true;
				continueButton.style.opacity = '0.5';
				continueButton.style.pointerEvents = 'none';
			}

			let currentInstruction = 0;
			let historyButtonClicked = false;
			let currentBubble = null;

			// Add history button click handler
			const historyButton = document.querySelector('.history-toggle-btn');
			if (historyButton) {
				// Initially disable the history button if we have history button instructions
				if (instructions[INSTRUCTION_TYPES.HISTORY_BUTTON]) {
					historyButton.disabled = true;
					historyButton.style.opacity = '0.5';
					historyButton.style.pointerEvents = 'none';
				}

				historyButton.addEventListener('click', () => {
					const sidebar = document.getElementById('history-sidebar');
					const main = document.getElementById('history-main');
					if (sidebar && main) {
						const isHidden = sidebar.style.transform === 'translateX(-100%)' || !sidebar.style.transform;
						sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
						main.style.marginLeft = isHidden ? '25vw' : '0';
						historyButton.textContent = isHidden ? 'Hide History' : 'Show History';
						
						// Adjust continue button margin
						if (continueButton) {
							continueButton.style.marginLeft = isHidden ? '25vw' : '0';
						}
						
						// Only show the instruction when opening the panel
						if (isHidden) {
							// Wait for the transition to complete (300ms matches the CSS transition duration)
							setTimeout(() => {
								historyButtonClicked = true;
								showNextInstruction(); // Show the history-sidebar instruction after panel is shown
							}, 300);
						}
					}
				});
			}

			// Create instruction bubble function
			const createInstructionBubble = (text, position) => {
				const bubble = document.createElement('div');
				bubble.style.cssText = `
					position: absolute;
					background-color: white;
					border-radius: 8px;
					padding: 15px 20px;
					width: 300px;
					box-shadow: 0 2px 10px rgba(0,0,0,0.1);
					border-left: 4px solid #2980b9;
					animation: slideIn 0.3s ease-out;
					z-index: 1000;
					cursor: pointer;
					transition: opacity 0.3s ease-out;
				`;

				// Position the bubble
				if (position === INSTRUCTION_TYPES.OUTCOME) {
					bubble.style.left = 'calc(50% + 200px)';
					bubble.style.top = 'calc(50% + 150px)';
					bubble.style.transform = 'translateY(-50%)';
				} else if (position === INSTRUCTION_TYPES.HISTORY_BUTTON) {
					bubble.style.right = '30px';
					bubble.style.top = '75px';
					bubble.style.transform = 'none';
					bubble.style.borderLeft = 'none';
					bubble.style.borderTop = '4px solid #2980b9';
					bubble.style.animation = 'slideInFromRight 0.3s ease-out';
				} else if (position === INSTRUCTION_TYPES.HISTORY_SIDEBAR) {
					bubble.style.left = 'calc(25vw + 20px)';
					bubble.style.top = '50%';
					bubble.style.transform = 'translateY(-50%)';
				}

				// Add pointer or protrusion based on position
				if (position === INSTRUCTION_TYPES.OUTCOME || position === INSTRUCTION_TYPES.HISTORY_SIDEBAR) {
					const pointer = document.createElement('div');
					pointer.style.cssText = `
						position: absolute;
						left: -8px;
						top: 50%;
						width: 16px;
						height: 16px;
						background-color: white;
						border-left: 4px solid #2980b9;
						border-bottom: 4px solid #2980b9;
						transform: translateY(-50%) rotate(45deg);
					`;
					bubble.appendChild(pointer);
				} else if (position === INSTRUCTION_TYPES.HISTORY_BUTTON) {
					const protrusion = document.createElement('div');
					protrusion.style.cssText = `
						position: absolute;
						top: -8px;
						right: 20px;
						width: 16px;
						height: 16px;
						background-color: white;
						border-top: 4px solid #2980b9;
						border-right: 4px solid #2980b9;
						transform: rotate(-45deg);
					`;
					bubble.appendChild(protrusion);
				}

				// Add content
				const content = document.createElement('div');
				content.style.cssText = `
					color: #2c3e50;
					font-size: 15px;
					line-height: 1.4;
				`;
				content.innerHTML = text;
				bubble.appendChild(content);

				// Add click handler to enable history button if this is the history button instruction
				if (position === INSTRUCTION_TYPES.HISTORY_BUTTON) {
					bubble.addEventListener('click', () => {
						if (historyButton) {
							historyButton.disabled = false;
							historyButton.style.opacity = '1';
							historyButton.style.pointerEvents = 'auto';
						}
					});
				}

				return bubble;
			};

			// Function to show next instruction
			const showNextInstruction = () => {
				const instructionTypes = [
					INSTRUCTION_TYPES.OUTCOME,
					INSTRUCTION_TYPES.HISTORY_BUTTON,
					INSTRUCTION_TYPES.HISTORY_SIDEBAR
				];

				while (currentInstruction < instructionTypes.length) {
					const type = instructionTypes[currentInstruction];
					const instruction = instructions[type];
					
					// Skip if no instruction for this type
					if (!instruction) {
						currentInstruction++;
						continue;
					}

					// Skip the history-sidebar instruction if we haven't clicked the history button yet
					if (type === INSTRUCTION_TYPES.HISTORY_SIDEBAR && !historyButtonClicked) {
						return;
					}

					// Remove previous bubble if it exists
					if (currentBubble) {
						currentBubble.remove();
					}

					currentBubble = createInstructionBubble(instruction.text, type);
					document.body.appendChild(currentBubble);

					currentBubble.addEventListener('click', () => {
						currentBubble.style.opacity = '0';
						setTimeout(() => {
							currentBubble.remove();
							currentBubble = null;
							currentInstruction++;
							
							// Check if we've shown all instructions
							const remainingInstructions = instructionTypes.slice(currentInstruction)
								.some(type => instructions[type]);
							
							if (!remainingInstructions) {
								// Enable continue button after last instruction
								if (continueButton) {
									continueButton.disabled = false;
									continueButton.style.opacity = '1';
									continueButton.style.pointerEvents = 'auto';
								}
							} else {
								showNextInstruction();
							}
						}, 300);
					});
					return;
				}

				// If we've gone through all instructions, enable continue button
				if (continueButton) {
					continueButton.disabled = false;
					continueButton.style.opacity = '1';
					continueButton.style.pointerEvents = 'auto';
				}
			};

			// Start showing instructions
			showNextInstruction();
		}
	};
}

// Define specific practice pairs with their outcomes and instructions
const practice_pairs = [
	{ 
		obj1: 2, 
		obj2: 17, 
		truth: false,
		instructions: {
			[INSTRUCTION_TYPES.TRIAL]: {
				text: `These two objects are both red circles. When two objects share the same color and shape, they will explode!`
			},
			[INSTRUCTION_TYPES.OUTCOME]: {
				text: `Here you can see if your prediction was correct. The actual outcome is shown below your prediction.`
			},
		}
	},
	{ 
		obj1: 17, 
		obj2: 2, 
		truth: false,
		instructions: {
			[INSTRUCTION_TYPES.HISTORY_BUTTON]: {
				text: `You can use the history to compare this trial with previous ones and confirm the pattern.`
			},
			[INSTRUCTION_TYPES.HISTORY_SIDEBAR]: {
				text: `The history panel helps you see the <strong>stimuli</strong> and the <strong>actual outcomes</strong> of all previous trials. <br><br>Note that the two trials share the same object but different order. This is because <strong>the order of objects does not matter in our experiment</strong>.`
			}
		}
	}
];

// Add all practice trials and their output trials to the timeline
practice_pairs.forEach((pair, index) => {
	timeline.push(createPracticeTrial(pair.obj1, pair.obj2, pair.truth, pair.instructions, index, practice_pairs.length));
	timeline.push(createPracticeOutputTrial(pair.instructions));
});

// Add transition to training
var training_instruction = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<h2>${messages.practice.complete.title}</h2>
		<p class="explanations">${messages.practice.complete.text}</p>
		</center>
	`,
	choices: [messages.buttons.beginExperiment],
	on_load: function() {
		// Clear all practice trial data
		jsPsych.data.reset();
	}
};
timeline.push(training_instruction);

//=============================================================================
//                                 Training Phase
//=============================================================================

// Define the trial structure as a function
function createTrial(obj1_code, obj2_code, index, total_trials) {
	return {
		type: jsPsychSurveyMultiSelect,
		preamble: function() {
			return `<h2>Trial ${index + 1} of ${total_trials}</h2>`;
		},
		questions: [
			{
				prompt: `
					<center>
					<div class="trial-images">
							<img class="stimuli" src="${objects_src[obj1_code]}">
							<img class="stimuli" src="${objects_src[obj2_code]}">
						</div>
						<div style="
							width: 100%;
							height: 2px;
							background-color: #ddd;
							margin: 40px auto;
						"></div>
						<p class="stimuli">Will these two objects explode?</p>
					</center>
				`,
				options: [
					{ html: '<div class="prediction-option">True (Yes, they will explode)</div>', value: 'true' },
					{ html: '<div class="prediction-option">False (No, they won\'t explode)</div>', value: 'false' }
				],
				horizontal: true,
				required: true,
				required_selections: 1,
				name: 'prediction',
				type: 'radio'
			}
		],
		button_label: "Submit Prediction",
		on_load: function() {
			// Add event listeners to the checkboxes
			const checkboxes = document.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach(checkbox => {
				checkbox.addEventListener('change', function() {
					// If this checkbox is being checked
					if (this.checked) {
						// Uncheck all other checkboxes
						checkboxes.forEach(otherCheckbox => {
							if (otherCheckbox !== this) {
								otherCheckbox.checked = false;
							}
						});
					}
				});
			});
		},
		on_finish: function(data) {
			const seq_id = obj1_code * obj2_code;
			const truth = seq_truth[seq_id];
			
			data.Obj1 = obj1_code;
			data.Obj2 = obj2_code;
			data.prediction = data.response.prediction[0] === 'true';  // Convert string to boolean
			data.truth = truth;  // Add the actual outcome
			data.is_correct = data.prediction === truth;  // Add whether the prediction was correct
			data.trial_number = index + 1;
			console.log('Trial data stored:', data);
		}
	};
}

function createOutputTrial() {
	return {
		type: jsPsychHtmlButtonResponse,
		stimulus: function() {
			const lastTrialData = jsPsych.data.getLastTrialData();
			const lastTrial = lastTrialData.values()[0];
			
			if (!lastTrial) {
				console.error('No trial data found');
				return 'Error: No trial data found';
			}

			const obj1_code = lastTrial.Obj1;
			const obj2_code = lastTrial.Obj2;
			const prediction = lastTrial.prediction;
			const seq_id = obj1_code * obj2_code;
			const truth = seq_truth[seq_id];
			const isCorrect = prediction === truth;

			// Play feedback sound
			const audio = new Audio(isCorrect ? 'src/Correct.wav' : 'src/Incorrect.wav');
			audio.play();

			// Get all previous trials and render history
			const past_trials = jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values();
			const history_html = renderHistorySidebar(past_trials);

			return `
				<div class="outcome-trial-container">
					${history_html}
					<div id="history-main" class="history-main" style="margin-left: 0;">
						<button id="toggle-history" class="history-toggle-btn">Show History</button>
						<center>
							<h2 style="width: 60%; text-align: center;">Outcome</h2>
							<div class="trial-images">
								<img class="stimuli" src="${objects_src[obj1_code]}">
								<img class="stimuli" src="${objects_src[obj2_code]}">
							</div>
							<div style="
								width: calc(100% - 100px);
								height: 2px;
								background-color: transparent;
								margin: 40px auto;
							"></div>
							<div style="margin: 20px 0;">
								<div style="
									font-size: 20px;
									margin-top: 10px;
									margin-bottom: 10px;
									color: ${isCorrect ? '#27ae60' : '#e74c3c'};
									font-weight: 500;
								">
									${isCorrect ? messages.feedback.correct : messages.feedback.incorrect}
								</div>
								<table style="margin: 20px auto; border-collapse: separate; border-spacing: 20px 0;">
									<tr>
										<td style="text-align: right; font-size: 18px;">Your prediction:</td>
										<td style="text-align: left;">
											<span style="color: ${prediction ? '#e74c3c' : '#27ae60'}; font-size: 18px;">
												${prediction ? messages.feedback.explode : messages.feedback.notExplode}
											</span>
										</td>
									</tr>
									<tr>
										<td style="text-align: right; font-size: 18px;">Actual outcome:</td>
										<td style="text-align: left;">
											<span style="color: ${truth ? '#e74c3c' : '#27ae60'}; font-size: 18px;">
												${truth ? messages.feedback.explode : messages.feedback.notExplode}
											</span>
										</td>
									</tr>
								</table>
							</div>
						</center>
					</div>
				</div>
			`;
		},
		choices: ["Continue"],
		on_load: function() {
			const toggleButton = document.getElementById('toggle-history');
			const sidebar = document.getElementById('history-sidebar');
			const form = document.getElementById('history-main');
			const continueButton = document.querySelector('.jspsych-btn');
			
			if (toggleButton && sidebar && form) {
				toggleButton.addEventListener('click', function() {
					const isHidden = sidebar.style.transform === 'translateX(-100%)' || !sidebar.style.transform;
					sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
					form.style.marginLeft = isHidden ? '25vw' : '0';
					toggleButton.textContent = isHidden ? 'Hide History' : 'Show History';
					
					// Adjust continue button margin
					if (continueButton) {
						continueButton.style.marginLeft = isHidden ? '25vw' : '0';
					}

					// Log history access
					if (isHidden) {  // Only log when showing history
						// Log current trial access
						jsPsych.data.addDataToLastTrial({
							history_accessed_this_trial: true
						});

						// Log first-ever access
						if (!history_ever_accessed) {
							history_ever_accessed = true;
							jsPsych.data.addDataToLastTrial({
								history_first_access: true,
								history_first_access_time: new Date().toISOString(),
								history_first_access_trial: count
							});
						}
					}
				});
			}
		}
	};
}

// Randomize the order of object pairs for training
const training_pairs = jsPsych.randomization.shuffle([...object_pairs]);

// Add all training trials and their output trials to the timeline
training_pairs.forEach(([obj1_code, obj2_code], index) => {
	timeline.push(createTrial(obj1_code, obj2_code, index, training_pairs.length));
	timeline.push(createOutputTrial());
});

// Add test instruction
var test_instruction = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<h2>${messages.test.instruction.title}</h2>
		<p class="explanations">${messages.test.instruction.text}</p>
		</center>
	`,
	choices: [messages.buttons.beginTest]
};
timeline.push(test_instruction);

// Randomize the order of object pairs for testing
const test_pairs = jsPsych.randomization.shuffle([...object_pairs]);

// Add all test trials to the timeline (without output trials)
test_pairs.forEach(([obj1_code, obj2_code], index) => {
	timeline.push(createTrial(obj1_code, obj2_code, index, test_pairs.length));
});

// Add CSV export trial
var export_trial = {
	type: jsPsychHtmlButtonResponse,
	stimulus: function() {
		// Save the data
		jsPsych.data.get().localSave('csv', 'experiment-data.csv');
		
		return `
			<div style="text-align: center;">
				<h2>${messages.completion.title}</h2>
				<p>${messages.completion.text}</p>
			</div>
		`;
	},
	choices: [messages.buttons.close],
	button_html: `<button class="jspsych-btn" style="background-color: #2980b9; color: white; padding: 15px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 20px;">${messages.buttons.close}</button>`
};

timeline.push(export_trial);

jsPsych.run(timeline);