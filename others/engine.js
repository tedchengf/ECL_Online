/* initialize jsPsych */
var jsPsych = initJsPsych();

/* create timeline */
var timeline = [];
var count = 0;


var seq_truth = {
	4: true,
	6: true,
	10: true,
	14: true,
	22: true,
	26: true,
	34: false,
	38: false,
	9: true,
	15: true,
	21: true,
	33: true,
	39: true,
	51: false,
	57: false,
	25: false,
	35: false,
	55: true,
	65: true,
	85: false,
	95: false,
	49: false,
	77: true,
	91: true,
	119: false,
	133: false,
	121: false,
	143: false,
	187: false,
	209: false,
	169: false,
	221: false,
	247: false,
	289: false,
	323: false,
	361: false
};

var objects_src = {
	2: 'src/rcw.png',
	3: 'src/bcw.png',
	5: 'src/rtw.png',
	7: 'src/btw.png',
	11: 'src/rcd.png',
	13: 'src/bcd.png',	
	17: 'src/rtd.png',
	19: 'src/btd.png',
}

var preload = {
	type: jsPsychPreload,
	images: Object.values(objects_src),
	audio: [
		'src/Correct.wav',
		'src/Incorrect.wav',
	],
}
timeline.push(preload);


var welcome_1 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<h2>Background</h2>
		<p class="explanations">You are a newly employed physicist in the Deep Rock Corporate, and are assigned to the F-302 lab to investigate a group of exotic objects. The objects resemble simple geometric shapes and are otherwise unimpressive. However, an earlier report indicates that these objects contain a tremendous amount of energy, but will only release the energy (through an explosion) when they are arranged in a certain combination with other objects. .</p>
		<br>
		<p class="explanations">You are a newly hired physicist, and your first task is to investigate these objects and find out when will they explode.</p>
		</center>
	`,
	choices: ["Continue"]
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
		<p class="explanations">Above are the 8 subjects currently being investigated. These objects differ in their colors (red/blue), shapes (circle/triangle), and textures (dots/waves). </p>
		</center>
	`,
	choices: ["Continue"]
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
		<p class="explanations">When two objects are put together (shown above), they sometimes explode. However, the exact rule behind triggering the explosion is unknown. Currently, we know that the order of the objects (left/right) does not matter, and explosions are triggered only some combination of features among the two objects. It is your task to figure out this rule. </p>
		</center>
	`,
	choices: ["Continue"]
};

var welcome_4 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<p class="explanations">This is a self-paced experiment. In each trial, you can select two objects for testing. You need to submit your prediction of the outcome (explode/not explode) before getting to see the actual outcome.</p>
		<br>
		<p class="explanations">At the start you will just have to guess, but over time you should detect some patterns. When you are confident that you get the rule, you can end the experiment and demonstrate your knowledge through a test block.</p>
		</center>
	`,
	choices: ["I'm Ready"]
};

// timeline.push(welcome_1, welcome_2, welcome_3, welcome_4)

var trial = {
	type:jsPsychSurveyMultiSelect,
	preamble: function() {
		return `
				<h2>Trial ${jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values().length + 1}</h2>
		`;
	},
	sliders: function() {
		// Get all previous trials
		const past_trials = jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values();
		let history_html = '';
		if (past_trials.length > 0) {
			let history_rows = [];
			for (let i = 0; i < past_trials.length; i++) {
				const trial_data = past_trials[i];
				const past_Obj1 = trial_data.response.Obj1;
				const past_Obj2 = trial_data.response.Obj2
				const past_seq_id = past_Obj1 * past_Obj2;
				const past_truth = seq_truth[past_seq_id];
				
				history_rows.push(`
					<div class="trial-container" style="background-color: ${past_truth ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)'}">
						<div class="trial-outcome">
							<div style="display: flex; justify-content: space-between;">
								Trial ${i+1} 
								<span style="color: ${past_truth ? '#e74c3c' : '#27ae60'}; font-weight: 500;">
									${past_truth ? 'explode' : 'not explode'}
								</span>
							</div>
						</div>
						<div style="height: 10px;"></div>
						<div class="trial-images">
							<img class="past_stimuli" src="${objects_src[past_Obj1]}">
							<img class="past_stimuli" src="${objects_src[past_Obj2]}">
						</div>
					</div>
				`);
			}
			
			history_html = `
				<h3>Previous Trials:</h3>
				${history_rows.join('')}
			`;
		}

		return history_html;
	},
	questions: [
		{
			prompt: `<center><p class="stimuli">Select the first object you would like to test</p></center>`,
			options: [
				{ html: `<img class="symbols" src="${objects_src[2]}">`, value: 2 },
				{ html: `<img class="symbols" src="${objects_src[3]}">`, value: 3 },
				{ html: `<img class="symbols" src="${objects_src[5]}">`, value: 5 },
				{ html: `<img class="symbols" src="${objects_src[7]}">`, value: 7 },
				{ html: `<img class="symbols" src="${objects_src[11]}">`, value: 11 },
				{ html: `<img class="symbols" src="${objects_src[13]}">`, value: 13 },
				{ html: `<img class="symbols" src="${objects_src[17]}">`, value: 17 },
				{ html: `<img class="symbols" src="${objects_src[19]}">`, value: 19 },
			],
			horizontal: true,
			required: true,
			required_selections: 1,
			name: 'Obj1',
		},
		{
			prompt: `<center><p class="stimuli">Select the second object you would like to test</p></center>`,
			options: [
				{ html: `<img class="symbols" src="${objects_src[2]}">`, value: 2 },
				{ html: `<img class="symbols" src="${objects_src[3]}">`, value: 3 },
				{ html: `<img class="symbols" src="${objects_src[5]}">`, value: 5 },
				{ html: `<img class="symbols" src="${objects_src[7]}">`, value: 7 },
				{ html: `<img class="symbols" src="${objects_src[11]}">`, value: 11 },
				{ html: `<img class="symbols" src="${objects_src[13]}">`, value: 13 },
				{ html: `<img class="symbols" src="${objects_src[17]}">`, value: 17 },
				{ html: `<img class="symbols" src="${objects_src[19]}">`, value: 19 },
			],
			horizontal: true,
			required: true,
			required_selections: 1,
			name: 'Obj2',
		},
		{
			prompt: `<center><p class="stimuli">Make your prediction: Will the two objects explode?</p></center>`,
			options: [
				{ html: '<div class="prediction-option">True (Yes, they will explode)</div>', value: 'true' },
				{ html: '<div class="prediction-option">False (No, they won\'t explode)</div>', value: 'false' }
			],
			horizontal: true,
			required: true,
			required_selections: 1,
			name: 'prediction',
		}
	],
	button_label: "Submit Selection"
};

var output_trial = {
	type: jsPsychHtmlButtonResponse,
	stimulus: function(){
		const lastData = jsPsych.data.getLastTrialData().values()[0];
		const Obj1 = lastData.response.Obj1;
		const Obj2 = lastData.response.Obj2;
		var seq_id = Obj1 * Obj2;
		var current_truth = seq_truth[seq_id];

		return `
			<center>
				<img class="stimuli" src="${objects_src[Obj1]}">
				<img class="stimuli" src="${objects_src[Obj2]}">
				<br>
				Prediction: ${lastData.response.prediction ? 'explode' : 'not explode'} <br>
				Truth: ${current_truth ? 'explode' : 'not explode'}
			</center>
			`;
	},
	choices: ["Continue", "I'm done"]
};

var loop_node = {
    timeline: [trial, output_trial],
    loop_function: function(data, c = count){
      //console.log(c)
        if(c > 36 || data["trials"][1]["response"] == 1){
            return false;
        } 
		else {
        	count = count+1
            return true;
        }
    }
}

timeline.push(loop_node);

jsPsych.run(timeline);