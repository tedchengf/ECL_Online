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
timeline.push(welcome_1);

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
timeline.push(welcome_2);

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
timeline.push(welcome_3);

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
timeline.push(welcome_4);

var trial = {
	type:jsPsychSurveyMultiSelect,
	preamble: function() {
		// Get all previous trials
		const past_trials = jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values();
		let history_html = '';
		
		if (past_trials.length > 0) {
			let history_rows = [];
			for (let i = 0; i < past_trials.length; i++) {
				const trial_data = past_trials[i];
				const pastValues = trial_data.response.Objects;
				const past_seq_id = pastValues[0] * pastValues[1];
				const past_truth = seq_truth[past_seq_id];
				
				history_rows.push(`
					<tr>
						<td style="text-align: right">${i+1}:</td>
						<td>
							<img class="past_stimuli" src="${objects_src[pastValues[0]]}">
							<img class="past_stimuli" src="${objects_src[pastValues[1]]}">
							-> ${past_truth ? 'explode' : 'not explode'}
						</td>
					</tr>
				`);
			}
			
			history_html = `
				<h3>Previous Trials:</h3>
				<table>
					${history_rows.join('')}
				</table>
			`;
		}

		return `
			<center>
				${history_html}
			</center>
		`;
	},
	questions: [
		{
			prompt: `<center><p class="stimuli">What two objects would you like to test?<br>Select two objects from the list below.</p></center>`,
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
			name: 'Objects'
		},
		{
			prompt: `<center><p class="stimuli">Make your prediction: Will the two objects explode?</p></center>`,
			options: [
				{ html: 'True (Yes, they will explode)', value: 'true' },
				{ html: 'False (No, they won\'t explode)', value: 'false' }
			],
			horizontal: true,
			required: true,
			name: 'prediction'
		}
	],
	required_selections: {
		Objects: 2,
		prediction: 1
	},
	button_label: "Submit Selection"
};

var output_trial = {
	type: jsPsychHtmlButtonResponse,
	stimulus: function(){
		const lastData = jsPsych.data.getLastTrialData().values()[0];
		const selectedValues = lastData.response.Objects;
		var seq_id = selectedValues[0] * selectedValues[1];
		var current_truth = seq_truth[seq_id];

		return `
			<center>
				<img class="stimuli" src="${objects_src[selectedValues[0]]}">
				<img class="stimuli" src="${objects_src[selectedValues[1]]}">
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


// // Set up objects
// document.getElementById('test').src = "src/rcw.png";


// var obj2 = document.getElementById("2")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/rcw.png"
// var obj3 = document.getElementById("3")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/rcd.png"
// var obj5 = document.getElementById("5")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/rtw.png"
// var obj7 = document.getElementById("7")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/rtd.png"
// var obj11 = document.getElementById("11")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/bcw.png"
// var obj13 = document.getElementById("13")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/bcd.png"
// var obj17 = document.getElementById("17")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/btw.png"
// var obj19 = document.getElementById("19")
// obj2.width = "50"
// obj2.height = "50"
// obj2.src = "src/btd.png"